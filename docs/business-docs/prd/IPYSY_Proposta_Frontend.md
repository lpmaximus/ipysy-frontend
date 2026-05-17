# 📊 PROPOSTA OFICIAL — FRONTEND DO PROJETO IPYSY

> **Histórico:** Esta versão incorpora as decisões da reunião de staff técnico realizada com CEO, CTO, Backend Lead, Frontend Lead, DevOps/SRE Lead, Product Manager e QA Lead.

---

# 🎯 OBJETIVO DO PROJETO IPYSY

O **IPYSY (Prediction Intelligence & Reputation Platform)** é uma plataforma distribuída baseada em microserviços para:

* 📊 Predição de eventos
* 🧠 Cálculo de reputação de usuários (Brier Score)
* 📈 Consenso coletivo (IGCI)
* 🌐 Interação social e inteligência coletiva
* 🏢 Aplicações B2C, B2B e educacionais

👉 O frontend proposto será a **camada de experiência unificada**, conectando usuários a um ecossistema altamente distribuído e orientado a eventos.

---

# 🧠 VISÃO ESTRATÉGICA DO FRONTEND

O frontend do IPYSY não é apenas uma interface. Ele é:

👉 **a camada de orquestração da experiência sobre uma arquitetura distribuída complexa**

Com dois pilares:

## 🌍 Portal Público IPYSY

* SEO e indexação
* Exposição de dados públicos (eventos, rankings, conteúdo)
* Aquisição de usuários

## 🔐 Portal Privado IPYSY

* Operações completas da plataforma
* Dashboards, análises, interações sociais
* Consumo intensivo de dados e eventos

---

# 🏗️ ARQUITETURA GLOBAL (ALINHADA AO INFOGRÁFICO)

O IPYSY opera sobre uma arquitetura distribuída moderna composta por:

## 🔹 Camada de Entrada

* API Gateway (porta 8080)
* Controle centralizado de acesso

## 🔹 Camada de Serviços (20 microserviços)

Organizados por domínio:

* Autenticação e segurança (Security)
* Usuários e reputação
* Predições e eventos
* Feed social
* Analytics (CQRS)
* Administração e moderação
* Serviços B2B

👉 Cada serviço é:

* Independente
* Escalável
* Orientado a domínio

---

## 🔹 Camada de Dados e Mensageria

* PostgreSQL (dados transacionais)
* TimescaleDB (dados temporais e métricas de negócio)
* Redis (cache de sessão, phantom tokens e dados de alta velocidade)
* Kafka (event streaming entre serviços)

👉 Padrões utilizados:

* Event-driven architecture
* Outbox Pattern
* Sagas distribuídas

> **Nota Arquitetural:** O Kafka atua exclusivamente na comunicação entre microserviços (backend-to-backend). A interação com o frontend ocorre via API Gateway, garantindo isolamento e segurança.

---

## 🔹 Observabilidade

* OpenTelemetry (tracing distribuído ponta a ponta)
* SigNoz (monitoramento unificado — backend ClickHouse para traces/métricas)
* Logging estruturado (JSON)

> **Nota:** O TimescaleDB armazena dados temporais de negócio (métricas de predição, séries temporais). O backend de observabilidade do SigNoz opera sobre ClickHouse, mantendo os domínios de dados de negócio e dados de plataforma isolados.

---

## 🔹 Infraestrutura

* Cloudflare (CDN + Edge)
* Consul (service discovery)
* MinIO + KES (armazenamento seguro)

---

# 🧠 IMPLICAÇÕES PARA O FRONTEND

Dada essa arquitetura, o frontend precisa ser:

### ⚡ Inteligente

* Gerenciar cache de dados distribuídos
* Evitar sobrecarga no gateway com estratégias de requisição otimizadas (retry com exponential backoff e jitter, com circuit breaker centralizado no Gateway Quarkus)

### 🔄 Reativo

* Suportar atualizações em tempo real via WebSocket para notificações críticas

### 🌐 Performático

* SEO forte, carregamento rápido e renderização híbrida

### 🧩 Flexível

* Adaptar-se a múltiplos domínios de negócio com componentes reutilizáveis

### 🔒 Seguro por Design

* Tokens em memória (não persistidos em storage) com refresh silencioso via httpOnly cookie, propagação de contexto de segurança

---

# 🏗️ ARQUITETURA FRONTEND

Modelo híbrido:

* **SSR (Server-Side Rendering)** → Portal Público (SEO, performance percebida)
* **SPA (Single Page Application)** → Portal Privado (interatividade rica)

```plaintext
[ Frontend IPYSY (Next.js 15) - Container Docker no Hetzner ]
        ↓
[ Gateway :8080 - Mesma infraestrutura Hetzner ]
        ↓
[ Microserviços + Kafka + Cache ]
```

## 👉 **Decisão de infraestrutura:**

