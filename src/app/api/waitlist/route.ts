import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/http/api-client'
import { API } from '@/lib/api/endpoints'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // [DIAGNÓSTICO TEMPORÁRIO] — remover após confirmar propagação OTel
    const tp = request.headers.get('traceparent')
    const ts = request.headers.get('tracestate')
    const allHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => { allHeaders[key] = value })
    console.warn(`[WAITLIST] traceparent=${tp ?? 'AUSENTE'} tracestate=${ts ?? 'AUSENTE'}`)
    console.warn(`[WAITLIST] ALL_HEADERS=${JSON.stringify(allHeaders)}`)

    const res = await apiClient.post(API.users.waitlist, body)

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(
      { message: 'Serviço temporariamente indisponível. Tente novamente em instantes.' },
      { status: 503 }
    )
  }
}


