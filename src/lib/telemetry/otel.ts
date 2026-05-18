import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web'
import { W3CTraceContextPropagator, W3CBaggagePropagator, CompositePropagator } from '@opentelemetry/core'
import { Resource } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

// ─── Inicialização singleton ───────────────────────────────────────────────────

let initialized = false

/**
 * Inicializa o OpenTelemetry SDK Web no browser.
 *
 * - Ativo apenas em produção (NEXT_PUBLIC_ENVIRONMENT === 'production')
 * - Exporta via OTLP HTTP para o proxy BFF → otel-collector → SigNoz
 * - Propaga W3C TraceContext (`traceparent`) em todas as requisições fetch
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

  const provider = new WebTracerProvider({ resource })
  provider.addSpanProcessor(new BatchSpanProcessor(exporter))

  provider.register({
    propagator: new CompositePropagator({
      propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
    }),
  })

  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations({
        // Auto-injeta traceparent em todas as chamadas fetch → BFF → Java Gateway
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: [/.*/],
          clearTimingResources: true,
        },
        '@opentelemetry/instrumentation-document-load': {},
        '@opentelemetry/instrumentation-user-interaction': { enabled: false },
        '@opentelemetry/instrumentation-xml-http-request': { enabled: false },
      }),
    ],
  })
}
