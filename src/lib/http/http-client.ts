import { resolveDeviceInfo } from '@/lib/device'
import { type Attributes, propagation, context, trace, SpanKind } from '@opentelemetry/api'

// Campos que nunca devem aparecer em traces (PII / credenciais)
const SENSITIVE_KEYS = new Set([
  'password', 'senha', 'token', 'secret', 'key', 'auth',
  'credential', 'authorization', 'cvv', 'card', 'cpf', 'ssn',
])

/**
 * Extrai campos primitivos do corpo JSON como atributos de span.
 * Campos sensíveis (password, token, etc.) são ignorados automaticamente.
 */
function extractBodyAttributes(body: BodyInit | null | undefined): Attributes {
  if (typeof body !== 'string') return {}
  try {
    const parsed: unknown = JSON.parse(body)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}

    const attrs: Attributes = {}
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(k.toLowerCase())) continue
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        attrs[`http.request.body.${k}`] = v
      }
    }
    return attrs
  } catch {
    return {}
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface RequestContext {
  url: string
  init: RequestInit
}

/** Função de próximo middleware — avança para o próximo elo da cadeia. */
export type NextFn = () => Promise<Response>

/**
 * Middleware HTTP no padrão chain-of-responsibility.
 * Recebe o contexto mutável e `next` para delegar ao próximo middleware.
 * O último elo da cadeia executa o `fetch` real.
 *
 * Exemplo:
 *   httpClient.use(async (ctx, next) => {
 *     ctx.init.headers = { ...ctx.init.headers, 'x-custom': 'value' }
 *     return next()
 *   })
 */
export type HttpMiddleware = (ctx: RequestContext, next: NextFn) => Promise<Response>

// ─── HttpClient ───────────────────────────────────────────────────────────────

class HttpClient {
  private readonly middlewares: HttpMiddleware[] = []

  /** Registra um middleware na pipeline. A ordem de registro é a ordem de execução. */
  use(middleware: HttpMiddleware): this {
    this.middlewares.push(middleware)
    return this
  }

  /** Executa a pipeline de middlewares e dispara o fetch real ao final. */
  async fetch(url: string, init: RequestInit = {}): Promise<Response> {
    const ctx: RequestContext = { url, init: { ...init } }

    const execute = (index: number): Promise<Response> => {
      if (index < this.middlewares.length) {
        return this.middlewares[index](ctx, () => execute(index + 1))
      }
      return fetch(ctx.url, ctx.init)
    }

    return execute(0)
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const httpClient = new HttpClient()

// ─── Middlewares padrão ───────────────────────────────────────────────────────

/**
 * Middleware OTel: cria um span HTTP CLIENT para cada requisição e injeta
 * W3C TraceContext (traceparent, tracestate, baggage) nos headers.
 *
 * Diferente da abordagem anterior (que dependia de um span já ativo via
 * startActiveSpan + StackContextManager), este middleware CRIA o próprio span
 * — garantindo que traceparent seja injetado mesmo sem contexto ativo.
 *
 * - NoOp quando OTel não inicializado: trace.getTracer() retorna NoOp tracer,
 *   startSpan() retorna NoOp span, propagation.inject() não injeta nada
 * - Se há span ativo (ex: waitlist.ts usa startActiveSpan), o span criado
 *   aqui vira filho desse span automaticamente via context.active()
 * - SSR-safe: @opentelemetry/api é NoOp no servidor (sem provider registrado)
 */
httpClient.use((ctx, next) => {
  const tracer = trace.getTracer('ipysy-frontend')

  // Cria span HTTP CLIENT — pai é o span ativo (se houver), caso contrário root
  const bodyAttrs = extractBodyAttributes(ctx.init.body)
  const span = tracer.startSpan(
    `HTTP ${(ctx.init.method ?? 'GET').toUpperCase()} ${ctx.url}`,
    { kind: SpanKind.CLIENT, attributes: bodyAttrs },
    context.active(),
  )

  // Injeta traceparent/baggage a partir do contexto que contém o span criado
  const ctxWithSpan = trace.setSpan(context.active(), span)
  const carrier: Record<string, string> = {}
  propagation.inject(ctxWithSpan, carrier)

  if (Object.keys(carrier).length > 0) {
    ctx.init.headers = { ...ctx.init.headers, ...carrier }
  }

  // Finaliza o span após o fetch (sucesso ou erro)
  return next().then(
    (response) => {
      span.setAttribute('http.status_code', response.status)
      span.end()
      return response
    },
    (error) => {
      span.recordException(error as Error)
      span.end()
      throw error
    },
  )
})

/**
 * Injeta automaticamente o header `device-info` em todas as requisições
 * feitas via `httpClient.fetch`, usando o provider registrado em `device-info.ts`.
 *
 * - Web:     `WebDeviceInfoProvider` auto-registrado (browser only)
 * - Android/iOS: registre `NativeDeviceInfoProvider` no ponto de entrada do app
 * - SSR/Node: nenhum provider ativo → header omitido
 */
let cachedDeviceInfo: string | null = null

httpClient.use(async (ctx, next) => {
  if (!cachedDeviceInfo) {
    const info = await resolveDeviceInfo()
    if (info) cachedDeviceInfo = JSON.stringify(info)
  }

  if (cachedDeviceInfo) {
    ctx.init.headers = {
      ...ctx.init.headers,
      'device-info': cachedDeviceInfo,
    }
  }

  return next()
})
