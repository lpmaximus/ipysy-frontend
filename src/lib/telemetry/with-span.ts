import { trace, SpanStatusCode, type Attributes } from '@opentelemetry/api'

/**
 * Executa `fn` dentro de um span OTel ativo com atributos de negócio.
 *
 * O middleware do httpClient já captura `http.method`, `http.url` e
 * `http.status_code` em cada requisição — use `withSpan` apenas para
 * atributos de domínio (ex: `waitlist.email_domain`, `event.id`).
 *
 * SSR-safe: `trace.getTracer()` retorna NoOp no servidor (sem provider).
 *
 * Exemplo:
 * ```ts
 * return withSpan('waitlist.register', { 'waitlist.email_domain': 'gmail.com' }, async () => {
 *   const res = await httpClient.fetch('/api/waitlist', { method: 'POST', ... })
 *   return mapResult(res)
 * })
 * ```
 */
export function withSpan<T>(
  name: string,
  attributes: Attributes,
  fn: () => Promise<T>,
): Promise<T> {
  const tracer = trace.getTracer('ipysy-frontend')
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn()
      if (Object.keys(attributes).length > 0) {
        span.setAttributes(attributes)
      }
      span.end()
      return result
    } catch (err) {
      span.recordException(err as Error)
      span.setStatus({ code: SpanStatusCode.ERROR })
      span.end()
      throw err
    }
  })
}
