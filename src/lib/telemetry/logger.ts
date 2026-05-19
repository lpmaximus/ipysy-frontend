import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { trace, context } from '@opentelemetry/api'

// ─── Inicialização singleton ───────────────────────────────────────────────────

let initialized = false

/**
 * Inicializa o OTel Logs SDK no browser.
 *
 * Deve ser chamado após initOtel() (traces) — reutiliza o mesmo Resource.
 * Logs emitidos via `logger.*` são exportados com trace_id + span_id do
 * contexto ativo, permitindo correlação no SigNoz: Traces → "Related Logs".
 *
 * Fluxo:
 *   logger.info(...) → OTLPLogExporter → POST /api/telemetry/logs → otel-collector:4318 → SigNoz
 */
export function initOtelLogs(): void {
  if (initialized || typeof window === 'undefined') return

  const isEnabled =
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ||
    process.env.NEXT_PUBLIC_OTEL_ENABLED === 'true'
  if (!isEnabled) return

  initialized = true

  const exporter = new OTLPLogExporter({
    url: `${window.location.origin}/api/telemetry/logs`,
  })

  // Nesta versão do sdk-logs os processors são passados no construtor
  const loggerProvider = new LoggerProvider({
    processors: [new SimpleLogRecordProcessor(exporter)],
  })

  // Registra globalmente — logs.getLogger() usa este provider
  logs.setGlobalLoggerProvider(loggerProvider)

  console.log('[OTel] logs SDK inicializado')
}

// ─── Logger público ────────────────────────────────────────────────────────────

type LogAttributes = Record<string, string | number | boolean>

function emit(
  severityNumber: SeverityNumber,
  severityText: string,
  message: string,
  attributes?: LogAttributes,
): void {
  // Fallback para console quando OTel não está ativo (dev sem NEXT_PUBLIC_OTEL_ENABLED)
  if (typeof window === 'undefined' || !initialized) {
    const fn =
      severityNumber >= SeverityNumber.ERROR
        ? console.error
        : severityNumber >= SeverityNumber.WARN
          ? console.warn
          : console.log
    fn(`[${severityText}] ${message}`, attributes ?? '')
    return
  }

  // Captura o span ativo para injetar trace_id + span_id no log record
  const activeSpan = trace.getActiveSpan()
  const spanContext = activeSpan?.spanContext()

  const otelLogger = logs.getLogger('ipysy-frontend')
  otelLogger.emit({
    severityNumber,
    severityText,
    body: message,
    attributes: {
      ...attributes,
      ...(spanContext
        ? {
            'trace_id': spanContext.traceId,
            'span_id': spanContext.spanId,
          }
        : {}),
    },
    // Propaga o contexto ativo — o SDK injeta traceId/spanId automaticamente
    context: context.active(),
  })
}

/**
 * Logger OTel — use no lugar de console.log/error/warn nos componentes.
 *
 * @example
 * import { logger } from '@/lib/telemetry/logger'
 * logger.info('usuário logado', { userId: '123' })
 * logger.error('falha no pagamento', { orderId: 'abc', code: 500 })
 */
export const logger = {
  debug: (msg: string, attrs?: LogAttributes) =>
    emit(SeverityNumber.DEBUG, 'DEBUG', msg, attrs),

  info: (msg: string, attrs?: LogAttributes) =>
    emit(SeverityNumber.INFO, 'INFO', msg, attrs),

  warn: (msg: string, attrs?: LogAttributes) =>
    emit(SeverityNumber.WARN, 'WARN', msg, attrs),

  error: (msg: string, attrs?: LogAttributes) =>
    emit(SeverityNumber.ERROR, 'ERROR', msg, attrs),
}
