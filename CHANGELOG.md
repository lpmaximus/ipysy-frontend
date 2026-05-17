# CHANGELOG — IPYSY Frontend

Todas as mudanças relevantes do projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [Unreleased]

### Fixed (Sessão 07 — Bug next/headers em contexto client — 2026-05-17)

- `lib/api/waitlist.ts` — import corrigido de `@/lib/http` (barrel) para `@/lib/http/http-client` (direto)
- `app/api/waitlist/route.ts` — import corrigido de `@/lib/http` (barrel) para `@/lib/http/api-client` (direto)
- **Causa raiz**: o barrel `lib/http/index.ts` re-exporta `apiClient` (que importa `next/headers`) junto com `httpClient`; qualquer Client Component que importasse do barrel arrastava `next/headers` para o bundle do browser, causando o erro `You're importing a component that needs "next/headers"` em `npm run dev`
- **Regra estabelecida**: sempre importar pelo caminho direto — nunca pelo barrel `@/lib/http`
  - Client Components e `lib/api/*` → `import { httpClient } from '@/lib/http/http-client'`
  - Route Handlers (`app/api/**/route.ts`) → `import { apiClient } from '@/lib/http/api-client'`

### Changed (Sessão 07 — CI/CD Vault — 2026-05-17)

- `.github/workflows/ci-cd.yml` — adicionado step **"Render Vault env no servidor"** antes do `docker compose up`:
  - SSH no Hetzner executa `render-frontend-env.sh` com `VAULT_TOKEN` (secret GitHub `VAULT_TOKEN_FRONTEND`)
  - Garante que `vault-runtime/.env.vault-frontend` existe antes do container subir
  - Sem esse step, o `docker-compose.prod.yml` falharia ao não encontrar o arquivo de segredos do Vault

### Added (Sessão 06 — Refatoração ApiClient + Endpoints centralizados — 2026-05-17)

- `lib/api/endpoints.ts` — central de todos os ~50 endpoints dos 20 microserviços
  - Hierarquia de constantes privadas: `BASE` (versão API) → `SECURITY`, `PROFILES`, `USERS`... (prefixo de cada microserviço) → `API.*` (endpoints finais)
  - Alterar `BASE` muda todos os endpoints; alterar `SECURITY` muda só os do Security Service
  - Rotas dinâmicas como funções: `API.events.detail(id)` → `` `/api/v1/events/${id}` ``
  - `API` exportado com `as const` — tipos literais (não `string` genérico)
- `lib/http/api-client.ts` — métodos de conveniência HTTP na classe `ApiClient`:
  - `apiClient.get(path, extraHeaders?)`
  - `apiClient.post(path, body?, extraHeaders?)` — `Content-Type: application/json` automático
  - `apiClient.put(path, body?, extraHeaders?)`
  - `apiClient.patch(path, body?, extraHeaders?)`
  - `apiClient.delete(path, extraHeaders?)`
  - Método base `apiClient.fetch(path, init)` mantido para casos especiais

### Changed (Sessão 06 — 2026-05-17)

- `lib/http/api-client.ts` — `apiClient.fetch(API.users.waitlist, { method: 'POST', ... })` simplificado para `apiClient.post(API.users.waitlist, body)` no `route.ts`
- `app/api/waitlist/route.ts` — usa `apiClient.post(API.users.waitlist, body)` em vez de `apiClient.fetch(...)` manual
- `docs/technical/HTTP-CLIENT.md` — adicionadas seções `ApiClient` e `Endpoints Centralizados`; localização corrigida (`api-client.ts`)
- `docs/technical/BFF-PATTERN.md` — atualizado para usar `api-client.ts`/`apiClient` com métodos `get/post/put/patch/delete`; passo a passo atualizado com `API.*`
- `README.md` — estrutura atualizada com `api-client.ts`, `endpoints.ts`; tabela de docs atualizada

### Added (Sessão 05 — Refatoração types/ + lib/ — 2026-05-17)

- `types/` — nova pasta para modelos/DTOs com interfaces puras (sem lógica)
  - `types/device/device-info.ts` — `DeviceInfo` interface extraída de `lib/device-info.ts`
  - `types/common/api.ts` — `ApiError`, `PageResponse<T>`, `PageRequest` (base para 20 microserviços)
  - `types/index.ts` — barrel re-export central

### Changed (Sessão 05 — Refatoração types/ + lib/ — 2026-05-17)

