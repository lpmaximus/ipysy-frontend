import type { Context } from '@opentelemetry/api'
import { propagation, context, trace } from '@opentelemetry/api'
import { WebTracerProvider, SimpleSpanProcessor, StackContextManager } from '@opentelemetry/sdk-trace-web'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { W3CTraceContextPropagator, W3CBaggagePropagator, CompositePropagator } from '@opentelemetry/core'
import { Resource } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'

// ─── Inicialização singleton ───────────────────────────────────────────────────

let initialized = false

/**
 * Inicializa o OpenTelemetry SDK Web no browser.
 *
 * - Ativo apenas em produção (NEXT_PUBLIC_ENVIRONMENT === 'production')
 * - Exporta via OTLP HTTP para o proxy BFF → otel-collector → SigNoz
 * - Propaga W3C TraceContext (`traceparent`) em todas as requisições fetch via
 *   FetchInstrumentation (monkey-patch de window.fetch) + middleware manual no httpClient
 * - Seguro para chamar múltiplas vezes (idempotente)
 *
 * Diagrama de fluxo:
 *   Browser span → POST /api/telemetry/traces → otel-collector:4318 → SigNoz
 *   fetch + traceparent → BFF Route Handler → Java Gateway (span linkado)
 */
export function initOtel(): void {
  if (initialized || typeof window === 'undefined') return
  if (process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production') return

  initialized = true

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: 'ipysy-frontend',
    [ATTR_SERVICE_VERSION]: process.env.NEXT_PUBLIC_VERSION ?? '0.0.1-dev',
    'deployment.environment': process.env.NEXT_PUBLIC_ENVIRONMENT,
  })

  // Exporta para o proxy BFF (same-origin → sem CORS), que repassa ao otel-collector:4318
  const exporter = new OTLPTraceExporter({ url: '/api/telemetry/traces' })

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  })

  provider.register({
    contextManager: new StackContextManager(),
    propagator: new CompositePropagator({
      propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
    }),
  })

  // Monkey-patcha window.fetch para injetar traceparent automaticamente em cada requisição.
  // Cria um HTTP CLIENT span filho do span ativo (startActiveSpan), garantindo
  // a propagação mesmo que o middleware manual do httpClient não capture o contexto.
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        // Propaga traceparent para todas as origens (same-origin + cross-origin)
        propagateTraceHeaderCorsUrls: [/.*/],
        clearTimingResources: true,
        // Evita criar span para o próprio endpoint OTLP (previne loop infinito)
        ignoreUrls: [/\/api\/telemetry/],
      }),
    ],
  })
}

// ─── Identidade do usuário em Baggage ─────────────────────────────────────────

/**
 * Define o contexto do usuário autenticado no W3C Baggage OTel.
 *
 * O Baggage é propagado em TODAS as requisições fetch após esse ponto via
 * header `baggage: userId=123,traceSessionId=uuid,...`.
 *
 * - `userId`: identifica QUE usuário fez a requisição
 * - `traceSessionId`: UUID único por login — distingue 2 browsers do MESMO usuário
 *   (ex: user 42 logado no Chrome e no Safari terão traceSessionIds diferentes)
 *
 * Uso: chamar após setAuth() no Zustand store (login ou hidratação de sessão).
 *
 * Nunca armazena o accessToken (Phantom Token) — apenas identificadores de rastreio.
 */
export function setOtelUserContext(userId: string, traceSessionId: string): void {
  if (typeof window === 'undefined') return
  if (process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production') return

  const baggage = propagation.createBaggage({
    userId: { value: userId },
    traceSessionId: { value: traceSessionId },
  })

  // Ativa o baggage como contexto ativo para todos os spans e fetches futuros
  const ctx: Context = propagation.setBaggage(context.active(), baggage)
  context.with(ctx, () => {
    // Context ativo — FetchInstrumentation propagará baggage em todos os fetches
  })

  // Injeta no tracer ativo para spans manuais futuros
  const tracer = trace.getTracer('ipysy-frontend')
  const span = tracer.startSpan('user.identified', {
    attributes: {
      'user.id': userId,
      'session.trace_id': traceSessionId,
    },
  })
  span.end()
}

/**
 * Limpa o contexto do usuário do Baggage (logout).
 */
export function clearOtelUserContext(): void {
  if (typeof window === 'undefined') return
  if (process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production') return

  const ctx: Context = propagation.setBaggage(context.active(), propagation.createBaggage())
  context.with(ctx, () => {})
}
