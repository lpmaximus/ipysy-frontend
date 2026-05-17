import { headers } from 'next/headers'

// ─── Config ───────────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.API_BASE_URL ?? 'http://localhost:8080'

/**
 * Headers do request de entrada propagados automaticamente ao API Gateway.
 * Equivalente ao `api.interceptors.request.use` do axios.
 */
const FORWARDED_HEADERS = [
  'device-info',     // info de plataforma/dispositivo
  'authorization',   // Phantom Token — Bearer <uuid>
  'x-request-id',   // rastreabilidade distribuída
  'accept-language', // i18n — pt-BR / en-US
] as const

// ─── ApiClient ────────────────────────────────────────────────────────────────

/**
 * Cliente HTTP server-side para Route Handlers (BFF → API Gateway Java).
 * Par simétrico do `httpClient` (client-side).
 *
 * Injeta automaticamente os headers do request de entrada (device-info,
 * authorization, etc.) sem nenhuma configuração extra em cada Route Handler.
 *
 * Uso:
 * ```ts
 * import { apiClient } from '@/lib/http'
 *
 * // Método genérico
 * const res = await apiClient.fetch(API.users.waitlist, { method: 'POST', body: JSON.stringify(body) })
 *
 * // Métodos de conveniência
 * const res = await apiClient.get(API.reputation.ranking)
 * const res = await apiClient.post(API.users.waitlist, body)
 * const res = await apiClient.put(API.profile.update, body)
 * const res = await apiClient.patch(API.events.detail(id), body)
 * const res = await apiClient.delete(API.users.delete(id))
 * ```
 */
class ApiClient {
  async fetch(path: string, init: RequestInit = {}): Promise<Response> {
    const incoming = await headers()

    const forwarded: Record<string, string> = {}
    for (const header of FORWARDED_HEADERS) {
      const value = incoming.get(header)
      if (value) forwarded[header] = value
    }

    return fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers: {
        ...forwarded,
        ...init.headers, // init.headers têm precedência para sobrescrever pontualmente
      },
    })
  }

  get(path: string, extraHeaders?: HeadersInit): Promise<Response> {
    return this.fetch(path, {
      method: 'GET',
      headers: { ...extraHeaders },
    })
  }

  post(path: string, body?: unknown, extraHeaders?: HeadersInit): Promise<Response> {
    return this.fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify(body),
    })
  }

  put(path: string, body?: unknown, extraHeaders?: HeadersInit): Promise<Response> {
    return this.fetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify(body),
    })
  }

  patch(path: string, body?: unknown, extraHeaders?: HeadersInit): Promise<Response> {
    return this.fetch(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify(body),
    })
  }

  delete(path: string, extraHeaders?: HeadersInit): Promise<Response> {
    return this.fetch(path, {
      method: 'DELETE',
      headers: { ...extraHeaders },
    })
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const apiClient = new ApiClient()
