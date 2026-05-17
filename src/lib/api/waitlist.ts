// ─── Tipos ────────────────────────────────────────────────────────────────────

export type WaitlistStatus = 'idle' | 'loading' | 'success' | 'already_registered' | 'error'

export interface WaitlistResult {
  status: 'success' | 'already_registered' | 'error'
  message: string
}

// ─── Função ───────────────────────────────────────────────────────────────────

import { httpClient } from '@/lib/http/http-client'

/**
 * Envia e-mail para a waitlist via Route Handler interno (/api/waitlist),
 * que proxia para o Gateway backend em POST /api/v1/users/waitlist.
 *
 * O header `device-info` é injetado automaticamente pelo middleware do httpClient.
 *
 * Retornos mapeados do diagrama B3-waitlist-comingsoon.puml:
 *   201 → success            (novo cadastro)
 *   200 → already_registered (e-mail já na lista)
 *   400 → error              (Bean Validation: campo obrigatório, formato, tamanho)
 *   422 → error              (EmailValidation: FORMAT, DISPOSABLE_DOMAIN, NO_MX_RECORD)
 *   5xx → error              (Gateway/rede indisponível)
 */
export async function registerWaitlist(email: string): Promise<WaitlistResult> {
  const res = await httpClient.fetch('/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  const data = await res.json()

  if (res.status === 201) {
    return {
      status: 'success',
      message: data.message ?? 'Solicitação recebida! Você será um dos primeiros a ser convidado.',
    }
  }

  if (res.status === 200 && data.already_registered) {
    return {
      status: 'already_registered',
      message: data.message ?? 'Você já está na lista! Você será um dos primeiros a saber.',
    }
  }

  // 400: violations array | 422: message + rejectedBy | 5xx: errors array ou mensagem genérica
  const message =
    data.violations?.[0]?.message ??
    data.errors?.[0]?.message ??
    data.message ??
    'Erro ao processar sua solicitação. Tente novamente.'

  return { status: 'error', message }
}
