# HTTP Client — Infraestrutura de Requisições

> **Localização**: `lib/http/http-client.ts` · `lib/http/api-client.ts` · `lib/device/device-info.ts`
> **Endpoints**: `lib/api/endpoints.ts`
> **Modelos**: `types/device/device-info.ts`
> **Padrões**: Chain-of-Responsibility (middleware pipeline) + Strategy (device info provider)

---

## Visão Geral

Todas as chamadas HTTP do frontend passam por dois clientes especializados:

| Cliente | Arquivo | Onde roda | Para onde chama |
|---------|---------|-----------|-----------------|
| `httpClient` | `lib/http/http-client.ts` | Browser (client-side) | BFF Next.js (`/api/*`) |
| `apiClient` | `lib/http/api-client.ts` | Servidor (server-side) | API Gateway Java (`api.ipysy.com`) |

> ⚠️ **Regra de importação** — sempre use o caminho direto, nunca o barrel `@/lib/http`:
> ```ts
> // ✅ Correto
> import { httpClient } from '@/lib/http/http-client'  // Client Components / lib/api/*
> import { apiClient }  from '@/lib/http/api-client'   // Route Handlers (app/api/**/route.ts)
>
> // ❌ Nunca usar o barrel — arrasta next/headers para o bundle do cliente
> import { httpClient, apiClient } from '@/lib/http'
> ```

O `httpClient` executa uma pipeline de middlewares antes de despachar o `fetch` real,
permitindo injetar headers, tratar erros, adicionar tracing e autenticação de forma
centralizada — sem duplicação em cada módulo de API.

```
httpClient.fetch(url, init)
     │
     ▼
[deviceInfoMiddleware]   ← injeta header device-info automaticamente
     │
     ▼
[authMiddleware]         ← (futuro) Bearer token do Zustand store
     │
     ▼
[retryMiddleware]        ← (futuro) backoff exponencial em 5xx
     │
     ▼
[tracingMiddleware]      ← (futuro) OpenTelemetry TraceID propagation
     │
     ▼
fetch(url, init)         ← fetch nativo do browser / Node.js
```

---

## HttpClient

### Tipo de middleware

```ts
type HttpMiddleware = (ctx: RequestContext, next: NextFn) => Promise<Response>

interface RequestContext {
  url: string
  init: RequestInit   // mutável — middlewares podem adicionar/modificar headers, body, etc.
}

type NextFn = () => Promise<Response>
```

### Registrar um middleware

```ts
import { httpClient } from '@/lib/http/http-client'

httpClient.use(async (ctx, next) => {
  // modificar ctx.init antes de passar adiante
  ctx.init.headers = { ...ctx.init.headers, 'x-custom': 'value' }
  const response = await next()
  // processar response após retornar (ex: logging, métricas)
  return response
})
```

### Usar em módulos de API

```ts
import { httpClient } from '@/lib/http/http-client'

const res = await httpClient.fetch('/api/waitlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
})
```

---

## Device Info — Strategy Pattern

### Fluxo

```
app inicializa
     │
     ├─ browser (Next.js)    → WebDeviceInfoProvider auto-registrado
     └─ mobile (React Native) → NativeDeviceInfoProvider.register() no _layout.tsx
                                          │
                              registerDeviceInfoProvider(provider)
                                          │
                              deviceInfoMiddleware usa resolveDeviceInfo()
                                          │
                              header device-info: { "platform": "...", ... }
```

### Interface `DeviceInfoProvider`

```ts
interface DeviceInfoProvider {
  getDeviceInfo(): DeviceInfo | Promise<DeviceInfo>
}
```

### Campos de `DeviceInfo`

| Campo | Tipo | Plataforma | Exemplo |
|-------|------|-----------|---------|
| `platform` | `'web' \| 'android' \| 'ios'` | Todos | `"web"` |
| `os` | `string` | Todos | `"Windows 10/11"`, `"iOS 17.4"` |
| `osVersion` | `string` | Todos | `"10.0.22631"` |
| `language` | `string` | Todos | `"pt-BR"` |
| `timezone` | `string` | Todos | `"America/Sao_Paulo"` |
| `userAgent` | `string` | Web | UA completo |
| `browser` | `string` | Web | `"Chrome"`, `"Firefox"` |
| `browserVersion` | `string` | Web | `"124"` |
| `screenWidth/Height` | `number` | Web | `1920`, `1080` |
| `viewportWidth/Height` | `number` | Web | `1440`, `900` |
| `devicePixelRatio` | `number` | Web | `2` |
| `touchSupport` | `boolean` | Web | `false` |
| `appVersion` | `string` | Mobile | `"1.0.0"` |
| `buildNumber` | `string` | Mobile | `"42"` |
| `deviceModel` | `string` | Mobile | `"Pixel 8"`, `"iPhone 15"` |
| `manufacturer` | `string` | Mobile | `"Google"`, `"Apple"` |

