# PRD-002_MapaTelas v1.1
IPYSY (Prediction Intelligence & Reputation Platform)
*PRODUCT RESQUIREMENTS DOCUMENTS — MAPA DE TELAS & FLUXOGRAMA*

| **Campo**                 | **Valor**                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| **Código**                | PRD-002                                                                                  |
| **Título**                | Mapa de Telas e Fluxograma                                                               |
| **Versão**                | v1.1                                                                                     |
| **Data original**         | Março de 2026                                                                            |
| **Data revisão**          | 4 de Maio de 2026                                                                        |
| **Status**                | Em andamento                                                                             |
| **Responsável**           | Equipe de Produto & Engenharia iPYSY                                                     |
| **Classificação**         | INTERNO — CONFIDENCIAL                                                                   |
| **Documento relacionado** | UX Screen Map & Progress Register v1.0 \| Referência: PRD-001, ADR-006, ADR-007, ADR-009 |

# 1. Objetivo e Escopo do Documento

Este documento registra formalmente o Mapa de Telas do sistema iPYSY, consolidando todas as interfaces de usuário previstas, seus fluxos de navegação, origem documental e status de desenvolvimento. Serve como instrumento de rastreabilidade entre os documentos estratégicos (ADRs, PRDs, CORE v3.1, Manual Editorial) e a execução do produto.

O mapa é organizado em 8 blocos funcionais correspondentes às principais jornadas do usuário e áreas do sistema, totalizando 40 telas distribuídas em 4 sprints de desenvolvimento.

# 2. Legenda e Convenções

## 2.1 Status de Desenvolvimento

| **Status**  | **Significado**                        | **Critério de conclusão**                                     |
| ----------- | -------------------------------------- | ------------------------------------------------------------- |
| **Feita**   | Mockup HTML gerado e validado          | Arquivo .html exportado, navegação funcional, dados realistas |
| **Alta**    | Prioridade MVP — Sprint 1 ou 2         | Bloqueante para go-live ou jornada crítica do usuário         |
| **Média**   | Prioridade Sprint 3                    | Importante para experiência completa, não bloqueante          |
| **Baixa**   | Prioridade Sprint 4+                   | Features avançadas, Business, pós-MVP                         |
| **ADR-009** | Onboarding — verificação de identidade | Fluxo de 4 níveis progressivos definido no ADR-009 v1.0       |

# 3. Visão Geral — Resumo por Bloco

| **Bloco** | **Nome**                    | **Persona / Contexto**                         | **Telas** | **Sprints** | **Referência**   |
| --------- | --------------------------- | ---------------------------------------------- | --------- | ----------- | ---------------- |
| **0**     | **Onboarding & Identidade** | Todos os novos usuários · 4 níveis verificação | 14        | 1-2         | ADR-009          |
| **1**     | **Home & Público**          | Observador anônimo · sem login                 | 3         | 1           | PRD Free         |
| **2**     | **Free Logado**             | Nível 1--2 · leitura + onboarding produto      | 4         | 1-2         | PRD Free         |
| **3**     | **Premium**                 | Nível 3--4 · previsão + reputação + selo       | 5         | 2-3         | PRD Premium      |
| **4**     | **Business**                | Starter / Pro / Enterprise · institucional     | 5         | 3-4         | PRD Business     |
| **5**     | **Academia IP**             | Power users · modo academia · Brier Score      | 2         | 4           | Sessão Conselho  |
| **6**     | **Social**                  | Logado ou não · contexto qualitativo           | 3         | 3           | Manual Editorial |
| **7**     | **Administração**           | Equipe iPYSY · operação e editorial            | 4         | 2-3         | ADR-007          |

# 4. Mapa Detalhado por Bloco

## BLOCO 0 · ADR-009 — Onboarding & Verificação de Identidade
4 níveis progressivos · TwilioVerify + Socure/Unico · 14 telas

*Fluxo completo de cadastro e verificação de identidade, baseado em padrões de plataformas reguladas (referência: Kalshi) e formalizado no ADR-009 v1.0. Cada nível progressivo desbloqueia funcionalidades específicas do produto.*