- `lib/` renomeado para `lib/` — nomenclatura alinhada ao padrão do projeto (Quasar-like)
- `lib/device-info.ts` — `DeviceInfo` interface movida para `types/device/device-info.ts`; re-exporta via `export type { DeviceInfo }` para compatibilidade
- Todos os imports atualizados: `@/lib/*` → `@/lib/*`, `DeviceInfo` de `@/types/device/device-info`
- `README.md` — estrutura e tabela de aliases atualizadas
- `CLAUDE.md` — estrutura do projeto atualizada

### Added (Sessão 04 — Infraestrutura HTTP + Device Info — 2026-05-16)

- `lib/http-client.ts` — `HttpClient` com pipeline de middlewares no padrão chain-of-responsibility
  - `HttpMiddleware` type: `(ctx: RequestContext, next: NextFn) => Promise<Response>`
  - Singleton `httpClient` exportado; todas as chamadas API devem usar `httpClient.fetch()`
  - `deviceInfoMiddleware` registrado automaticamente — injeta header `device-info` em toda requisição
  - Extensível: novos middlewares (auth, retry, logging, OTel) adicionados com `httpClient.use()`
- `lib/device-info.ts` — Strategy Pattern para informações de dispositivo
  - `DeviceInfo` — interface unificada web + mobile (`platform`, `os`, `browser`, `appVersion`, `deviceModel`, etc.)
  - `DeviceInfoProvider` — contrato intercambiável entre plataformas
  - `registerDeviceInfoProvider()` — troca o provider na inicialização do app
  - `resolveDeviceInfo()` — usado pelo middleware (assíncrono, suporta `async getDeviceInfo()`)
  - `WebDeviceInfoProvider` — implementação browser com parse de userAgent, `screen.*`, `window.*`, `navigator.*`; auto-registrado quando `typeof window !== 'undefined'`
  - Pronto para React Native: basta criar `NativeDeviceInfoProvider` e chamar `registerDeviceInfoProvider()` no `_layout.tsx`

### Changed (Sessão 04 — Infraestrutura HTTP)

- `lib/api/waitlist.ts` — migrado de `fetch()` nativo para `httpClient.fetch()`; remoção total de lógica manual de device-info (agora automático via middleware)
- `app/api/waitlist/route.ts` — Route Handler repassa header `device-info` ao backend quando presente

### Added (Sessão 04 — Correções Sprint 0 — 2026-05-16)

- `app/icon.svg` — favicon SVG IPYSY: "I" itálico dourado (`#9A7B2E`) em fundo escuro (`#0F1923`)
- `scripts/vault/render-frontend-env.sh` — script que lê `secret/ipysy/frontend` do HashiCorp Vault e gera `vault-runtime/.env.vault-frontend`; seeds automático se path não existir
- `vault-runtime/.gitkeep` — diretório para segredos gerados pelo Vault (ignorado pelo git)

### Fixed (Sessão 04 — Correções Sprint 0 — 2026-05-16)

- `.env.local` — `API_BASE_URL` corrigido de `http://gateway:8080` (hostname Docker interno) para `https://api.ipysy.com`; botão "Solicitar Acesso" retornava 503 em dev local
- `lib/api/waitlist.ts` — fallback de mensagem de erro agora inclui `data.errors?.[0]?.message` (formato correto do backend para 5xx)
- `app/coming-soon/page.tsx`:
  - Validação client-side com `EMAIL_REGEX` antes do round-trip à API (evita problemas de encoding UTF-8 nas mensagens do backend)
  - `borderColor` e `btnBg` usam `#FC8181` quando `status === 'error'` (borda e botão vermelhos visíveis)
  - Mensagem de feedback sempre renderizada com `minHeight: '1.2em'` e `'\u00A0'` quando vazia (elimina layout shift)
  - `already_registered`: input habilitado e limpo (`setEmail('')`); `isLocked` agora só bloqueia em `success`
  - Ícone ⚠ corrigido para `'⚠\u00A0'` (non-breaking space evita quebra de linha)
- `app/layout.tsx` — metadata `icons` adicionada (`/icon.svg`) — favicon funcionando

### Changed (Sessão 04 — Ambiente e Deploy)

