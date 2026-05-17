# IPYSY — Frontend

[![Status](https://img.shields.io/badge/status-coming%20soon%20live-brightgreen)]()
[![Backend](https://img.shields.io/badge/backend-99%25%20produção-brightgreen)]()
[![API](https://img.shields.io/badge/api-api.ipysy.com-blue)]()
[![Idioma](https://img.shields.io/badge/idioma-pt--BR-green)]()

**Interface web do IPYSY — Plataforma de Predição de Eventos e Reputação de Usuários.**  
Consome os 20 microserviços do backend via Gateway `https://api.ipysy.com`.

---

## 🎯 O que é o IPYSY

Plataforma de predição probabilística de eventos com sistema de reputação de usuários.  
Usuários submetem previsões, o motor matemático calcula Brier Score, IGCI, ΔR e Consenso.

### Tiers de produto

| Tier | Descrição |
|------|-----------|
| **Free** | Acesso público, leitura de eventos, ranking, dashboard básico |
| **Premium** | Discovery avançado, Brier Score pessoal, calibração, analytics |
| **Business** | API Keys B2B, contratos, org analytics, governance |

---

## 🟢 Estado Atual — Sprint 0 Concluído

| Rota | Status | Descrição |
|------|--------|-----------|
| `GET /` | ✅ Live | Redirect 307 → `/coming-soon` |
| `GET /coming-soon` | ✅ Live | Página coming-soon com design dark editorial, canvas de partículas, 5 slides rotativos |
| `POST /api/waitlist` | ✅ Live | Proxy server-side → `POST /api/v1/users/waitlist` (Gateway) |
| `GET /api/health` | ✅ Live | Health check Docker |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript** |
| Estado global | **Zustand** (sem persistência — Phantom Token) |
| Comunicação / Cache | **TanStack Query (@tanstack/react-query)** |
| Tempo real | **WebSocket nativo + custom hooks** |
| UI — Componentes | **shadcn/ui + Radix UI (headless)** |
| UI — Animações | **Framer Motion** |
| UI — Estilização | **Tailwind CSS** |
| Forms | **React Hook Form + Zod** |
| Hooks utilitários | **usehooks-ts** |
| Testes unitários | **Vitest + React Testing Library** |
| Testes E2E | **Playwright** |
| Mocks de integração | **MSW (Mock Service Worker)** |
| Observabilidade | **@opentelemetry/sdk-trace-web + SigNoz** |
| i18n | **next-intl** (pt-BR base, en-US no H1) |

**Deploy**: Docker no Hetzner (mesma rede interna do backend, latência < 1ms) + Cloudflare Tunnel  
**Dois portais**: `ipysy.com` (SSR — portal público) · `app.ipysy.com` (SPA — portal privado)

---

## 🗺️ Grupos de Telas (BLOCOs) — 40 telas · 4 sprints

| Grupo | Telas | Qtd | Sprint | Cobertura Backend |
|-------|-------|-----|--------|-------------------|
| B0 — Onboarding & Identidade | Signup, Login, OAuth Google, KYC Nível 1–4, TOTP | 14 | 1–2 | ~95% |
| B1 — Público | HomePage, Lista Eventos, Detalhe Evento | 3 | 1 | ~100% |
| B2 — Free Logado | Onboarding produto, Dashboard, Rankings, Perfil | 4 | 1–2 | ~90% |
| B3 — Premium | Dashboard avançado, Previsão, Perfil+Rep., Simulações, Selo | 5 | 2–3 | ~75% |
| B4 — Business | Dashboard inst., Criação evento, Insights, API Mgmt, Times | 5 | 3–4 | ~90% |
| B5 — Academia | Academia IP, Glossário | 2 | 4 | ~85% |
| B6 — Social | Feed social, Comentários, Perfil público do previsor | 3 | 3 | ~95% |
| B7 — Admin | Dashboard admin, Gestão editorial, Usuários/LGPD, Logs | 4 | 2–3 | ~80% |

| Serviço | Porta | Responsabilidade |
|---------|-------|-----------------|
| Gateway | 8080 | Proxy reverso, rate limit, roteamento |
| Security | 9001 | Auth, signup, OAuth Google, KYC, TOTP |
| Profile | 9002 | Dados de perfil do usuário |
| User | 9003 | Identidade, privacidade, LGPD/GDPR/CCPA |
| Event | 9004 | Criação e gestão de eventos |
| Alert | 9005 | Alertas automáticos |
| Notification | 9006 | Notificações + WebSocket push |
| Reputation | 9007 | ΔR, ranking, percentil |
| Consensus | 9008 | IGCI, consenso multiclasse |
| Prediction | 9009 | Submissão de previsões, Brier Score |
| Resolution | 9010 | Resolução de eventos |
| Comment | 9011 | Comentários |
| Voting | 9012 | Votos em outcomes |
| Entitlement | 9013 | Planos, pricing, Stripe webhook |
| Governance | 9014 | Teams e permissões Business |
| Analytics | 9015 | KPIs, métricas admin |
| Seal | 9016 | Selos de reputação (NONE→DIAMOND) |
| Contract | 9017 | API Keys B2B, contratos |
| News | 9018 | Context Service (NCS), correlação com eventos |
| Scenario | 9019 | Cenários (DEFERRED) |

**Autenticação**: Phantom Token Pattern — o frontend recebe um UUID opaco (nunca JWT direto).  
**Todas as chamadas** vão para `https://api.ipysy.com` (Gateway).

---

## 📐 Grupos de Telas (BLOCOs)

| Grupo | Telas | Cobertura Backend |
|-------|-------|-------------------|
| B0 — Onboarding | Signup, Login, OAuth, KYC, TOTP | ~95% |
| B1 — Público | HomePage, Event Detail, Ranking | ~100% |
| B2 — Free | My Events, Stats, Dashboard, Rankings | ~90% |
| B3 — Premium | Discovery, Brier Score, Calibração, Analytics | ~75% |
| B4 — Business | API Keys, Contratos, Org Analytics | ~90% |
| B5 — Academia | Cursos, Glossário, Artigos | ~85% |
| B6 — Social | Feed, Follows, Likes | ~95% |
| B7 — Admin | Moderação, Métricas, DLQ, KYC Review | ~80% |

---

## 📚 Documentação

Toda a documentação do frontend está em [`docs/`](docs/README.md).

### Para novos devs — leia nesta ordem

| # | Documento | O que você vai aprender |
|---|-----------|------------------------|
| 1 | [Padrão BFF](docs/technical/BFF-PATTERN.md) | Como o frontend se comunica com o backend — fluxo completo request → response |
| 2 | [Infraestrutura HTTP](docs/technical/HTTP-CLIENT.md) | Pipeline de middlewares, `httpClient`, `apiClient`, `endpoints.ts`, `device-info` |

### Referências

- **Plano unificado**: `.copilot/session-state/PLANO-UNIFICADO-P2.md`
- **Contexto do backend**: `https://github.com/lpmaximus/ipysy-backend`
- **API em produção**: `https://api.ipysy.com/static/infographic.html`

---

## 🔐 Segurança & Compliance

O frontend deve respeitar:
- **Phantom Token**: nunca armazenar JWT — apenas o UUID opaco
- **LGPD / GDPR / CCPA**: não coletar dados além do necessário
- **LGL-001**: não exibir header `X-Data-Usage-Policy` ao usuário final (apenas B2B)
- **CI-06 / CI-09**: nunca exibir `thumbnail_key` ou campos internos na UI

---

## 💻 Comandos de Desenvolvimento

```bash
yarn install          # Instalar dependências
yarn dev              # Servidor dev (porta 3000)
yarn build            # Build de produção
yarn start            # Servidor de produção
yarn typecheck        # Verificação de tipos TypeScript
yarn test             # Testes unitários (Vitest)
yarn test:e2e         # Testes E2E (Playwright)
yarn lint             # Lint (ESLint)
```

## 🐳 Docker

```bash
# Desenvolvimento local
docker compose --env-file .env up --build

# Produção
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

---

## 📁 Estrutura do Projeto

```
ipysy-frontend/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Layout raiz — providers, fonte Inter, metadata SEO
│   ├── page.tsx                  # GET /  →  redirect 307 /coming-soon
│   ├── icon.svg                  # Favicon IPYSY (auto-detectado pelo App Router)
│   ├── error.tsx                 # Error boundary global (Client Component)
│   ├── not-found.tsx             # Página 404
│   │
│   ├── coming-soon/
│   │   └── page.tsx              # GET /coming-soon — página editorial dark + waitlist
│   │
│   └── api/
│       ├── health/
│       │   └── route.ts          # GET  /api/health     — Docker HEALTHCHECK
│       └── waitlist/
│           └── route.ts          # POST /api/waitlist   — proxy → Gateway /api/v1/users/waitlist
│
├── types/                       # Modelos / DTOs (interfaces puras — sem lógica)
│   ├── index.ts                  # Barrel re-export central
│   ├── device/
│   │   └── device-info.ts        # DeviceInfo — interface web + mobile compartilhada
│   └── common/
│       └── api.ts                # ApiError, PageResponse<T>, PageRequest
│
├── lib/                     # Lógica de serviços e infraestrutura HTTP
│   ├── http/
│   │   ├── http-client.ts        # HttpClient — pipeline de middlewares (chain-of-responsibility)
│   │   │                         #   └─ deviceInfoMiddleware registrado automaticamente
│   │   ├── api-client.ts         # ApiClient — client server-side (BFF → Java Gateway)
│   │   │                         #   └─ métodos: get/post/put/patch/delete + fetch genérico
│   │   └── index.ts              # Barrel (⚠️ não importar direto — use os caminhos abaixo)
│   │                             #   Client Components → @/lib/http/http-client
│   │                             #   Route Handlers   → @/lib/http/api-client
│   ├── device/
│   │   └── device-info.ts        # Strategy Pattern — DeviceInfoProvider
│   │                             #   ├─ WebDeviceInfoProvider (auto-registrado no browser)
│   │                             #   └─ registerDeviceInfoProvider() (troca para React Native)
│   ├── providers/
│   │   └── index.tsx             # TanStack Query QueryClientProvider + ReactQueryDevtools
│   │
│   └── api/                      # Clientes tipados por domínio (usam httpClient) + endpoints centralizados
│       ├── endpoints.ts          # API.* — todos os ~50 endpoints dos 20 microserviços (BASE → SERVICE → API)
│       └── waitlist.ts           # registerWaitlist() — mapeamento completo de status HTTP
│
├── stores/                       # Zustand stores (sem persistência — Phantom Token)
│   └── auth.ts                   # accessToken em memória; nunca em localStorage/cookie
│
├── components/                   # Componentes React reutilizáveis (a popular no Sprint 1)
│
├── assets/
│   └── css/
│       └── main.css              # Tailwind CSS base + utilities globais
│
├── tests/
│   ├── setup.ts                  # Vitest setup — @testing-library/jest-dom
│   ├── unit/                     # Testes unitários (Vitest + RTL)
│   └── e2e/                      # Testes E2E (Playwright)
│
├── scripts/
│   └── vault/
│       └── render-frontend-env.sh  # Lê secret/ipysy/frontend do Vault → vault-runtime/.env.vault-frontend
│
├── infrastructure/
│   └── nginx/
│       └── proxy.conf            # Nginx proxy local (docker-compose.infrastructure.yml)
│
├── vault-runtime/                # Segredos gerados pelo Vault (ignorado pelo git)
│   └── .gitkeep
│
├── public/                       # Assets estáticos servidos em /
│
├── docs/
│   ├── README.md                 # Índice da documentação
│   ├── technical/
│   │   └── HTTP-CLIENT.md        # Infraestrutura HTTP — middleware pipeline + device-info
│   └── business-docs/            # 40 documentos de negócio importados
│       ├── prd/                  # PRD-001, PRD-002 (mapa telas), PRD-003 (stack aprovada)
│       ├── adr/                  # ADR-006 a ADR-017
│       ├── lgl/                  # Termos de Uso, Política de Privacidade
│       ├── evt/                  # Viabilidade técnica, Selos
│       ├── edt/                  # Compliance BR/PT, Manual Editorial
│       ├── frontend-mockups/     # Mockups HTML + PPTX + mapa de telas
│       └── ...
│
├── .env                          # Variáveis base (não secretas)
├── .env.local                    # Dev local — API_BASE_URL=https://api.ipysy.com  ← yarn dev
├── .env.prod                     # Produção Hetzner (não versionado)               ← docker prod
├── docker-compose.yml            # Dev local com build local
├── docker-compose.prod.yml       # Produção — imagem GHCR + env_file Vault
├── docker-compose.infrastructure.yml  # Nginx proxy local
├── Dockerfile                    # Multi-stage: builder → runner (Next.js standalone)
├── next.config.ts                # standalone output, headers de segurança, SWC removeConsole
├── tailwind.config.ts            # Tema IPYSY — dark navy, dourado, animações
├── vitest.config.ts              # Testes unitários — happy-dom + coverage v8
├── playwright.config.ts          # Testes E2E — Chromium + Mobile Chrome
└── tsconfig.json                 # TypeScript strict + aliases @/*
```

### Aliases de importação

| Alias | Resolve para | Exemplo |
|-------|-------------|---------|
| `@/types/*` | `types/*` | `import type { DeviceInfo } from '@/types/device/device-info'` |
| `@/lib/*` | `lib/*` | `import { httpClient } from '@/lib/http/http-client'` |
| `@/stores/*` | `stores/*` | `import { useAuthStore } from '@/stores/auth'` |
| `@/components/*` | `components/*` | `import { Button } from '@/components/ui/button'` |

---

## 📝 Convenções

- **Idioma**: todo código, commits e documentação em pt-BR
- **Commits**: `tipo(escopo): descrição (p2-XX)` seguindo o padrão do backend
- **Docs**: nunca criar `.md` na raiz — sempre em `docs/`
- **Estado atual**: ver `.copilot/session-state/PLANO-UNIFICADO-P2.md`
