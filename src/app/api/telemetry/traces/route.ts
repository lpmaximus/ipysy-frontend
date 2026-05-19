import { type NextRequest, NextResponse } from 'next/server'

/**
 * Proxy OTLP HTTP — recebe traces do browser e repassa ao otel-collector interno.
 *
 * Por que é necessário:
 *   - otel-collector:4318 está na rede Docker interna (inacessível pelo browser)
 *   - Same-origin resolve CORS: browser → /api/telemetry/traces → otel-collector:4318
 *   - Em dev local: OTEL_COLLECTOR_HTTP_URL não configurado → descarta silenciosamente
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const collectorUrl = process.env.OTEL_COLLECTOR_HTTP_URL

  console.log('[OTel proxy] recebido POST — collector:', collectorUrl ?? '(vazio → descartando)')

  if (!collectorUrl) {
    return new NextResponse(null, { status: 200 })
  }

  const body = await request.arrayBuffer()
  const contentType = request.headers.get('content-type') ?? 'application/json'

  try {
    const response = await fetch(`${collectorUrl}/v1/traces`, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body,
    })

    if (!response.ok) {
      console.error(`[OTel] Collector respondeu ${response.status}`)
    }
  } catch (error) {
    // Telemetria nunca deve quebrar a aplicação
    console.error('[OTel] Falha ao encaminhar traces:', error)
  }

  return new NextResponse(null, { status: 200 })
}