* Frontend e backend co-localizados no **Hetzner** (mesmo datacenter, baixa latência)
* Deploy via **GitHub Actions/CircleCI** (mesmo pipeline já existente)
* Containerização com **Docker** (`node/server/index.mjs` via Next.js SSR)
* **Health check e restart policy `unless-stopped`** configurados no Dockerfile — obrigatório antes do deploy em staging
* Exposição pública via **Cloudflare Tunnel** (www.ipysy.com), sem necessidade de Cloudflare Pages
* **Runbook de recovery do Cloudflare Tunnel** documentado antes do go-live
* Controle total de runtime, sem limitações de edge

---

# 🔐 AUTENTICAÇÃO

## 👉 Phantom Token Pattern com token em memória

* Token opaco (UUID) gerenciado pelo microserviço Security
* Token armazenado **exclusivamente em memória** (variável reativa do Zustand/Next.js)
* Refresh token armazenado em **httpOnly cookie** (gerenciado pelo Gateway)
* Validação via Redis com TTL controlado (cache de phantom tokens no Security Service)
* Integração com Keycloak para gestão de identidade

### Fluxo:

```plaintext
Frontend → Gateway → Security Service → [Redis Cache HIT: ~2-5ms]
         ← Token em memória + httpOnly cookie refresh ←

[Cache MISS: Security Service → Keycloak → cacheia no Redis → responde]
```

> **Nota SSR:** no primeiro acesso ou reload, o servidor Next.js realiza refresh silencioso via cookie httpOnly antes do hydrate, repovoando a store em memória sem piscar a tela. O cache Redis no Security Service elimina a latência de ida ao Keycloak em 95%+ das requisições, tornando o SSR autenticado viável sem impactar o TTFB.

> **Nota de Segurança:** O TTL do cache Redis é configurado **menor** que o TTL do token no Keycloak (ex: 10-12 minutos no Redis vs. 15 minutos no Keycloak), garantindo que revogações no Keycloak sejam eventualmente propagadas.

---

## ✅ Benefícios

* Segurança elevada com tokens de curta duração
* **Redução de superfície de ataque** (token não persiste em localStorage ou sessionStorage; refresh token em httpOnly cookie permanece inacessível ao JavaScript)
* Desacoplamento do provider de identidade (Keycloak permanece como fonte de verdade)
* Controle centralizado de sessões e auditoria
* Refresh silencioso para melhor UX
* **Performance de cache**: Redis no Security Service reduz latência de validação de ~80-150ms para ~2-5ms na maioria das requisições

---

# 🧩 STACK FRONTEND

## 🧱 Core

* Next.js 15 (framework fullstack React)
* React 19 + Composition API
* TypeScript (tipagem forte e segurança em desenvolvimento)

---

## 📦 Estado

* Zustand (gerenciamento de estado leve e modular)

---

## 🔄 Comunicação (PADRÃO DEFINIDO)

* TanStack Query como **fonte única de verdade** para dados dinâmicos
* `$fetch` (nativo do Next.js) utilizado como fetcher interno do TanStack Query
* Dados estáticos (configurações, i18n) utilizam `useFetch` do Next.js sem TanStack Query
* Implementação de **retry com exponential backoff + jitter** no cliente para evitar sobrecarga do gateway durante degradações parciais
* **Circuit breaker centralizado no Gateway Quarkus** (SmallRye Fault Tolerance), não no cliente, protegendo o ecossistema sem criar experiências degradadas difíceis de diagnosticar no browser

---

## 📊 Cache e sincronização

* TanStack Query

👉 CRÍTICO para:

* Orquestração de dados provenientes de 20 microserviços
* Dados dinâmicos (reputação, ranking, eventos)
* Redução de latência e chamadas redundantes
* Experiência offline-first e revalidação inteligente
* **Desidratação e reidratação de dados no SSR** (evita flash de carregamento)

---

## 🧰 Tempo real

* WebSocket nativo com usehooks-ts — **canal único para notificações no MVP**

* Alinhado com a arquitetura backend:

👉 Escopo do MVP:

1. **Serviço de Notificação** → notificações para usuários específicos ou broadcast
2. Fallback automático para long polling em caso de queda de WebSocket

👉 Fase 2 (Sprint 3–4, pós-estabilização):

* Relatórios assíncronos via WebSocket
* Dashboards ao vivo, presença de usuários, feeds em tempo real

> **Solução interina para relatórios:** polling ou notificação por e-mail até a implementação do canal assíncrono completo.

> **Dimensionamento validado:** carga de 500 conexões WebSocket simultâneas testada via k6 no pipeline de staging como critério de aceite de deploy.

> **Nota Arquitetural:** O Consul atua como service discovery (descobre instâncias do serviço de notificação). O balanceamento com sticky sessions é responsabilidade do Load Balancer (ip_hash ou cookie-based), não do Consul diretamente.

---

