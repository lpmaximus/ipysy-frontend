# IPYSY Frontend — Copilot Instructions

## Idioma

**Toda comunicação, código, commits e documentação devem estar em pt-BR.**

---

## Comandos

```bash
yarn dev              # Servidor dev em localhost:3000
yarn build            # Build de produção (Next.js standalone)
yarn typecheck        # Verificação de tipos (tsc --noEmit)
yarn lint             # ESLint

# Testes unitários
yarn test                                       # Suite completa (Vitest)
yarn test:watch                                 # Modo watch
yarn test:coverage                              # Cobertura v8
npx vitest run src/path/to/arquivo.test.ts      # Teste único

# Testes E2E
yarn test:e2e                                   # Playwright (Chromium + Mobile Chrome)
yarn test:e2e:ui                                # Playwright com UI interativa
npx playwright test tests/e2e/arquivo.spec.ts   # Spec único
```

---

## Arquitetura

### Dois portais — mesmo código-base

| Portal | URL | Modo |
|--------|-----|------|
| Público | `ipysy.com` | SSR (Server Components) |
| Privado | `app.ipysy.com` | SPA (Client Components) |

O backend é composto por **20 microserviços** acessados exclusivamente via Gateway `https://api.ipysy.com`. O frontend **nunca** fala diretamente com um microserviço.

### Estrutura de pastas em `src/`

```
src/
├── app/           # Next.js App Router — rotas, layouts, error boundaries, API routes
├── components/    # Componentes React reutilizáveis (shadcn/ui + Radix UI)
├── hooks/         # Custom hooks
├── i18n/          # Configuração next-intl
├── lib/
│   ├── http/
│   │   ├── http-client.ts      # Cliente HTTP client-side (pipeline chain-of-responsibility)
│   │   └── api-client.ts       # apiClient — cliente HTTP server-side para Route Handlers
│   ├── device/                 # Strategy Pattern para DeviceInfoProvider
│   └── api/                    # Clientes tipados por domínio + endpoints.ts (central de endpoints)
├── stores/        # Zustand stores (sem persistência)
├── styles/        # Tailwind CSS global
└── types/         # DTOs e interfaces puras (sem lógica)
    ├── common/    # ApiError, PageResponse<T>, PageRequest
    └── device/    # DeviceInfo (web + mobile)
```

### Dois clientes HTTP — nunca trocar

| Cliente | Arquivo | Onde usar |
|---------|---------|-----------|
| `httpClient` | `lib/http/http-client.ts` | Client Components, hooks, `lib/api/*` |
| `apiClient` | `lib/http/api-client.ts` | Route Handlers (`app/api/*`) |

**`httpClient`** usa padrão chain-of-responsibility. Registre middlewares com `httpClient.use(async (ctx, next) => {...})`. O middleware `device-info` já está registrado automaticamente.

**`apiClient`** é exclusivo do servidor. Propaga automaticamente os headers `device-info`, `authorization`, `x-request-id` e `accept-language` do request de entrada. Métodos disponíveis: `get`, `post`, `put`, `patch`, `delete`.

---

## Convenções

### Autenticação — Phantom Token (ADR-006)

- O frontend recebe e armazena apenas um **UUID opaco** — nunca um JWT
- Token armazenado **somente em memória** via Zustand (`stores/auth.ts`), sem `localStorage` ou cookie
- Perda ao refresh da página é **intencional**
- Refresh token gerenciado via `httpOnly` cookie pelo Gateway — transparente ao frontend
- Header enviado: `Authorization: Bearer <uuid>`
- **Nunca decodificar o token**

### Server vs Client Components

- Server Components são o **padrão** — sem `'use client'`
- `'use client'` é obrigatório apenas em componentes com `useState`, `useEffect`, event handlers ou hooks do React
- Fetch de dados em Server Components usa `apiClient`; em Client Components usa `httpClient` + TanStack Query

### Aliases de importação

| Alias | Resolve para |
|-------|-------------|
| `@/app/*` | `src/app/*` |
| `@/lib/*` | `src/lib/*` |
| `@/stores/*` | `src/stores/*` |
| `@/components/*` | `src/components/*` |
| `@/types/*` | `src/types/*` |
| `@/hooks/*` | `src/hooks/*` |

### TanStack Query

- `staleTime`: 60 segundos por padrão
- `refetchOnWindowFocus`: desabilitado
- Retry em produção: 1x; em dev: desabilitado

### Commits

```
tipo(escopo): descrição em pt-BR (p2-XX)
```

Exemplos: `feat(auth): implementar login com OAuth Google (p2-03)`, `fix(http): corrigir headers no apiClient (p2-07)`

### Documentação

- **Nunca criar `.md` na raiz** — sempre em `docs/`
- Atualizar `docs/` após mudanças em telas ou contratos de API

### Segurança & Compliance

- Nunca armazenar JWT — apenas o UUID opaco do Phantom Token
- Não exibir `thumbnail_key` ou campos internos na UI (CI-06/CI-09)
- Não exibir header `X-Data-Usage-Policy` ao usuário final — apenas B2B (LGL-001)
- Coletar apenas dados necessários — LGPD/GDPR/CCPA

---

## Fases do Produto (BLOCOs)

| Bloco | Escopo |
|-------|--------|
| B0 | Onboarding: signup, login, OAuth Google, KYC, TOTP |
| B1 | Público: homepage, lista de eventos, detalhe, ranking |
| B2 | Free logado: dashboard, meus eventos, rankings, perfil |
| B3 | Premium: discovery, Brier Score, calibração, analytics |
| B4 | Business: API keys, contratos, org analytics, times |
| B5 | Academia: cursos, glossário, artigos |
| B6 | Social: feed, follows, likes, comentários |
| B7 | Admin: moderação, métricas, DLQ, KYC review |

---

## Microserviços do Backend

Todos acessados via `https://api.ipysy.com` (Gateway).

| Serviço | Responsabilidade |
|---------|-----------------|
| Security (9001) | Auth, signup, OAuth Google, KYC, TOTP |
| Profile (9002) | Dados de perfil |
| User (9003) | Identidade, privacidade, LGPD |
| Event (9004) | Criação e gestão de eventos |
| Prediction (9009) | Submissão de previsões, Brier Score |
| Reputation (9007) | ΔR, ranking, percentil |
| Notification (9006) | Notificações + WebSocket push |
| Entitlement (9013) | Planos, pricing, Stripe |

WebSocket para notificações em tempo real: `wss://api.ipysy.com/ws/v1/notifications/{userId}?token=<uuid>`
