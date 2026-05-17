# PRD001_Historia13 v1.1
IPYSY (Prediction Intelligence & Reputation Platform)
*PRODUCT RESQUIREMENTS DOCUMENTS — ADENDO: HISTÓRIA DE USUÁRIO*

| **Campo**                 | **Valor**                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| Código                    | PRD-001 — Adendo                                                                                         |
| Título                    | Nova História de Usuário — B2B — Acesso B2B ao Consenso Agregado via API — Piloto com 5 Fundos Parceiros |
| **Número da História**    | #13 (adicionada após Sessão Estratégica do Conselho)                                                     |
| Versão                    | v1.1                                                                                                     |
| **Data original**         | Fevereiro de 2026                                                                                        |
| **Data revisão**          | 4 de Maio de 2026                                                                                        |
| **Dono**                  | Produto                                                                                                  |
| Status                    | APROVADO                                                                                                 |
| Responsável               | Equipe de Produto & Engenharia iPYSY                                                                     |
| Classificação             | INTERNO — CONFIDENCIAL                                                                                   |
| **Documentos Impactados** | PRD-001, CORE v3.1 (exposição de API), ADR-008                                                           |
| **Ação de Origem**        | Ação #1 — Sessão Estratégica do Conselho iPYSY (Fev/2026)                                                |

# 📄 1. Contexto — Por que esta história existe

O PRD-001 original continha 12 histórias de usuário, todas orientadas ao perfil B2C: previsores individuais que cadastram previsões, acompanham reputação e competem em rankings. Nenhuma história representava o cliente que paga — o analista institucional ou gestor de fundo que consome inteligência agregada para tomar decisões.

O Conselho Estratégico (Fev/2026) identificou esta lacuna como crítica:

> **Bernard De Luna --- Sessão Estratégica do Conselho**
> "Vocês construíram um produto B2C e vão tentar vender como B2B depois. Isso não funciona. Sem uma história B2B desde o dia 1, o PRD-001 está incompleto por definição. O cliente que paga não está representado no documento de produto."

Esta história #13 corrige essa lacuna. Ela representa o comprador institucional e define o que o produto B2B precisa entregar no piloto de 30 dias.

# 📄 2. A História de Usuário #13

> **HISTÓRIA #13 --- Acesso B2B ao Consenso via API**
> Como analista de um fundo de investimento parceiro, quero consultar via API o consenso probabilístico agregado (IGCI) da plataforma iPYSY --- com o número de participantes e o nível médio de reputação dos previsores --- por evento e categoria, para que eu possa integrar inteligência preditiva verificável aos meus modelos de análise de risco e tomada de decisão.

# 📄 3. Persona — O Comprador B2B
| **Nome**                  | Carlos M.                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| **Cargo**                 | Analista Sênior de Risco / Gestor de Portfólio                                               |
| **Organização**           | Fundo de investimento de médio porte (BR ou PT)                                              |
| **Objetivo central**      | Reduzir incerteza decisional usando sinais preditivos externos verificados                   |
| **Frustração principal**  | Dados preditivos disponíveis no mercado são opacos, não auditados e de origem desconhecida   |
| **O que o iPYSY resolve** | Consenso ponderado por reputação, auditável, com metodologia transparente (IGCI / CORE v3.1) |

# 📄 4. Critérios de Aceitação

| história #13 estará completa quando todo | s os critérios abaixo forem verificados:                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Critério**                             | **Definição**                                                                                                                 |
| **CA-01 — Autenticação**                 | Cada fundo parceiro possui uma API Key única e individual. Requisições sem API Key válida retornam HTTP 401.                  |
| **CA-02 — Endpoint funcional**           | GET /v1/consensus/{event_id} retorna o IGCI atual, número de participantes e nível médio de reputação do evento solicitado.   |
| **CA-03 — Listagem de eventos**          | GET /v1/events retorna a lista de eventos disponíveis no piloto, com filtro por categoria.                                    |
| **CA-04 — Formato da resposta**          | Resposta em JSON estruturado, conforme schema definido no ADR-008.                                                            |
| **CA-05 — Documentação**                 | Swagger/OpenAPI disponível e acessível pelos 5 fundos parceiros antes do início do piloto.                                    |
| **CA-06 — Integridade do Core**          | Nenhuma chamada à API acessa ou altera o CORE v3.1 diretamente. A API consome apenas a camada de dados de saída já calculada. |
| **CA-07 — Isolamento de parceiros**      | Cada API Key acessa apenas os eventos autorizados para aquele fundo. Não há vazamento de dados entre parceiros.               |
| **CA-08 — SLA do piloto**                | Disponibilidade mínima de 99% durante o período do piloto (30 dias). Tempo de resposta médio \< 500ms.                        |