## 🎨 UI

A experiência visual do IPYSY será construída sobre uma **stack única e madura**, escolhida não apenas por qualidade técnica, mas por **velocidade de entrega, consistência de marca e escalabilidade operacional**.

**shadcn/ui** será a biblioteca base de componentes. Ela fornece prontamente tabelas avançadas, grids responsivos, formulários complexos, calendários, gráficos integrados e dashboards operacionais — todos com acessibilidade (WCAG 2.1 AA) embutida. Isso elimina a necessidade de recriar do zero elementos que levam semanas para desenvolver e validar, acelerando o time-to-market de novas funcionalidades.

**Tailwind CSS** será a camada de customização visual, adotando o modo **Unstyled** do shadcn/ui. O resultado é:

* **Um único sistema de design** — cores, espaçamentos, tipografia e estados definidos uma vez
* **Bundle de CSS mínimo** — apenas classes utilizadas são enviadas ao navegador
* **Manutenção previsível** — novos temas (modo escuro, white-label B2B) implementados em horas

> **Sprint 0 obrigatório:** duas semanas de design system base (shadcn/ui + Radix UI + Tailwind + presets Aura/Lara) antes de qualquer feature de negócio. Inclui spike de hydration SSR.

---

## 🔍 Observabilidade Frontend

* **@opentelemetry/sdk-trace-web** instrumentado a partir do Sprint 1
* Propagação de TraceID em todas as requisições HTTP e WebSocket

👉 Estratégia de sampling faseada:

* **Staging:** 0% de traces normais, 100% de erros
* **Lançamento (semanas 1–4):** 5% de traces normais, 100% de erros
* **Pós-estabilização:** 10% de traces normais, 100% de erros

> Esta abordagem garante visibilidade em falhas desde o dia 1, controlando custo de armazenamento no SigNoz durante o crescimento inicial.

---

## 🧪 Testes e Qualidade

* **Vitest** — testes unitários rápidos (funções, Custom Hooks, stores Zustand)
* **React Testing Library** — testes de componentes focados no comportamento do usuário
* **Playwright** — testes end-to-end das jornadas críticas
* **MSW (Mock Service Worker)** — testes de integração com gateway mockado, sem dependência externa

👉 Estratégia faseada de cobertura:

**Obrigatório antes do go-live (critério de aceite):**

* ✅ Jornada 1: Login → token em memória → requisição autenticada
* ✅ Jornada 2: Refresh silencioso no SSR sem flash de tela
* ✅ Jornada 3: Fluxo completo de predição (criação → confirmação → reputação)

**Meta 90 dias pós-lançamento:**

* Coverage E2E geral > 80% das jornadas de produto
* Lighthouse Score (Performance + Acessibilidade) > 90

---

# 🎨 ESTRATÉGIA DE UI (NÍVEL ENTERPRISE)

👉 Stack única e madura:

* **shadcn/ui** → tabelas avançadas, grids, formulários complexos, dashboards operacionais, componentes acessíveis (WCAG 2.1 AA)
* **Tailwind CSS** → customização de temas, utilities, manutenção consistente

---

## 💥 Resultado

* ⚡ **Performance otimizada para Core Web Vitals** — carregamento rápido reduz bounce rate e melhora ranqueamento orgânico
* 🌍 **SEO robusto para aquisição orgânica** — menos CSS bloqueante significa renderização mais rápida das páginas públicas
* 🚀 **Produtividade da equipe** — componentes enterprise prontos permitem foco em regras de negócio
* 🧩 **Menos decisões de arquitetura de UI** — padrão único, documentado e replicável

---

# 🌐 CONFIGURAÇÃO DE AMBIENTE

```bash
# .env.development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws

# .env.staging
NEXT_PUBLIC_API_BASE_URL=https://api-staging.ipysy.com
NEXT_PUBLIC_WS_URL=wss://api-staging.ipysy.com/ws

# .env.production
NEXT_PUBLIC_API_BASE_URL=https://api.ipysy.com
NEXT_PUBLIC_WS_URL=wss://api.ipysy.com/ws
```

👉 Diretrizes:

* Variáveis sensíveis gerenciadas via GitHub Actions secrets / CircleCI environment variables
* Variáveis públicas prefixadas com `NEXT_PUBLIC_*` — acessíveis no client e no server SSR
* `$fetch` e WebSocket configurados com URL dinâmica via `process.env / NEXT_PUBLIC_*`

Ambientes suportados:

* Dev (desenvolvimento local e CI)
* Staging (validação pré-produção)
* Produção (Hetzner + Cloudflare Tunnel)

---

# 🚀 BUILD E DEPLOY

