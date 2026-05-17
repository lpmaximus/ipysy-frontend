# Padrão BFF (Backend For Frontend)

> **Para novos devs**: este documento explica como o frontend IPYSY se comunica com o backend.  
> Leia antes de criar qualquer tela que precise buscar ou enviar dados.

---

## O que é o BFF?

BFF significa **Backend For Frontend** — um servidor intermediário que fica entre o browser do usuário e o backend real.

No IPYSY, o Next.js **é** o nosso BFF. Ele tem dois mundos:

| Mundo | Onde roda | Acesso ao backend |
|-------|-----------|-------------------|
| **Browser** (Client Components) | No computador do usuário | ❌ Nunca direto |
| **Servidor** (Route Handlers) | No nosso servidor Hetzner | ✅ Via rede interna |

---

## Por que não chamar o backend diretamente do browser?

| Problema sem BFF | Solução com BFF |
|-----------------|-----------------|
| URL `api.ipysy.com` exposta no DevTools | URL fica só no servidor |
| CORS aberto para qualquer origem | CORS restrito ao servidor Next.js |
| Token de autenticação visível no browser | Token repassado pelo servidor |
| Headers sensíveis (`device-info`) manipuláveis | Headers injetados server-side |

---

## O fluxo completo — passo a passo

Exemplo real: usuário cadastra e-mail na página **Coming Soon**.

```
BROWSER                           SERVIDOR NEXT.JS              BACKEND QUARKUS
────────────────────────────────  ─────────────────────────────  ─────────────────
[Usuário clica em "Solicitar Acesso"]
         │
         ▼
[coming-soon/page.tsx]
  handleSubmit()
  chama registerWaitlist(email)
         │
         ▼
[src/lib/api/waitlist.ts]
  registerWaitlist(email)
  chama httpClient.fetch('/api/waitlist')
         │
         ▼
[src/lib/http/http-client.ts]
  Middleware injeta:
    device-info: { platform, userAgent, ... }
         │
         │  POST /api/waitlist
         │  headers: { device-info, Content-Type }
         │  body: { email }
         ▼ ─────────────────────────────────────▶
                              [src/app/api/waitlist/route.ts]
                              Roda no servidor — nunca no browser
                                       │
                                       ▼
                              [src/lib/http/api-client.ts]
                              apiClient.post(API.users.waitlist, body)
                              Repassa headers:
                                device-info, authorization,
                                x-request-id, accept-language
                                       │
                                       │  POST https://api.ipysy.com
                                       │        /api/v1/users/waitlist
                                       ▼ ──────────────────────────────▶
                                                                  [Quarkus]
                                                                  201 / 400 / 422 / 5xx
                                       ◀ ──────────────────────────────
                              [route.ts]
                              NextResponse.json(data, { status })
         ◀ ─────────────────────────────────────
[src/lib/api/waitlist.ts]
  Mapeia status HTTP → semântica frontend:
    201 → { status: 'success' }
    200 + already_registered → { status: 'already_registered' }
    400 / 422 / 5xx → { status: 'error', message }
         │
         ▼
[coming-soon/page.tsx]
  setStatus('success') → exibe ✅
```

---

## Os arquivos envolvidos

### 1. `src/app/coming-soon/page.tsx` — A tela (Client Component)

Responsabilidade: **exibir UI e capturar a ação do usuário**.

```tsx
const result = await registerWaitlist(email)
setStatus(result.status)
setMessage(result.message)
```

Não sabe nada sobre HTTP, endpoints ou códigos de status. Só recebe `success`, `error` ou `already_registered`.

---

### 2. `src/lib/api/waitlist.ts` — O cliente de domínio

Responsabilidade: **encapsular a lógica da waitlist** e traduzir HTTP para semântica de negócio.

```ts
export async function registerWaitlist(email: string): Promise<WaitlistResult> {
  const res = await httpClient.fetch('/api/waitlist', { method: 'POST', body: ... })

  if (res.status === 201) return { status: 'success', message: ... }
  if (res.status === 200 && data.already_registered) return { status: 'already_registered', ... }
  return { status: 'error', message: data.violations?.[0]?.message ?? ... }
}
```

> **Analogia Quasar**: equivalente a um composable `useWaitlist()` ou um serviço `WaitlistService.ts` com `useFetch`.

---

### 3. `src/lib/http/http-client.ts` — O cliente HTTP do browser

Responsabilidade: **pipeline de middlewares** — injeta headers automáticos em toda requisição.