- `.env.prod.example` → **renomeado para `.env.prod`** (arquivo de produção real; não versionado)
- `.gitignore` — removida exceção `!.env.prod.example`; adicionado `vault-runtime/*.env*`; comentário de convenção de arquivos de ambiente
- `docker-compose.prod.yml` — `environment:` com valores hardcoded substituído por `env_file: [.env.prod, vault-runtime/.env.vault-frontend]`

---



> **Funcionalidade**: Integração completa da página `/coming-soon` com o endpoint `POST /api/v1/users/waitlist` do backend, conforme diagrama `B3-waitlist-comingsoon.puml` (p2-229/BLOCO34).

- `app/coming-soon/page.tsx` — rota `/coming-soon` com página coming-soon completa (design dark editorial, canvas de partículas douradas, Playfair Display, 5 conteúdos rotativos revisados com sorteio aleatório por visita)
- `app/page.tsx` — redirect server-side `redirect('/coming-soon')` via `next/navigation` — rota `/` sempre redireciona para `/coming-soon` (HTTP 307, sem flash)
- `app/api/waitlist/route.ts` — Route Handler POST `/api/waitlist`: proxy server-side para `POST /api/v1/users/waitlist` no Gateway (`API_BASE_URL`); URL do backend nunca exposta ao browser
- `lib/api/waitlist.ts` — cliente tipado com mapeamento completo de todos os retornos do backend:
  - `201 Created` → `status: 'success'` (novo cadastro)
  - `200 OK + already_registered: true` → `status: 'already_registered'`
  - `400 Bad Request` → `status: 'error'` (Bean Validation: campo obrigatório, formato, tamanho)
  - `422 Unprocessable Entity` → `status: 'error'` (EmailValidationService: FORMAT, DISPOSABLE_DOMAIN, NO_MX_RECORD)
  - `503 Service Unavailable` → `status: 'error'` (Gateway/rede indisponível)
- Máquina de estados do formulário (`InputWrapper`):
  - `idle` → formulário ativo
  - `loading` → botão "Enviando…", campos desabilitados
  - `success` → formulário substituído por confirmação ✅ (estado terminal)
  - `already_registered` → mensagem ℹ em dourado (`#9A7B2E`), formulário bloqueado (estado terminal)
  - `error` → mensagem ⚠ em vermelho (`#FC8181`), campo reativa ao redigitar
- Suporte a `Enter` no input para submeter o formulário
- Textos dos 5 slides revisados pela equipe editorial (versão final aprovada)

### Changed (Sprint 0 — Migração Vue/Nuxt → React/Next.js)

> **Decisão de arquitetura**: Após análise comparativa entre Vue 3/Nuxt 3 e React 19/Next.js 15, o CTO aprovou a migração para React/Next.js por vantagem decisiva em UI/UX (Framer Motion, shadcn/ui, ecossistema 3x maior) e pelo timing ideal — antes de qualquer lógica de negócio.