* **Infraestrutura:** Hetzner (mesmo datacenter dos microsserviços)
* **Containerização:** Docker com `node/server/index.mjs` + health check + restart policy `unless-stopped`
* **Orquestração:** Junto aos 20 microsserviços (mesma rede interna, baixa latência <1ms)
* **CI/CD:** GitHub Actions (pipeline unificado com backend) / CircleCI como fallback
* **Exposição pública:** Cloudflare Tunnel → www.ipysy.com
* **Load test:** k6 no pipeline de staging — threshold 500 conexões WebSocket simultâneas como gate de deploy

👉 Benefícios:

* Controle total de runtime (sem limitações de edge)
* Baixa latência frontend ↔ gateway (mesma rede interna)
* Deploy automatizado com rollback via GitHub Actions / CircleCI
* Segurança e CDN via Cloudflare Tunnel (WAF, DDoS protection)

👉 Critérios de aceite de deploy para produção:

* Health check do container respondendo em < 5s
* Load test k6 passando no threshold de WebSocket
* As 3 jornadas E2E críticas passando no Playwright CI
* Zero erros de autenticação nos últimos 30 minutos de staging

---

# 🌍 INTERNACIONALIZAÇÃO

* **next-intl** configurado no Sprint 0 — estrutura técnica sem impacto de velocidade
* **MVP:** pt-BR exclusivo — foco total no mercado brasileiro para validação de produto
* **H1 (pós-validação de retenção no Brasil):** en-US habilitado com conteúdo traduzido
* **H1 (expansão):** pt-PT via infraestrutura já preparada, sem retrabalho estrutural
* **H2:** Espanha, Alemanha e Ásia

> **Decisão estratégica:** lançar en-US simultaneamente ao MVP dividiria foco de produto, suporte e marketing sem aprendizado suficiente do mercado primário. A estrutura i18n garante que a habilitação de novos idiomas seja operacional, não arquitetural.

---

# 🔍 OBSERVABILIDADE FRONTEND (INTEGRAÇÃO COM SIGNOZ)

👉 O frontend será instrumentado para:

* Propagação de contexto de tracing (OpenTelemetry) em todas as requisições HTTP e WebSocket
* Correlação de traces entre clique do usuário, gateway, microserviços, banco e notificação WebSocket
* Monitoramento de performance real do usuário (RUM)
* Captura estruturada de erros de cliente para análise proativa
* Sampling faseado: 5% no lançamento → 10% pós-estabilização, 100% para erros

> **Impacto:** Visibilidade completa da jornada do usuário com custo de observabilidade controlado desde o primeiro dia.

---

# 🔒 SEGURANÇA E CONFORMIDADE

👉 Diretrizes incorporadas:

* **Token em memória** (não persistido em storage) + **refresh token em httpOnly cookie**
* Headers de segurança configurados via Next.js (CSP, HSTS, X-Frame-Options)
* Conformidade com WCAG 2.1 AA para acessibilidade (requisito B2B e educacional)
* Auditoria de ações do usuário integrada ao backend
* Proteção contra CSRF (cookie samesite)

---

# 🛡️ PROTEÇÃO DO CÓDIGO-FONTE (OFUSCAÇÃO E HARDENING)

## 👉 Contexto e objetivo

O JavaScript entregue ao browser é inerentemente inspecionável — o runtime precisa executá-lo. O objetivo desta estratégia não é tornar o código impenetrável, mas **elevar o custo de engenharia reversa ao ponto de inviabilizar economicamente a cópia ou clonagem do produto**, especialmente relevante para os módulos B2B e white-label do IPYSY.

> **Premissa técnica:** Nenhuma ofuscação substitui segurança real no backend. Algoritmos de reputação (Brier Score), lógica de IGCI e regras de negócio sensíveis devem residir exclusivamente nos microserviços — nunca no bundle do cliente. A ofuscação protege a **implementação da experiência**, não os dados ou regras de domínio.

---

## 🔹 Estratégia diferenciada por portal

A ofuscação é aplicada com intensidade diferente por contexto, preservando as metas de performance da proposta (LCP < 2,5s no portal público):

| Camada | Portal Público | Portal Privado |
|---|---|---|
| Minificação + mangle | ✅ Terser agressivo | ✅ Terser agressivo |
| Remoção de source maps | ✅ Obrigatório | ✅ Obrigatório |
| String array encoding | ✅ threshold 0,5 | ✅ threshold 0,75 |
| Control flow flattening | ❌ Impacta LCP/SEO | ✅ threshold 0,5 |
| Dead code injection | ❌ Aumenta bundle público | ✅ threshold 0,2 |
| Self-defending | ❌ | ✅ |
| Verificação de domínio autorizado | ❌ | ✅ Módulos B2B |
| Proteção contra engenharia reversa (nível dificultador) | ✅ | ✅ |

> **Justificativa:** O portal público tem meta de LCP < 2,5s e impacto direto em SEO. `controlFlowFlattening` aumenta o bundle em até 40% e pode comprometer o Lighthouse Score. O portal privado não tem restrições de SEO — ofuscação agressiva é aplicada sem penalidade de negócio.