| **ID** | **Tela**                       | **Descrição**                                                       | **Referência**             | **Status**  |
| ------ | ------------------------------ | ------------------------------------------------------------------- | -------------------------- | ----------- |
| T01    | **Login / Sign-up**            | Modal OAuth Google, Apple ou e-mail. Link para cadastro             | /login                     | **ADR-009** |
| T02    | **Sign-up inicial**            | Escolha do método: OAuth direto ou cadastro por e-mail              | /sign-up                   | **ADR-009** |
| T03    | **E-mail (Nível 1)**           | Campo único, botão Continue desabilitado até validação              | /sign-up/email             | **ADR-009** |
| T04    | **Senha (Nível 1)**            | Checklist de requisitos em tempo real, toggle de visibilidade       | /sign-up/password          | **ADR-009** |
| T05    | **Verificar e-mail (Nível 1)** | OTP 4 dígitos por e-mail. Reenvio máx 3x cooldown 60s               | /sign-up/verify            | **ADR-009** |
| T06    | **Telefone (Nível 2)**         | Campo DDI + número, link promo code, sem spam — TwilioVerify        | /sign-up/phone             | **ADR-009** |
| T07    | **Verificar SMS (Nível 2)**    | OTP 4 dígitos via SMS, confirmação parcial do número                | /sign-up/phone-verify      | **ADR-009** |
| T08    | **Nome legal (Nível 3)**       | Nome legal first + last. Opção 'Agora não'                       /s | ign-up/profile           * | *ADR-009**  |
| T09    | **Data nascimento (Nível 3)**  | Mínimo 18 anos. Mês/Dia/Ano. Aviso veracidade LGPD                  | /sign-up/birthday          | **ADR-009** |
| T10    | **Endereço e CPF (Nível 3)**   | País, rua, cidade, estado, CEP, CPF/NIF (hash HMAC-SHA256)          | /sign-up/profile           | **ADR-009** |
| T11    | **Cadastro em revisão**        | Ícone check, prazo 24h, botão Explorar iPYSY, e-mail notificação    | /sign-up/review            | **ADR-009** |
| T12    | **KYC Biométrico (Nível 4)**   | Documento oficial + selfie. 'Completo em 2 min'. Socure/Unico    /s | ign-up/identity          * | *ADR-009**  |
| T13    | **Handoff celular (Nível 4)**  | SMS + QR Code. Duas colunas. Powered by Socure/Unico                | /sign-up/identity/phone    | **ADR-009** |
| T14    | **Conta já existente**         | Sem expor dados existentes. Canal de suporte. Anti-duplicata        | /sign-up/duplicate         | **Alta**    |

## BLOCO 1 · PÚBLICO — Home e Acesso Público
Observador anônimo · sem login · PRD Free · 3 telas

| **ID** | **Tela**                  | **Descrição**                                                      | **Referência** | **Status** |
| ------ | ------------------------- | ------------------------------------------------------------------ | -------------- | ---------- |
| B1-01  | **Home — Mercados**       | Feed de eventos, hero card com IGCI, gráfico, sidebar trending     | PRD Free       | **Feita**  |
| B1-02  | **Lista de eventos**      | Filtros categoria/status/data, cards com IGCI e tendência 7 dias   | PRD Free       | **Alta**   |
| B1-03  | **Detalhe evento (Free)** | IGCI em destaque, histórico, comentários read-only, upsell Premium | PRD Free       | **Alta**   |

## BLOCO 2 · FREE LOGADO — Observador Autenticado
Nível 1-2 · leitura + onboarding produto · 4 telas

| **ID** | **Tela**                  | **Descrição**                                                    | **Referência**  | **Status** |
| ------ | ------------------------- | ---------------------------------------------------------------- | --------------- | ---------- |
| B2-01  | **Onboarding do produto** | Modo casual vs academia, Brier explicado, 1ª previsão guiada     | Sessão Conselho | **Alta**   |
| B2-02  | **Dashboard Free**        | KPIs agregados, eventos favoritos, alertas básicos, feed         | PRD Free        | **Alta**   |
| B2-03  | **Rankings**              | Diário/semanal/mensal/histórico, nível EVT, tooltips Brier Score | PRD Free        | **Média**  |
| B2-04  | **Perfil público (Free)** | Nível observador, favoritos, sem histórico de previsões, upsell  | PRD Free        | **Média**  |

## BLOCO 3 · PREMIUM — Operador Individual
Nível 3--4 · previsão + reputação + selo · 5 telas

