# IPYSY Frontend — Instruções para Copilot / Claude

## Projeto

- **Frontend** da plataforma IPYSY — consome 20 microserviços via Gateway `https://api.ipysy.com`
- **Idioma**: comunicar **sempre** em pt-BR (código, commits, docs, respostas)
- **Backend**: `C:\Users\lgfcr\apps\paulo\ipysy-backend` (Java 21 + Quarkus 3.31.2)
- **Branch ativa**: develop

## Equipe Virtual

Este projeto opera com uma equipe virtual multidisciplinar:

| Papel | Responsabilidade |
|-------|-----------------|
| **Dev Frontend Sênior** (líder) | Arquitetura de componentes, decisões técnicas, implementação |
| **Arquiteto de Software** | Decisões de stack, padrões de projeto, integração com backend |
| **UI/UX Expert Sênior** | Design system, experiência do usuário, acessibilidade |
| **Tester / QA** | Estratégia de testes, cobertura, automação E2E |
| **Dev Backend** (consultoria) | Alinhamento com contratos de API, dúvidas de integração |
| **Tech Writer** | Documentação, guias, CHANGELOG |

## Stack (PRD-003 v1.2 — APROVADA pelo CEO/CTO — React/Next.js)

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Estado global | Zustand (sem persistência — Phantom Token) |
| Comunicação / Cache | TanStack Query (@tanstack/react-query) |
| Tempo real | WebSocket nativo + custom hooks |
| UI Componentes | shadcn/ui + Radix UI (headless) |
| UI Animações | Framer Motion |
| UI Estilização | Tailwind CSS |
| Forms | React Hook Form + Zod |
| Hooks utilitários | usehooks-ts |
| Testes unitários | Vitest + React Testing Library |
| Testes E2E | Playwright |
| Mocks integração | MSW (Mock Service Worker) |
| Observabilidade | @opentelemetry/sdk-trace-web + SigNoz |
| i18n | next-intl (pt-BR base, en-US no H1) |

- **Deploy**: Docker Hetzner (rede interna < 1ms do backend) + Cloudflare Tunnel
- **Dois portais**: `ipysy.com` SSR (público) · `app.ipysy.com` SPA (privado)
- **Sprint 0**: Fundações obrigatórias (concluídas) — React/Next.js 15 funcionando

## Comandos

```bash
yarn dev              # Servidor dev (porta 3000)
yarn build            # Build de produção (Next.js standalone)
yarn start            # Servidor de produção
yarn typecheck        # tsc --noEmit
yarn test             # Vitest (unitários)
yarn test:e2e         # Playwright (E2E)
yarn lint             # ESLint
```

- **Gateway**: `https://api.ipysy.com` — único ponto de entrada
- **Autenticação**: Phantom Token Pattern — UUID opaco retornado no login, enviado como `Authorization: Bearer <uuid>`
- **Nunca JWT direto**: o frontend nunca decodifica o token — apenas o armazena e envia
- **Token em memória**: Zustand store SEM persistência — accessToken perde ao refresh (intencional)
- **WebSocket**: `wss://api.ipysy.com/ws/v1/notifications/{userId}?token=<uuid>` para push

## Fases do Frontend (BLOCOs)

- **B0** — Onboarding: signup, login, OAuth Google, KYC, TOTP
- **B1** — Público: homepage, event detail, ranking
- **B2** — Free: my events, stats, dashboard, rankings
- **B3** — Premium: discovery, Brier Score, calibração, analytics
- **B4** — Business: API keys, contratos, org analytics
- **B5** — Academia: cursos, glossário, artigos
- **B6** — Social: feed, follows, likes, replies
- **B7** — Admin: moderação, métricas, DLQ, KYC review

## Convenções

- Commits: `tipo(escopo): descrição (p2-XX)`
- **Nunca criar `.md` na raiz** — sempre em `docs/`
- Documentação: atualizar `docs/` após mudanças em telas ou contratos de API
- Testes: manter cobertura alta — rodar antes de cada commit

## Estado Atual

- Plano unificado: `.copilot/session-state/PLANO-UNIFICADO-P2.md`
- **Stack**: React 19 + Next.js 15 (App Router) — Sprint 0 concluído
- Backend: 99% em produção — `https://api.ipysy.com` retorna 200
- `GET /` → 200 OK · `GET /api/health` → `{"status":"ok","service":"ipysy-frontend",...}`

## Estrutura do Projeto

```
app/                  # Next.js App Router
  layout.tsx          # Layout raiz (providers: TanStack Query, i18n)
  page.tsx            # Página inicial (página de saudação — Sprint 0)
  error.tsx           # Error boundary (Client Component)
  not-found.tsx       # 404
  api/health/         # Health check endpoint
types/               # Modelos / DTOs (interfaces puras — sem lógica)
  index.ts            # Barrel re-export
  device/             # ↳ DeviceInfo (web + mobile)
  common/             # ↳ ApiError, PageResponse<T>, PageRequest
stores/
  auth.ts             # Zustand store — Phantom Token (sem persist)
lib/             # Lógica de serviços e infraestrutura HTTP
  http/               # ↳ http-client.ts (client-side) + api-client.ts (server-side)
  device/             # ↳ device-info.ts (Strategy Pattern providers)
  providers/          # ↳ index.tsx (TanStack Query + providers)
  api/                # ↳ Clientes tipados por domínio + endpoints.ts (central de endpoints)
components/           # Componentes React reutilizáveis
styles/           # Tailwind CSS base
tests/                # Testes unitários (Vitest)
tests/e2e/            # Testes E2E (Playwright)
```

## Convenções React/Next.js

- `'use client'` obrigatório em componentes com state/effects/hooks do React
- Server Components por padrão (sem `'use client'`) para SSR e fetch no servidor
- Variáveis de ambiente: `NEXT_PUBLIC_*` expostas ao browser; sem prefixo = server-only
- API Routes em `app/api/[rota]/route.ts` (Next.js Route Handlers)
- Aliases: `@/` mapeia para a raiz do projeto

## graphify

Este projeto utilizará graphify para knowledge graph quando houver código suficiente.

Regras:
- Antes de responder perguntas de arquitetura, verificar se `graphify-out/GRAPH_REPORT.md` existe
- Após modificar arquivos de código, regenerar o grafo