---

## 🔹 Ferramentas adotadas

### 1. javascript-obfuscator (via vite-plugin-javascript-obfuscator)

Ferramenta principal de ofuscação. Aplicada exclusivamente no build de produção (`apply: 'build'`), sem impacto no DX de desenvolvimento.

👉 O que aplica:
* Renomeação de variáveis, funções e classes para strings sem sentido semântico
* Codificação de string literals em arrays cifrados com rotação de índices
* Control flow flattening no portal privado — embaralha a ordem lógica de execução
* Dead code injection — insere blocos de código inerte para dificultar análise estática
* Self-defending — o bundle detecta reformatação e interrompe execução

### 2. Terser (minificação agressiva)

Substitui o minificador padrão esbuild do Next.js para produção. Oferece remoção de `console.*`, `debugger`, comentários e renomeação de propriedades prefixadas com `_`.

### 3. Remoção de source maps em produção

Source maps são o principal vetor de engenharia reversa — mapeiam o bundle ofuscado de volta ao código-fonte original. **Proibidos no artefato de produção.**

👉 Fluxo no CI/CD:
* Source maps gerados durante o build para uso interno
* Upload para SigNoz/serviço de monitoramento antes do deploy
* **Deletados do artefato** antes do push para o container de produção
* Gate no pipeline: build falha se source map for detectado no artefato final

### 4. Verificação de domínio autorizado (módulos B2B)

Para deployments white-label B2B, o bundle verifica em runtime se está sendo executado em um domínio autorizado. Combinado com ofuscação, eleva o custo de reutilização não autorizada do produto em contextos licenciados.

---

## 🔹 Impacto nos critérios de performance

| Métrica | Sem ofuscação | Com ofuscação (público) | Com ofuscação (privado) |
|---|---|---|---|
| Bundle size | base | +5–10% | +25–40% |
| Build time | base | +15–20s | +30–45s |
| LCP impacto | — | Neutro | Aceitável (SPA) |
| DX local | — | Zero (apply: build) | Zero (apply: build) |

> A ofuscação é aplicada **apenas no pipeline de produção**. Desenvolvimento local e staging operam com código legível para facilitar diagnóstico e debugging.

---

## 🔹 Source maps privados no SigNoz

Source maps removidos do bundle público são enviados ao SigNoz durante o CI, permitindo que stack traces de erros sejam **desobfuscados internamente** para diagnóstico — sem expor o mapeamento ao usuário final.

👉 Fluxo:
```plaintext
Build CI → Gera source maps → Upload SigNoz → Delete do artefato → Deploy container
```

Isso garante que a observabilidade interna não seja comprometida pela proteção do código-fonte.

---

## 📋 Entregável no Sprint 0

| Entregável | Responsável | Critério de Aceite |
|---|---|---|
| Pipeline de ofuscação configurado (público + privado) | Frontend Lead + DevOps/SRE Lead | Build de produção sem source maps; bundle ofuscado validado no staging |
| Upload de source maps para SigNoz no CI | DevOps/SRE Lead | Stack trace de erro desobfuscado visível no SigNoz |
| Gate de source map no pipeline | DevOps/SRE Lead | Build falha automaticamente se `.map` detectado no artefato final |

---

# 📈 BENEFÍCIOS PARA O NEGÓCIO

## 💰 Crescimento

* SEO técnico otimizado → aquisição orgânica de usuários
* MVP focado no Brasil → validação rápida antes da expansão global
* Plataforma escalável horizontalmente no Hetzner
* **Metas mensuráveis:** TTFB < 200ms na região do datacenter, < 600ms para Brasil no portal público; LCP < 2,5s

## ⚙️ Tecnologia

* Integração perfeita com arquitetura de microsserviços existente
* **Latência mínima** (frontend e backend no mesmo datacenter, <1ms)
* Observabilidade ponta a ponta faseada para controle de custo
* WebSocket bidirecional para notificações com fallback garantido

## 👨‍💻 Produtividade

* Desenvolvimento acelerado com DX moderno (Vite, HMR, TypeScript)
* Manutenção simplificada com stack única (shadcn/ui + Tailwind)
* Onboarding rápido com Sprint 0 dedicado a fundações e padrões

## 🛡️ Risco Controlado

* Decisões técnicas validadas por maturidade de ecossistema
* **Deploy no mesmo ambiente dos microsserviços** (sem surpresas de edge)
* Spike de hydration SSR no Sprint 0 elimina risco de retrabalho tardio
* Backup automatizado antes do go-live; replicação de região secundária no H2, com CDN estático via Cloudflare Tunnel

---

# 🗓️ SPRINT 0 — FUNDAÇÕES OBRIGATÓRIAS

> Sprint 0 é pré-requisito para qualquer feature de negócio. Duração: 2 semanas.