- **BREAKING**: Stack migrada de **Nuxt 3 + Vue 3 + Pinia + PrimeVue** para **Next.js 15 + React 19 + Zustand + shadcn/ui**
- **BREAKING**: Variáveis de ambiente `NUXT_PUBLIC_*` → `NEXT_PUBLIC_*`; `NUXT_API_BASE_URL` → `API_BASE_URL`
- Atualizado `Dockerfile` multi-stage: `nuxt build` → `next build`; CMD `node .output/server/index.mjs` → `node server.js`; COPY de `.output/` → `.next/standalone/`
- Atualizado `docker-compose.yml`, `docker-compose.prod.yml`: referências `NUXT_*` → `NEXT_PUBLIC_*`
- Atualizado `.env`, `.env.local`, `.env.prod.example`: todas as variáveis renomeadas
- Atualizado `.github/workflows/ci-cd.yml`: `build-args` e gate ADR-017 ajustados para Next.js
- 23 documentos atualizados: `docs/business-docs/`, `C:\Users\lgfcr\Downloads\ipysy_docs\`, `G:\2-DOCS\`

### Added (Sprint 0 — Next.js 15 Bootstrap)

- `package.json` — stack completa PRD-003 v1.2: Next.js 15, React 19, Zustand, TanStack Query, Framer Motion, React Hook Form, Zod, shadcn/ui (Radix UI), next-intl, usehooks-ts, Vitest, Playwright
- `next.config.ts` — `output: 'standalone'`, `productionBrowserSourceMaps: false` (ADR-017), headers de segurança, SWC `removeConsole`, proxy rewrite para `GATEWAY_UPSTREAM`
- `tsconfig.json` — TypeScript strict mode para Next.js 15 + App Router
- `tailwind.config.ts` — tema IPYSY (indigo brand, animações fade-in/slide-up)
- `postcss.config.mjs` — PostCSS com Tailwind + autoprefixer
- `vitest.config.ts` — Vitest + `@vitejs/plugin-react` + happy-dom + coverage v8
- `app/layout.tsx` — layout raiz com Inter font, metadata SEO, Providers
- `app/page.tsx` — **Página de saudação** React (Framer Motion, glass-card, status em tempo real)
- `app/error.tsx` — Error boundary global (`'use client'`, Framer Motion)
- `app/not-found.tsx` — 404 page
- `app/api/health/route.ts` — Route Handler `/api/health` (Docker HEALTHCHECK)
- `lib/providers.tsx` — TanStack Query `QueryClientProvider` + ReactQueryDevtools
- `stores/auth.ts` — Zustand store — Phantom Token Pattern (ADR-006): access token **sem persistência** (memória apenas)
- `tests/setup.ts` — setup Vitest com `@testing-library/jest-dom`

### Removed (Sprint 0 — limpeza Vue/Nuxt)

- `app.vue`, `error.vue`, `nuxt.config.ts`
- `layouts/default.vue`, `pages/index.vue`
- `plugins/vue-query.ts`, `stores/auth.ts` (Vue/Pinia)
- `server/api/health.get.ts`
- `vitest.config.ts` (Vue), `tsconfig.json` (Nuxt), `tailwind.config.ts` (Vue), `eslint.config.mjs` (Vue)
- `package.json` (Nuxt), `yarn.lock` (Nuxt)
- Diretórios: `layouts/`, `pages/`, `plugins/`, `stores/`, `locales/`, `i18n/`, `.nuxt/`, `node_modules/`

---

## [0.0.1] — Sprint 0 Inicial (Vue/Nuxt — substituído)

### Added (Sprint 0 — Nuxt 3 Bootstrap — SUBSTITUÍDO)
- `package.json` — stack completa PRD-003 (Nuxt 3, Pinia, TanStack Query, PrimeVue Unstyled, Tailwind CSS, Vitest, Playwright, i18n)
- `nuxt.config.ts` — configuração central com todos os módulos, runtimeConfig, i18n, sourcemap:false (ADR-017)
- `tsconfig.json` — TypeScript strict mode
- `tailwind.config.ts` — tema IPYSY (dark navy `#080d1a`, indigo, cyan, animações)
- `vitest.config.ts` — testes unitários com happy-dom e coverage v8
- `playwright.config.ts` — testes E2E com Chromium e Mobile Chrome
- `Dockerfile` — multi-stage: `base → development` e `base → builder → production`; gate ADR-017 no builder
- `app.vue` — NuxtLayout + NuxtPage
- `layouts/default.vue` — layout base com bg ipysy-dark
- `pages/index.vue` — **Página de saudação** (tema dark navy, gradiente indigo/cyan, indicadores de status em tempo real)
- `error.vue` — página de erro global Nuxt (404, 403, 401, 500)
- `server/api/health.get.ts` — endpoint `/api/health` (usado pelo Docker HEALTHCHECK)
- `plugins/vue-query.ts` — TanStack Query com SSR dehydrate/hydrate
- `stores/auth.ts` — Phantom Token Pattern (ADR-006): access token apenas em memória (Pinia)
- `assets/css/main.css` — Tailwind base + utilities (text-gradient, glass-card, glow-indigo)
- `locales/pt-BR.json` — strings em Português do Brasil
- `locales/en-US.json` — strings em Inglês (EUA)
- `.github/workflows/ci-cd.yml` — typecheck+tests → build Docker → push GHCR → deploy Hetzner → fallback CircleCI
- `.github/workflows/security.yml` — semanal: yarn audit + Trivy container scan + gate ADR-017
- `.circleci/config.yml` — fallback: tests → build Docker → push GHCR → deploy Hetzner
- `yarn.lock` — lockfile gerado após `yarn install`
- `.nuxt/` — tipos gerados pelo `nuxt prepare`

---

<!-- Próximas entradas seguem o formato abaixo:

## [X.Y.Z] — AAAA-MM-DD (p2-XXX→p2-YYY) — BLOCO N

### Added
- ...

### Changed
- ...

### Fixed
- ...

### Removed
- ...

-->