| **ID** | **Tela**                     | **Descrição**                                                    | **Referência** | **Status** |
| ------ | ---------------------------- | ---------------------------------------------------------------- | -------------- | ---------- |
| B3-01  | **Dashboard avançado**       | Reputação, nível EVT, acurácia por categoria, últimas previsões  | PRD Premium    | **Alta**   |
| B3-02  | **Detalhe evento (Premium)** | SIM/NÃO (Iniciado), slider 0--100% (Contribuidor+), comentários  | Core v3.1      | **Alta**   |
| B3-03  | **Perfil & Reputação**       | Score, nível EVT, histórico completo, evolução temporal, Brier   | ADR-006        | **Alta**   |
| B3-04  | **Simulações & Backtesting** | Hipóteses sem alterar dados reais, eventos passados, comparativo | PRD Premium    | **Média**  |
| B3-05  | **Selo de Reputação**        | QR Code verificável, ghost_id público, exportação certificada    | ADR-007        | **Média**  |

## BLOCO 4 · BUSINESS — Cliente Institucional
Starter / Pro / Enterprise · 5 telas

| **ID** | **Tela**                    | **Descrição**                                                      | **Referência**   | **Status** |
| ------ | --------------------------- | ------------------------------------------------------------------ | ---------------- | ---------- |
| B4-01  | **Dashboard institucional** | IGCI por domínio, análise cross-domain, alertas, insights          | PRD Business     | **Média**  |
| B4-02  | **Criação de evento**       | Formulário editorial, Matriz de Risco, status Em análise/Publicado | Manual Editorial | **Média**  |
| B4-03  | **Editor de insight**       | Título, corpo, eventos associados, publicação imediata/agendada    | PRD Business     | **Baixa**  |
| B4-04  | **API management**          | Chaves de acesso, uso diário/latência, Swagger embutido, webhooks  | PRD Business     | **Baixa**  |
| B4-05  | **Administração de times**  | Convites, roles Admin/Analista/Editor, logs de auditoria           | PRD Business     | **Baixa**  |

## BLOCO 5 · ACADEMIA IP — Aprendizado & Calibração
Modo academia · power users · 2 telas

| **ID** | **Tela**                 | **Descrição**                                                        | **Referência**  | **Status** |
| ------ | ------------------------ | -------------------------------------------------------------------- | --------------- | ---------- |
| B5-01  | **Academia IP — home** | Brier Score explicado, tutoriais calibração, modo casual vs academia | Sessão Conselho | **Média**  |
| B5-02  | **Glossário & ajuda**    | IGCI, Brier, decaimento, níveis EVT, FAQ, base de conhecimento       | PRD Free        | **Baixa**  |

## BLOCO 6 · SOCIAL — Contexto Qualitativo
Logado ou não · contexto, não rede social · 3 telas

*Os comentários no iPYSY não são uma rede social aberta. Existem como camada de contexto qualitativo, complementar aos dados quantitativos do sistema (Manual Editorial iPYSY v1).*

| **ID** | **Tela**                       | **Descrição**                                                     | **Referência**   | **Status** |
| ------ | ------------------------------ | ----------------------------------------------------------------- | ---------------- | ---------- |
| B6-01  | **Feed social**                | Posts públicos, threads, upvotes por relevância (não like social) | Manual Editorial | **Média**  |
| B6-02  | **Comentários do evento**      | Read-only (Free), criação + threads (Premium), upvote qualificado | Manual Editorial | **Média**  |
| B6-03  | **Perfil público do previsor** | ghost_id, nível EVT, selo verificável, domínios de expertise      | ADR-007          | **Baixa**  |

## BLOCO 7 · ADMINISTRAÇÃO — Sistema Interno
Equipe iPYSY · operação e editorial · 4 telas

| **ID** | **Tela**                   | **Descrição**                                                   | **Referência**   | **Status** |
| ------ | -------------------------- | --------------------------------------------------------------- | ---------------- | ---------- |
| B7-01  | **Admin dashboard**        | KPIs plataforma, usuários ativos, eventos pendentes, saúde CORE | PRD Business     | **Alta**   |
| B7-02  | **Gestão editorial**       | Fila de aprovação, Matriz de Risco, resolução manual, status    | Manual Editorial | **Alta**   |
| B7-03  | **Gestão usuários / LGPD** | Níveis EVT, exclusão ADR-007, vault, SLA 72h, ghost_id          | ADR-007          | **Média**  |
| B7-04  | **Monitoramento & logs**   | CORE v3.1 health, IGCI logs, auditoria, resolução automática    | Core v3.1        | **Média**  |