| Entregável | Responsável | Critério de Aceite |
|---|---|---|
| Spike de hydration SSR (Next.js + TanStack Query + Zustand) | Frontend Lead | Protótipo funcional ou documento de problemas com solução |
| Design system base (shadcn/ui + Radix UI + Tailwind + preset Aura/Lara) | Frontend Lead | Componentes core renderizando sem conflito de estilo |
| Health check + restart policy no Dockerfile | DevOps/SRE Lead | Container reinicia automaticamente em falha |
| Runbook de recovery do Cloudflare Tunnel | DevOps/SRE Lead | Procedimento testado e documentado |
| Variáveis de ambiente para dev/staging/produção | DevOps/SRE Lead | `process.env / NEXT_PUBLIC_*` funcionando nos 3 ambientes |
| next-intl configurado (pt-BR base) | Frontend Lead | Rotas e strings pt-BR funcionando |
| MSW configurado com handlers base | QA Lead | Gateway mockado respondendo nos testes |
| Pipeline CI/CD com Playwright (3 jornadas críticas) | QA Lead + DevOps | Pipeline bloqueando PR com falha E2E |
| k6 load test no pipeline de staging | DevOps/SRE Lead | Threshold 500 WebSocket bloqueando deploy em falha |
| Backup automatizado do estado configurado | DevOps/SRE Lead | Restore testado com sucesso |
| Pipeline de ofuscação (público + privado) + gate de source map | Frontend Lead + DevOps/SRE Lead | Build produção sem `.map`; bundle ofuscado validado; source maps no SigNoz |

---

# 🎯 MITIGAÇÃO DE RISCOS TÉCNICOS

| Risco | Mitigação | Responsável | Prazo |
|-------|-----------|-------------|-------|
| TTFB elevado fora da Europa | Cache agressivo no Cloudflare + ISR/SSG Next.js para conteúdo público | DevOps + Frontend | Sprint 1-2 |
| Falha de refresh silencioso no SSR | Spike dedicada no Sprint 0; fallback para auth no cliente + retry automático | Frontend Lead | Sprint 0 |
| WebSocket cair em escala | Long polling automático + reconexão exponencial; k6 como gate de deploy | Backend + Frontend | Sprint 0 (k6) / Sprint 2-3 (escala) |
| CSS inconsistente (shadcn/ui + Tailwind) | Design system tokenizado no Sprint 0 antes de qualquer feature | Frontend Lead | Sprint 0 |
| Cache Redis indisponível | Security Service degrada elegantemente para Keycloak direto | Backend | Implementado |
| Conflito de cache ($fetch vs TanStack Query) | TanStack Query como fonte única de verdade; $fetch apenas como fetcher interno | Frontend | Sprint 0 |
| Cloudflare Tunnel indisponível | Runbook de recovery testado; monitoramento de uptime do túnel no SigNoz | DevOps/SRE Lead | Sprint 0 |
| Retrabalho de hydration SSR | Spike time-boxed no Sprint 0 com output concreto obrigatório | Frontend Lead | Sprint 0 |
| Ofuscação impactando LCP no portal público | Estratégia diferenciada: ofuscação leve no público (sem controlFlowFlattening), agressiva apenas no privado | Frontend Lead | Sprint 0 |
| Source map vazar no artefato de produção | Gate automático no CI — build falha se `.map` detectado no artefato final | DevOps/SRE Lead | Sprint 0 |

---

# 📊 CRITÉRIOS DE SUCESSO MENSURÁVEIS

## Go-Live (obrigatório)

| Métrica | Meta | Ferramenta |
|---------|------|------------|
| Jornada E2E: Login + refresh silencioso | 100% passando | Playwright CI |
| Jornada E2E: Fluxo completo de predição | 100% passando | Playwright CI |
| Load test WebSocket (500 conexões) | Threshold aprovado | k6 / CI staging |
| Taxa de erro de autenticação em staging | < 0,1% | SigNoz / Logs |
| Health check do container | Respondendo em < 5s | Docker / CI |

## 90 Dias Pós-Lançamento

| Métrica | Meta | Ferramenta |
|---------|------|------------|
| TTFB (região datacenter) | < 200ms | Lighthouse / SigNoz RUM |
| TTFB (Brasil) | < 600ms | Lighthouse / SigNoz RUM |
| LCP (portal público) | < 2,5s | Lighthouse |
| Taxa de sucesso de refresh silencioso | > 99,9% | SigNoz / Logs |
| Taxa de reconexão WebSocket automática | > 99,5% | SigNoz / Logs |
| Coverage E2E geral (jornadas de produto) | > 80% | Playwright CI |
| Lighthouse Score (Performance + Acessibilidade) | > 90 | Lighthouse CI |
| Taxa de erro de autenticação em produção | < 0,1% | SigNoz / Security Service |

---

# 🏁 CONCLUSÃO

O frontend do IPYSY será:

👉 a camada estratégica que traduz uma arquitetura distribuída altamente sofisticada
em
👉 uma experiência digital performática, escalável e orientada a crescimento

A stack proposta equilibra inovação técnica com pragmatismo empresarial. As decisões tomadas em staff review garantem que o MVP chegue ao mercado brasileiro com qualidade e segurança, sem overengineering, com expansão global estruturada para o H1.

---

## ✅ DECISÃO RECOMENDADA

Aprovar a adoção de:

**Next.js 15 + React 19 + TypeScript + Zustand + shadcn/ui (Unstyled) + Tailwind CSS**

com:

* Arquitetura híbrida SSR + SPA para SEO e interatividade
* Phantom Token Pattern com token em memória + refresh httpOnly cookie + cache Redis no Security Service
* Cache inteligente com TanStack Query como fonte única de verdade
* **WebSocket para notificações no MVP** (canal único), com relatórios assíncronos no Sprint 3–4
* Observabilidade faseada com OpenTelemetry + SigNoz (5% → 10%, 100% para erros)
* Testes E2E obrigatórios nas 3 jornadas críticas antes do go-live; meta de 80% geral em 90 dias
* **Sprint 0 dedicado a fundações** — spike de hydration, design system, CI/CD, saúde de container e runbooks
* **MVP exclusivo pt-BR** — en-US habilitado no H1 após validação de retenção; i18n estruturado desde o kickoff
* **Deploy no Hetzner** com Docker, GitHub Actions, Cloudflare Tunnel e load test k6 como gate de deploy
* **Proteção do código-fonte** com ofuscação diferenciada por portal (javascript-obfuscator + Terser), remoção obrigatória de source maps no artefato de produção e source maps privados no SigNoz para diagnóstico interno

como padrão oficial do frontend do IPYSY.

---

# 📋 ANEXOS EXECUTIVOS — CONSIDERAÇÕES TÉCNICAS RESUMIDAS

> Material de apoio para esclarecimento durante a apresentação, sem exposição de implementação.

## 🔹 Por que Next.js 15 e não apenas React SPA?

* SSR nativo para SEO do portal público (indexação, metadados, performance percebida)
* SPA para o portal privado (interatividade rica sem recarregamentos)
* Único código-base, duas estratégias de renderização conforme necessidade

## 🔹 Por que TanStack Query é crítico para 20+ microsserviços?

* Evita chamadas redundantes ao gateway com cache inteligente
* Gerencia revalidação em background, melhorando a percepção de velocidade
* Reduz complexidade no código de frontend para agregação de dados distribuídos
* Desidrata e reidrata dados no SSR, evitando flash de carregamento

## 🔹 Como o frontend se integra ao Kafka sem expor o browser?

* Kafka permanece exclusivamente no backend (comunicação entre serviços)
* Frontend consome dados via API Gateway (REST)
* Atualizações em tempo real chegam ao browser via **WebSocket**, alimentadas por serviços backend que consomem Kafka internamente

## 🔹 Por que WebSocket no lugar de SSE?

* Bidirecionalidade → frontend pode iniciar processos e receber confirmação
* Casos reais no IPYSY: notificações para usuários específicos e (fase 2) relatórios pesados assíncronos
* Conexão única gerencia múltiplos canais

## 🔹 Por que token em memória + httpOnly cookie?

* Token opaco nunca persiste em storage (sessionStorage/localStorage)
* Refresh token em httpOnly cookie → invisível para JavaScript, imune a XSS
* Keycloak permanece como fonte de verdade de identidade; Security Service atua como proxy com cache Redis
* Compatível com Phantom Token Pattern e SSR via refresh silencioso
* Cache Redis no Security Service reduz latência de validação de ~80-150ms para ~2-5ms

## 🔹 Por que deploy no Hetzner e não Cloudflare Pages?

* Backend já está no Hetzner (mesmo datacenter, latência <1ms)
* Controle total de runtime (sem limitações de edge)
* Pipeline CI/CD unificado com backend existente
* Cloudflare Tunnel expõe via www.ipysy.com com CDN e segurança

## 🔹 Por que circuit breaker no Gateway e não no cliente?

* Circuit breakers são padrões de infraestrutura/backend
* No browser, um circuit breaker "aberto" bloquearia um usuário de forma irreversível
* O Gateway Quarkus (SmallRye Fault Tolerance) centraliza a proteção do ecossistema
* O cliente mantém retry com exponential backoff + jitter para resiliência

## 🔹 Por que Sprint 0 dedicado a fundações?

* shadcn/ui + Radix UI tem curva de aprendizado real — design system sólido antes de features evita retrabalho
* Spike de hydration SSR elimina risco de race condition entre TanStack Query e Zustand em produção
* Health check e runbooks não são overhead — são pré-requisitos operacionais que, se ausentes no go-live, se tornam incidentes de madrugada