### Implementação para React Native

Criar em `apps/mobile/src/providers/device-info.native.ts`:

```ts
import DeviceInfo from 'react-native-device-info'
import { Platform } from 'react-native'
import { registerDeviceInfoProvider, type DeviceInfoProvider } from '@/lib/device-info'

const NativeDeviceInfoProvider: DeviceInfoProvider = {
  async getDeviceInfo() {
    return {
      platform: Platform.OS as 'android' | 'ios',
      os: `${Platform.OS} ${Platform.Version}`,
      language: DeviceInfo.getDeviceLocaleSync(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      deviceModel: DeviceInfo.getModel(),
      manufacturer: await DeviceInfo.getManufacturer(),
    }
  },
}

registerDeviceInfoProvider(NativeDeviceInfoProvider)
```

Importar no `apps/mobile/app/_layout.tsx` (antes de qualquer requisição):

```ts
import '@/providers/device-info.native'
```

---

## ApiClient — Cliente HTTP Server-Side

O `apiClient` é o par simétrico do `httpClient`, mas roda apenas no servidor (Route Handlers).
Propaga automaticamente os headers do request de entrada — sem configuração em cada Route Handler.

### Headers propagados automaticamente

| Header | Descrição |
|--------|-----------|
| `device-info` | Plataforma e dispositivo do usuário |
| `authorization` | Phantom Token — `Bearer <uuid>` |
| `x-request-id` | Rastreabilidade distribuída |
| `accept-language` | i18n — `pt-BR` / `en-US` |

### Métodos disponíveis

```ts
import { apiClient } from '@/lib/http/api-client'
import { API } from '@/lib/api/endpoints'

// GET — sem body
await apiClient.get(API.reputation.ranking)

// POST — com body (Content-Type: application/json automático)
await apiClient.post(API.users.waitlist, { email })

// PUT / PATCH — atualização completa / parcial
await apiClient.put(API.profile.update, profileData)
await apiClient.patch(API.events.detail(id), { title: 'Novo título' })

// DELETE — sem body
await apiClient.delete(API.users.delete(id))

// Headers extras opcionais como 3º parâmetro (quando necessário)
await apiClient.post(API.security.login, body, { 'X-Idempotency-Key': key })
```

---

## Endpoints Centralizados — `lib/api/endpoints.ts`

Todos os ~50 endpoints dos 20 microserviços ficam em um único arquivo.
Hierarquia de constantes privadas evita repetição e facilita manutenção:

```ts
const BASE     = '/api/v1'          // versão da API — alterar aqui muda tudo
const SECURITY = `${BASE}/security` // prefixo do microserviço
const USERS    = `${BASE}/users`
// ... 18 microserviços

export const API = {
  security: {
    login:    `${SECURITY}/auth/login`,
    signup:   `${SECURITY}/auth/signup`,
    // ...
  },
  users: {
    waitlist: `${USERS}/waitlist`,
    // ...
  },
} as const
```

**Rotas dinâmicas** são funções:
```ts
API.events.detail(eventId)  // → '/api/v1/events/abc-123'
API.security.totpQr(userId) // → '/api/v1/security/totp/xyz/qr'
```

---

## Middlewares planejados

| Middleware | Prioridade | Descrição |
|-----------|-----------|-----------|
| `deviceInfoMiddleware` | ✅ Implementado | Header `device-info` com info de plataforma |
| `authMiddleware` | Sprint 1 | Injeta `Authorization: Bearer <token>` do Zustand auth store |
| `retryMiddleware` | Sprint 2 | Backoff exponencial (3 tentativas) em 5xx/rede |
| `tracingMiddleware` | Sprint 2 | Propaga `traceparent` OpenTelemetry; integração SigNoz |
| `rateLimitMiddleware` | Sprint 3 | Throttle client-side para endpoints sensíveis |

---

## Convenção

- **Sempre usar `httpClient.fetch()`** em `lib/api/` — nunca `fetch()` direto
- **Nunca duplicar lógica de headers** em módulos de API — registrar middleware
- **Middlewares são singletons** — registrar uma vez na inicialização, não dentro de componentes
- Cache do device-info é **lazy** — coletado na primeira requisição, reutilizado nas demais