# 5. Roadmap de Desenvolvimento

| **Sprint**                | **Telas**                                                     | **Foco**                                                       | **Dependência** |
| ------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- | --------------- |
| **Sprint 1 MVP Base**     | T01-T07 (Onboarding Níveis 0-2) · B1-02 · B1-03 · B2-02       | Cadastro, verificação e-mail + SMS, lista e detalhe de eventos | TwilioVerify    |
| **Sprint 2 Produto Core** | T08-T11 (Nível 3 identidade) · B2-01 · B3-01 · B3-02 · B7-01  | Dados pessoais, previsão probabilística, dashboard, admin base | —               |
| **Sprint 3 Reputação**    | T12-T13 (KYC Nível 4) · B3-03 · B3-05 · B6-01 · B7-02 · B7-03 | KYC biométrico, perfil reputacional, selo, social, editorial   | Socure/Unico    |
| **Sprint 4 Escala**       | B4-01-B4-05 · B5-01 · B5-02 · B2-03 · B3-04 · B7-04           | Business, Academia IP, rankings, simulações, monitoramento     | API B2B         |

# 6. Princípios de UX — ADR-009

Os seguintes princípios foram formalizados no ADR-009 v1.0 e devem ser aplicados a todas as telas do fluxo de onboarding e, por extensão, ao restante do produto:

| **Princípio**                      | **Aplicação**                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| **Barra de progresso 3 segmentos** | Credenciais / Dados Pessoais / Identidade. Usuário sempre sabe onde está.        |
| **Uma pergunta por tela**          | Cada etapa faz exatamente uma pergunta. Sem sobrecarga cognitiva.                |
| **Continue desabilitado**          | Botão ativo apenas após validação completa. Feedback visual de erros de formato. |
| **Linguagem humana (PT-BR)**       | 'Qual é o seu e-mail?' em vez de 'Informe seu endereço de e-mail'.               |
| **Reenvio de código controlado**   | Máximo 3 reenvios por sessão com cooldown de 60 segundos.                        |
| **Handoff mobile pensado**         | Para KYC biométrico: SMS + QR Code. A maioria faz verificação no celular.        |
| **Estados de espera comunicados**  | review-needed com prazo claro (24h) e e-mail de notificação quando aprovado.     |
| **Duplicata com saída digna**      | Nunca expor qual conta está duplicando. Indicar existência e oferecer suporte.   |

---

# STATUS DE IMPLEMENTAÇÃO NO BACKEND

| Campo                 | Valor                                                               |
| --------------------- | ------------------------------------------------------------------- |
| **Status backend**    | 🟡 PARCIAL — cobertura ~70% (era ~40% antes dos BLOCOs 14–19)       |
| **Tickets pendentes** | p2-182 (selos B3-05), p2-187 (dashboards), p2-186 (editorial B7-02) |
| **Data**              | 2026-05-04                                                          |

**Cobertura por BLOCO de telas**:

| Bloco     | Tela                                       | Status backend                                                               |
| --------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| **B1**    | Homepage, lista eventos, detalhe evento    | ✅ endpoints featured/trending/category/search                                |
| **B2**    | Boas-vindas, dashboard free, rankings      | 🟡 rankings ✅, dashboard `GET /v1/dashboard/free` 🔴 pendente (p2-187)       |
| **B3**    | Dashboard premium, perfil+reputação, selos | 🟡 analytics ✅, selos (B3-05) 🔴 pendente (p2-182)                           |
| **B4**    | API business, times                        | ✅ API keys + team management                                                 |
| **B5/B6** | Academia, social feed                      | ✅ cursos, glossário, feed, comentários                                       |
| **B7**    | Admin dashboard, editorial, LGPD           | 🟡 moderação ✅, editorial risk 🔴 pendente (p2-186), LGPD Fase 4 🔴 (p2-184) |
| **B0**    | Onboarding, KYC                            | 🟡 fluxo KYC BR/PT ✅, `onboarding_completed` flag 🔴 pendente (p2-187)       |

---
*IPYSY — Intelligence for Decisions | PRD-002_MapaTelas v1.1 | Maio de 2026*