## 🔹 Por que MVP pt-BR antes de en-US?

* Mercado primário validado é o Brasil (2.300+ inscritos na waitlist)
* Lançamento simultâneo en-US divide foco de produto e suporte sem aprendizado suficiente
* Arquitetura i18n garante que habilitar en-US no H1 seja operacional, não arquitetural

## 🔹 Por que ofuscação diferenciada entre portal público e privado?

* O portal público tem meta de LCP < 2,5s e impacto direto em SEO — `controlFlowFlattening` aumenta bundle em até 40% e comprometeria o Lighthouse Score
* O portal privado opera como SPA sem restrições de SEO — ofuscação agressiva é aplicada sem penalidade de negócio
* Algoritmos de reputação e lógica de IGCI residem nos microserviços, nunca no bundle — a ofuscação protege a implementação da experiência, não as regras de domínio
* Source maps enviados ao SigNoz durante o CI garantem que a observabilidade interna não seja comprometida pela proteção do código

## 🔹 Estratégia de evolução para mobile

* **Fase 1 (curto prazo):** PWA via Next.js PWA module — entrega em semanas, não meses
* **Fase 2 (médio prazo):** Capacitor + React para apps nativos — após validação de engajamento
* Evita comprometimento prematuro com desenvolvimento nativo antes da validação do produto

## 🔹 Próximos passos pós-aprovação

1. **Sprint 0** — fundações completas conforme tabela de entregáveis — **Responsável: Tech Lead + DevOps/SRE Lead**
2. **Sprint 1** — integração Gateway + Auth + fluxo de autenticação validado + OpenTelemetry instrumentado — **Responsável: Frontend Lead + Backend Lead**
3. **Sprint 2** — portal público com SSR + jornada de predição MVP — **Responsável: Frontend Lead**
4. **Sprint 3** — WebSocket de notificações + portal privado MVP + load test k6 aprovado — **Responsável: Backend Lead + Frontend Lead**
5. **Sprint 4** — go-live pt-BR + monitoramento ativo + plano de rollback validado — **Responsável: DevOps/SRE Lead + Tech Lead**
6. **H1** — en-US habilitado + relatórios assíncronos via WebSocket + PWA — **Responsável: Product Manager + Tech Lead**

---

# ⚡ OTIMIZAÇÕES DE ÚLTIMA GERAÇÃO

## Renderização moderna

* Partial Hydration (Islands Architecture)
* Redução de JS no cliente

## Edge-first

* Execução no edge (Cloudflare)
* Cache distribuído global

## Observabilidade full stack

* Correlação frontend/backend via traceId

---

# 🔄 FEATURE FLAGS

* Ativação de features sem deploy
* Testes A/B
* Redução de risco

---

# 📱 PWA

* Offline
* Instalação
* Push notifications

---

# 🔮 FUTURO

* Microfrontends
* Expansão global

---

> **Mensagem final para a diretoria:**
> *"Esta proposta não entrega apenas um frontend. Representa o equilíbrio entre velocidade de mercado e solidez técnica: MVP focado no Brasil com as fundações certas, expansão global estruturada para o H1, e uma arquitetura que escala sem reescrita. O IPYSY entra no mercado com segurança de autenticação enterprise, observabilidade desde o dia 1, proteção do código-fonte com ofuscação diferenciada por contexto e qualidade garantida nas jornadas críticas — sem overengineering, sem atalhos de risco."*

---

# STATUS DE IMPLEMENTAÇÃO NO BACKEND

| Campo | Valor |
|-------|-------|
| **Status backend** | 🟡 PARCIAL — WebSocket pendente (BLOCO 21), frontend ainda não desenvolvido |
| **Tickets backend** | p2-175..181 (BLOCO 21 — WebSocket), p2-179 (Gateway passthrough WS) |
| **Data**           | 2026-05-04                                          |

**Dependências backend confirmadas prontas**:
- Phantom Token Pattern + Redis ✅ (Security 9001)
- Gateway Cloudflare Tunnel + HTTPS ✅
- Consul service discovery ✅
- SigNoz OTLP (traces + logs) ✅
- `NEXT_PUBLIC_API_BASE_URL=https://api.ipysy.com` — operacional ✅
- `NEXT_PUBLIC_WS_URL=wss://api.ipysy.com/ws` — **endpoint /ws NÃO existe ainda** 🔴

**Bloqueadores para Sprint 3 (frontend)**:
- p2-175..181 (BLOCO 21): WebSocket no notification-service + Gateway passthrough
- p2-179: validar que `vertx-http-proxy` do Gateway passa headers `Upgrade: websocket` + rota `/ws/**`

**Nota arquitetural confirmada**: sticky sessions = responsabilidade do Load Balancer (ip_hash/cookie-based), não do Consul. Dimensionamento validado: threshold k6 = 500 conexões WS simultâneas como gate de deploy.