```ts
httpClient.use(async (ctx, next) => {
  ctx.init.headers = { ...ctx.init.headers, 'device-info': JSON.stringify(deviceInfo) }
  return next()
})
```

Middlewares registrados por padrão:
- `deviceInfoMiddleware` → injeta `device-info` com dados do dispositivo/browser

Futuros middlewares a registrar:
- `authMiddleware` → injeta `Authorization: Bearer <uuid>` do Zustand store

> **Analogia Quasar**: equivalente ao `$fetch` com `onRequest` interceptor do Nuxt, ou ao `axios.interceptors.request`.

---

### 4. `src/app/api/waitlist/route.ts` — O Route Handler (BFF proxy)

Responsabilidade: **receber a requisição do browser e repassar ao backend**.  
Roda **exclusivamente no servidor** — nunca no browser.

```ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  const res = await apiClient.post(API.users.waitlist, body)
  return NextResponse.json(await res.json(), { status: res.status })
}
```

> **Analogia Quasar**: equivalente ao `server/api/waitlist.post.ts` do Nuxt 3.

---

### 5. `src/lib/http/api-client.ts` — O cliente HTTP do servidor

Responsabilidade: **chamar o backend real** com os headers corretos propagados.

```ts
class ApiClient {
  // Método genérico
  async fetch(path: string, init: RequestInit = {}): Promise<Response> {
    const incoming = await headers() // headers do request que chegou do browser

    // Repassa: device-info, authorization, x-request-id, accept-language
    return fetch(`${BACKEND_URL}${path}`, { ...init, headers: { ...forwarded, ...init.headers } })
  }

  // Métodos de conveniência
  get(path: string, extraHeaders?: HeadersInit): Promise<Response>
  post(path: string, body?: unknown, extraHeaders?: HeadersInit): Promise<Response>
  put(path: string, body?: unknown, extraHeaders?: HeadersInit): Promise<Response>
  patch(path: string, body?: unknown, extraHeaders?: HeadersInit): Promise<Response>
  delete(path: string, extraHeaders?: HeadersInit): Promise<Response>
}

export const apiClient = new ApiClient()
```

`BACKEND_URL` vem da variável de ambiente `API_BASE_URL`:
- **Dev local**: `https://api.ipysy.com` (definido em `.env.local`)
- **Produção**: `http://gateway:8080` (rede interna Docker — latência < 1ms)

> **Analogia Quasar**: equivalente ao `$fetch.create({ baseURL })` com `onRequest` interceptor no lado servidor.

---

## Como criar um novo endpoint (passo a passo)

Ao implementar uma nova funcionalidade que precisa de dados do backend, siga esta ordem:

### Passo 1 — Criar o tipo em `src/types/`

```ts
// src/types/event/event.ts
export interface Event {
  id: string
  title: string
  closesAt: string
  // ...
}
```

### Passo 2 — Criar o Route Handler em `src/app/api/`

```ts
// src/app/api/events/route.ts
import { apiClient } from '@/lib/http'
import { API } from '@/lib/api'
import { NextResponse } from 'next/server'

export async function GET() {
  const res = await apiClient.get(API.events.list)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
```

### Passo 3 — Criar o cliente de domínio em `src/lib/api/`

```ts
// src/lib/api/events.ts
import { httpClient } from '@/lib/http'
import type { Event } from '@/types'

export async function fetchEvents(): Promise<Event[]> {
  const res = await httpClient.fetch('/api/events')
  const data = await res.json()
  return data.content ?? []
}
```

### Passo 4 — Usar na tela com TanStack Query

```tsx
// src/app/events/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { fetchEvents } from '@/lib/api'

export default function EventsPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })
  // ...
}
```

---

## Regras de ouro

1. **Browser nunca chama `api.ipysy.com` diretamente** — sempre via Route Handler
2. **`httpClient`** → apenas no browser (Client Components, `lib/api/`)
3. **`apiClient`** → apenas no servidor (Route Handlers em `app/api/`)
4. **`lib/api/*.ts`** → lógica de domínio, mapeamento de status, tipos de retorno
5. **`app/api/*/route.ts`** → proxy simples, sem lógica de negócio

---

## Leitura complementar

- [Next.js — Route Handlers (oficial)](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Padrão BFF no Next.js (DEV Community)](https://dev.to/oliverke/simplifying-api-communication-with-the-bff-pattern-in-nextjs-1flb)
- [Infraestrutura HTTP — middleware pipeline](./HTTP-CLIENT.md)
