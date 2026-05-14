# IPYSY — Frontend

[![Status](https://img.shields.io/badge/status-em%20construção-yellow)]()
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

## 🛠️ Stack Tecnológica (PRD-003 v1.1 — Aprovada pelo CEO/CTO)

| Camada | Tecnologia |
|--------|-----------|
| Framework | **Nuxt 3 + Vue 3 + TypeScript** |
| Estado | **Pinia** |
| Comunicação / Cache | **TanStack Query + $fetch** |
| Tempo real | **WebSocket nativo + VueUse** |
| UI — Componentes | **PrimeVue (Unstyled)** |
| UI — Estilização | **Tailwind CSS** |
| Testes unitários | **Vitest + Vue Testing Library** |
| Testes E2E | **Playwright** |
| Mocks de integração | **MSW (Mock Service Worker)** |
| Observabilidade | **@opentelemetry/sdk-trace-web + SigNoz** |
| i18n | **@nuxtjs/i18n** (pt-BR base, en-US no H1) |

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

## 📝 Convenções

- **Idioma**: todo código, commits e documentação em pt-BR
- **Commits**: `tipo(escopo): descrição (p2-XX)` seguindo o padrão do backend
- **Docs**: nunca criar `.md` na raiz — sempre em `docs/`
- **Estado atual**: ver `.copilot/session-state/PLANO-UNIFICADO-P2.md`
