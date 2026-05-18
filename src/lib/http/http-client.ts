import { resolveDeviceInfo } from '@/lib/device'
import { propagation, context } from '@opentelemetry/api'

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

/**
 * Middleware OTel: injeta W3C TraceContext (traceparent, tracestate, baggage)
 * em todas as requisições feitas via httpClient, quando há um span ativo.
 *
 * - NoOp quando OTel não está inicializado (propagation é NoOp por padrão)
 * - NoOp quando não há span ativo no contexto (ex: ROOT_CONTEXT sem traceID)
 * - SSR-safe: a @opentelemetry/api nunca acessa window
 */
httpClient.use(async (ctx, next) => {
  const carrier: Record<string, string> = {}
  propagation.inject(context.active(), carrier)

  if (Object.keys(carrier).length > 0) {
    ctx.init.headers = { ...ctx.init.headers, ...carrier }
  }

  return next()
})