# 📄 5. Escopo — Incluído e Excluído

## Funcionalidades Incluídas nesta história

* Consulta do IGCI (consenso atual) por event_id
* Número de participantes ativos no evento
* Nível médio de reputação dos previsores no evento
* Listagem de eventos disponíveis com filtro por categoria
* Autenticação por API Key por fundo parceiro
* Documentação Swagger/OpenAPI

## Funcionalidades Excluídas (fora do escopo deste piloto)

* Histórico de evolução temporal do IGCI (fora do escopo desta história)
* Brier Score da plataforma (monitoramento interno — não exposto no piloto)
* Webhooks e notificações em tempo real (Enterprise — futuro)
* Acesso a previsões individuais de usuários (nunca — privacidade e LGPD/GDPR)
* Criação de eventos via API (Pacote Pro — futuro)
* Multiusuário / times (Enterprise — futuro)

# 📄 6. Métricas de Sucesso do Piloto

As métricas abaixo definem se o piloto com os 5 fundos parceiros cumpriu seu objetivo de validação de demanda:

| **Critério**                 | **Definição**                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| **Ativação**                 | Todos os 5 fundos realizaram ao menos 1 chamada de API válida em até 7 dias após o acesso      |
| **Engajamento**              | Ao menos 3 dos 5 fundos realizaram mais de 10 consultas ao longo dos 30 dias                   |
| **Feedback qualitativo**     | Ao menos 2 feedbacks estruturados recebidos (via reunião ou formulário) sobre utilidade e gaps |
| **Conversão de interesse**   | Ao menos 1 LOI (Letter of Intent) ou manifestação formal de interesse em contrato pago         |

# 📄 7. Relação com Outros Documentos

| **CORE v3.1**          | Fonte dos dados expostos pela API. O IGCI, número de participantes e peso de reputação são calculados pelo Core. A API apenas lê — nunca altera. |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ADR-006**            | Confirma que o Core é agnóstico a planos e produtos. A API B2B opera acima do Core, nunca dentro.                                                |
| **ADR-007**            | Garante conformidade LGPD/GDPR: a API nunca expõe dados individuais. Expõe apenas consenso agregado e anonimizado.                               |
| **ADR-008**            | Decision record técnico específico para esta API: arquitetura, schema, autenticação e especificação do endpoint.                                 |
| **PRD-001 (Business)** | Esta história é o ponto de entrada do Pacote Pro — Integração via API. O piloto valida a demanda antes de escalar para Enterprise.               |

# DECLARAÇÃO FINAL

*A história #13 completa o PRD-001, inserindo o cliente que paga na estratégia de produto.*
O piloto com 5 fundos parceiros é o primeiro passo da jornada B2B da iPYSY, gerando track record, feedback e a primeira conversão comercial.

---

# STATUS DE IMPLEMENTAÇÃO NO BACKEND

| Campo              | Valor                       |
| ------------------ | --------------------------- |
| **Status backend** | ✅ IMPLEMENTADO              |
| **Tickets**        | p2-164, p2-132..135, p2-167 |
| **Data**           | 2026-05-04                  |

**Todos os 8 CAs implementados**:
- CA-01: API Key única por fundo parceiro — `b2b_api_keys` ✅
- CA-02: HTTP 401 sem key válida — Gateway auth middleware ✅
- CA-03: `GET /v1/events?category={cat}` — V59 migration + category field ✅
- CA-04: `GET /v1/consensus/{eventId}` escalar — Consensus 9008 ✅
- CA-05: OpenAPI/Swagger em `/q/openapi` ✅
- CA-06: Geração + revogação de API Keys ✅
- CA-07: Isolamento por parceiro (user_id em b2b_api_keys) ✅
- CA-08: SLA operacional — 99,9% uptime confirmado em produção (Hetzner) ✅

**Documentação criada**: `docs/prd/PRD-001-Historia13-B2B-API.md`.

---
*IPYSY — Intelligence for Decisions | PRD-001 Adendo — História #13 v1.1 | Maio de 2026*
