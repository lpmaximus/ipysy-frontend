import type { Context } from '@opentelemetry/api'
import { propagation, context, trace } from '@opentelemetry/api'
import { WebTracerProvider, BatchSpanProcessor, StackContextManager } from '@opentelemetry/sdk-trace-web'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { W3CTraceContextPropagator, W3CBaggagePropagator, CompositePropagator } from '@opentelemetry/core'
import { Resource } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web'

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

  // Ativo em produção OU quando NEXT_PUBLIC_OTEL_ENABLED=true (testes locais)
  const isEnabled =
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ||
    process.env.NEXT_PUBLIC_OTEL_ENABLED === 'true'
  if (!isEnabled) return

  initialized = true

  console.log('[OTel] inicializando SDK — service:', 'ipysy-frontend')

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: 'ipysy-frontend',
    [ATTR_SERVICE_VERSION]: process.env.NEXT_PUBLIC_VERSION ?? '0.0.1-dev',
    'deployment.environment': process.env.NEXT_PUBLIC_ENVIRONMENT,
  })

  // Exporta para o proxy BFF (same-origin → sem CORS), que repassa ao otel-collector:4318
  // OTLPTraceExporter requer URL absoluta — window.location.origin garante isso em
  // qualquer ambiente (localhost, staging, produção) sem depender de env vars
  const exporter = new OTLPTraceExporter({
    url: `${window.location.origin}/api/telemetry/traces`,
  })

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(exporter, {
        // Envia lote a cada 10s ou quando acumular 20 spans
        scheduledDelayMillis: 10_000,
        maxExportBatchSize: 20,
        maxQueueSize: 100,
      }),
    ],
  })

  provider.register({
    contextManager: new StackContextManager(),
    propagator: new CompositePropagator({
      propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
    }),
  })

  // Registra instrumentações automáticas: document-load, fetch, user-interaction
  // FetchInstrumentation faz monkey-patch em window.fetch e propaga traceparent
  // automaticamente em todas as requisições ao gateway (api.ipysy.com)
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-document-load': {},
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: [/api\.ipysy\.com/],
          clearTimingResources: true,
          // Exclui as rotas de telemetria para evitar loop infinito:
          // sem isso cada POST /api/telemetry/traces geraria um novo span
          // que dispararia outro POST, e assim por diante.
          ignoreUrls: [/\/api\/telemetry\//],
        },
        '@opentelemetry/instrumentation-user-interaction': {
          eventNames: ['click'],
        },
        '@opentelemetry/instrumentation-xml-http-request': {
          enabled: false,
        },
      }),
    ],
  })

  console.log('[OTel] instrumentações registradas — spans ativos')
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

  const isEnabled =
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ||
    process.env.NEXT_PUBLIC_OTEL_ENABLED === 'true'
  if (!isEnabled) return

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

  const isEnabled =
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ||
    process.env.NEXT_PUBLIC_OTEL_ENABLED === 'true'
  if (!isEnabled) return

  const ctx: Context = propagation.setBaggage(context.active(), propagation.createBaggage())
  context.with(ctx, () => {})
}
