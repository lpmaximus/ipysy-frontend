import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/http/api-client'
import { API } from '@/lib/api/endpoints'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // [DIAGNÓSTICO TEMPORÁRIO] — remover após confirmar propagação OTel
    const tp = request.headers.get('traceparent')
    const ts = request.headers.get('tracestate')
    console.warn(`[WAITLIST] traceparent=${tp ?? 'AUSENTE'} tracestate=${ts ?? 'AUSENTE'}`) // diagnóstico temporário — removeConsole exclui warn

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


