# ADR-010_NCS v2.0
IPYSY (Prediction Intelligence & Reputation Platform)
*ARCHITECTURAL DECISION RECORD*

| **Número**         | ADR-010                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| **Versão**         | v2.0                                                                                                      |
| **Título**         | Rotinas Automatizadas de Busca, Padronização e Inserção de Notícias Externas - News Context Service (NCS) |
| **Status**         | ✅ IMPLEMENTADO (Fase 1) — p2-195 — 2026-05-06                                                             |
| **Data original**  | Março de 2026                                                                                             |
| **Data revisão**   | 5 de Maio de 2026                                                                                         |
| **Autor**          | Equipe de Produto & Engenharia iPYSY                                                                      |
| **Revisores**      | Head de Produto, CTO, Head Editorial, DPO                                                                 |
| Classificação      | INTERNO — CONFIDENCIAL                                                                                    |
| **Relacionados**   | EDITORIAL v1, ADR-006, ADR-008, GUIA COMPLICE BR/PT, PRD-001, EVT v3, Sessão Estratégica do Conselho      |
| **Ação de origem** | ADR-010_NCS_v1.docx                                                                                       |

# 📄 1. Contexto e Motivação

A iPYSY opera como infraestrutura de inteligência preditiva colaborativa. Os eventos de previsão são o ativo central da plataforma, mas a ausência de **contexto informacional em tempo real** limita a compreensão do usuário sobre a relevância de cada evento e reduz a urgência para prever.

A Sessão Estratégica do Conselho (fev/2026) identificou dois gargalos críticos: o pipeline editorial depende 100% de esforço interno (Bernard De Luna), e não há nenhum loop viral ou mecanismo de engajamento contínuo (Gabriel 'Mineiro' Costa). A vinculação automática de notícias externas a eventos resolve ambos: cria contexto, gera urgência e alimenta o pipeline de novos eventos.

Este ADR formaliza a decisão de implementar o **News Context Service (NCS)** — um microsserviço de coleta, padronização e publicação automatizada de notícias de portais externos, operando exclusivamente **acima** do Core v3.2, sem qualquer impacto no sistema de reputação ou cálculo de consenso.

# 📄 2. Definição do Problema

> **PROBLEMA CENTRAL:** Como fornecer contexto informacional atualizado para cada evento de previsão, de forma automatizada, escalável e juridicamente segura, sem alterar o Core v3.2 e respeitando integralmente o Manual Editorial?

## 2.1 Requisitos Derivados

* **R1 — Automação:** Coleta de notícias sem intervenção humana na etapa de busca.
* **R2 — Padronização:** Formato uniforme independente da fonte (headline + snippet + metadados).
* **R3 — Vinculação:** Associação automática notícia ↔ evento iPYSY com score de relevância.
* **R4 — Governança Editorial:** Conformidade com Manual Editorial v1 e Matriz de Risco.
* **R5 — Isolamento:** Nenhum impacto no Core v3.2, sistema de reputação ou IGCI.
* **R6 — Conformidade Legal:** Modelo de agregação por referência; respeito a direitos autorais e LGPD/GDPR.

# 📄 3. Decisão

> **O iPYSY implementará o News Context Service (NCS), um microsserviço autônomo responsável por coletar, deduplicar, classificar, padronizar e publicar notícias de portais externos vinculadas a eventos de previsão. O NCS opera acima do Core v3.2, em regime read-only sobre dados de eventos, e segue um pipeline de 5 etapas com governança editorial progressiva (curadoria manual → híbrida → automática supervisionada).**

# 📄 4. Arquitetura do Pipeline

## 4.1 Visão Geral das 5 Etapas
| **#** | **Etapa**                      | **Descrição**                                                                                                 | **Frequência**                           | **Intervenção**            |
| ----- | ------------------------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------- |
| **1** | **Coleta**                     | Consumo de feeds RSS e/ou APIs de notícias; armazenamento bruto com metadados de origem                       | A cada 30min (hor. comercial); 2h (fora) | Nenhuma                    |
| **2** | **Deduplicação e Filtragem**   | Remoção de duplicatas por similaridade de título; filtragem por Matriz de Risco Editorial e lista de bloqueio | Contínua (após coleta)                   | Nenhuma (automática)       |
| **3** | **Classificação e Vinculação** | Classificação por categoria iPYSY; vinculação automática a eventos existentes com score de relevância         | Contínua (após dedup)                    | Nenhuma / Revisão          |
| **4** | **Padronização**               | Transformação em schema NewsItem iPYSY: headline, snippet redigido, atribuição, link, metadados de exibição   | Contínua (após classif.)                 | Snippet: manual ou IA      |
| **5** | **Publicação**                 | Inserção nos pontos de exibição do portal: página de evento, home, ticker, notificações                       | Após aprovação                           | Conforme modo de aprovação |

## 4.2 Princípio Arquitetural: Isolamento do Core v3.2

Em conformidade com o ADR-006, o NCS opera como camada de produto, **nunca** alterando equações, parâmetros ou funções do Core. O relacionamento com o Core é estritamente read-only:

* **NCS lê:** lista de eventos ativos (event_id, título, categoria, keywords, data de resolução) via endpoint interno.
* **NCS nunca escreve:** nenhuma tabela do Core é modificada. Vínculos notícia ↔ evento ficam exclusivamente no banco do NCS.
* **Remoção sem impacto:** se o NCS for desligado, a plataforma continua funcionando normalmente — apenas sem notícias contextuais.
* **Sem dados pessoais:** o NCS não processa, armazena ou transmite nenhum dado de usuários iPYSY.

# 📄 5. Especificação Técnica por Etapa

## 5.1 Etapa 1 — Coleta Automatizada

### 5.1.1 Fontes de Dados por Fase
| **Fase**   | **Método**      | **Fontes**                                               | **Custo**     | **Cobertura**        |
| ---------- | --------------- | -------------------------------------------------------- | ------------- | -------------------- |
| **Fase 1** | RSS/Atom        | G1, Folha, UOL, Valor Econômico, Reuters BR              | R\$ 0         | Brasil, 5 portais    |
| **Fase 2** | API + RSS       | NewsAPI.org + GDELT + RSS existentes                     | ~US\$ 200/mês | Global, 150k+ fontes |
| **Fase 3** | Parcerias + API | Licenciamento direto com 3-5 portais de referência + API | Variável      | Controlada, premium  |

### 5.1.2 Schema de Dados Brutos (RawNewsItem)
| **Campo**              | **Tipo**         | **Descrição**                                                     |
| ---------------------- | ---------------- | ----------------------------------------------------------------- |
| **fetch_id**           | UUID v4          | Identificador único da coleta                                     |
| **source_name**        | string           | Nome do portal (ex: "Folha de S.Paulo")                           |
| **source_feed_url**    | URL              | URL do feed RSS ou endpoint da API de origem                      |
| **source_article_url** | URL              | URL do artigo original no portal da fonte                         |
| **headline**           | string (max 200) | Título original da notícia conforme publicado pela fonte          |
| **description_raw**    | string (max 500) | Descrição ou lead fornecido pelo feed (usado apenas internamente) |
| **published_at**       | ISO 8601         | Data/hora de publicação informada pela fonte                      |
| **category_raw**       | string           | Categoria informada pela fonte (mapeada na Etapa 3)               |
| **language**           | string           | Idioma (pt-BR, en, pt-PT)                                         |
| **fetched_at**         | ISO 8601         | Timestamp da coleta pelo NCS                                      |

### 5.1.3 Regras de Coleta

* **Respeitar robots.txt** de cada portal antes de consumir o feed.
* **Rate limit:** máximo 1 request por fonte a cada 5 minutos.
* **Cache de URLs:** URLs já coletadas são armazenadas em set Redis para evitar reprocessamento.
* **Timeout:** 10 segundos por request; retry com backoff exponencial (3 tentativas, base 30s).
* **Health check:** alerta automático se nenhuma notícia for coletada de uma fonte em 4 horas.
* **Log de auditoria:** todas as coletas são registradas conforme Manual Editorial, seção 11.
* **Web scraping: PROIBIDO.** Apenas feeds RSS públicos e APIs licenciadas.

## 5.2 Etapa 2 — Deduplicação e Filtragem

### 5.2.1 Deduplicação

Múltiplos portais frequentemente reportam a mesma notícia. O NCS remove duplicatas para evitar poluição informacional na interface.

* **Método Fase 1:** Comparação de similaridade de títulos via TF-IDF + similaridade coseno. Threshold: ≥ 0.85 = duplicata.
* **Método Fase 2:** Embeddings de texto (modelo open source all-MiniLM-L6-v2 ou equivalente). Threshold: ≥ 0.88 = duplicata.
* **Resolução:** Quando há duplicata, mantém a fonte de maior autoridade (conforme hierarquia definida pelo editor-chefe) e registra as demais como *fontes alternativas*, exibidas como "Reportado também por: X, Y".

### 5.2.2 Filtragem Editorial Automática

A filtragem aplica diretamente as regras do Manual Editorial v1:

| **Filtro**                       | **Regra**                                                                                                                           | **Ação**                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Categoria C (Não Publicável)** | Keywords de bloqueio: violência ativa, vítimas identificáveis, criminalidade, sofrimento humano direto (conforme Manual, seção 2.4) | BLOQUEIO automático + log                            |
| **Matriz de Risco ≥ 5**          | Temas políticos (+3) + polarização histórica (+3) + risco regulatório (+4) = revisão global obrigatória                             | Fila de revisão global (Head Editorial + Compliance) |
| **Matriz de Risco 1-4**          | Temas com risco moderado: eleições formais, reformas legislativas, decisões judiciais                                               | Fila de revisão regional                             |
| **Matriz de Risco ≤ 0**          | Indicadores econômicos, resultados esportivos, estatísticas, premiações, resultados corporativos                                    | Aprovação automática (conforme modo vigente)         |

## 5.3 Etapa 3 — Classificação e Vinculação a Eventos

### 5.3.1 Classificação por Categoria iPYSY

Cada notícia é classificada em uma das categorias iPYSY: Economia, Política/Mundo, Cultura & Sociedade, Esportes, Ciência & Tecnologia.

| **Fase**   | **Método**                                                           | **Precisão Esperada**                   |
| ---------- | -------------------------------------------------------------------- | --------------------------------------- |
| **Fase 1** | Regras baseadas em keywords + categoria informada pelo RSS           | ~75-80% (suficiente com revisão humana) |
| **Fase 2** | Modelo NLP de classificação treinado nos eventos existentes da iPYSY | ~90-95%                                 |
| **Fase 3** | Modelo fine-tuned com dados de 90+ dias de operação                  | ~95-98%                                 |

### 5.3.2 Vinculação Automática a Eventos

Este é o passo de maior valor do pipeline. O algoritmo compara o conteúdo da notícia com os eventos ativos e atribui um score de relevância.

* **Fase 1 — Keywords match:** Cada evento possui um conjunto de keywords associadas (ex: evento "Selic" → ["selic", "copom", "banco central", "taxa de juros", "política monetária"]). Match direto com headline.
* **Fase 2 — Embeddings semânticos:** Embedding do título da notícia comparado com embeddings dos eventos via similaridade coseno.
* **Fase 3 — Modelo fine-tuned:** Treinado nos dados históricos de vínculos manuais das Fases 1 e 2.

**Thresholds de vinculação:**

* **Score ≥ 0.80:** Vinculação automática (sujeita ao modo de aprovação vigente).
* **Score 0.60--0.79:** Sugestão para revisão humana no painel editorial.
* **Score \< 0.60:** Sem vínculo. Se a notícia é relevante, é encaminhada como **sugestão de novo evento** (conforme Ação #4 da Sessão Estratégica).

## 5.4 Etapa 4 — Padronização (Schema NewsItem)

Todo conteúdo publicado segue o schema padronizado abaixo, independente da fonte de origem:

| **Campo**                | **Tipo** | **Regra de Padronização**                                                                                                |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| **news_id**              | UUID v4  | Gerado pelo NCS; identificação única permanente                                                                          |
| **headline**             | string   | Título original da fonte, sem edição. Max 120 caracteres; trunca com "..." se exceder                                    |
| **snippet**              | string   | 1-2 frases REDIGIDAS pela equipe iPYSY (nunca copiadas da fonte). Max 200 caracteres. Fase 2+: gerado por IA com revisão |
| **source.name**          | string   | Nome do portal (ex: "Folha de S.Paulo")                                                                                  |
| **source.url**           | URL      | Link direto para o artigo original — OBRIGATÓRIO                                                                         |
| **alternative_sources**  | array    | Outras fontes que reportaram a mesma notícia (da etapa de deduplicação)                                                  |
| **linked_events**        | array    | Lista de {event_id, relevance_score} vinculados na Etapa 3                                                               |
| **editorial_risk_score** | integer  | Score da Matriz de Risco Editorial (Manual v1, seção 5)                                                                  |
| **status**               | enum     | pending \| approved \| rejected \| expired                                                                               |
| **approved_by**          | string   | "auto" (publicação automática) ou "editor:nome" (curadoria humana)                                                       |
| **display.priority**     | enum     | high \| medium \| low — calculada por freshness + relevance_score + categoria                                            |
| **display.expires_at**   | ISO 8601 | Padrão: 24h após publicação. Eventos de longo prazo: 7 dias                                                              |

### 5.4.1 Regras de Snippet

1.  **Sempre redigido pela equipe iPYSY** (Fase 1: manual; Fase 2+: IA com revisão).
2.  **Nunca copiado da fonte.** Parafrasear e contextualizar para o evento iPYSY vinculado.
3.  **Idioma:** Sempre em português. Fontes em inglês são traduzidas/adaptadas.
4.  **Tamanho:** Máximo 200 caracteres (2 frases curtas).
5.  **Tom:** Institucional e neutro, conforme Manual Editorial seção 6. Sem adjetivações, emoção ou enquadramento partidário.

## 5.5 Etapa 5 — Publicação no Portal

### 5.5.1 Pontos de Exibição
| **Local**                       | **Formato**                                                                                                                 | **Limite**            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **Página do Evento**            | Widget "Notícias Relacionadas": headline + fonte + tempo relativo + link. Ponto de maior valor — contextualiza a previsão | Max 3 por evento      |
| **Home (seção principal)**      | Feed vertical com notícias recentes, cada uma com badge do evento vinculado                                                 | Max 20 ativas         |
| **Ticker ao vivo**              | Notícias de alta prioridade alimentam o ticker da home, alternando com atividade de previsores                              | Rotação contínua      |
| **Push notifications (Fase 2)** | Notícia de alta relevância vinculada a evento seguido pelo usuário: "Nova notícia sobre Selic — consenso mudou +3pp"      | Max 3/dia por usuário |

### 5.5.2 Regras de Publicação por Modo de Aprovação
| **Modo**                      | **Fase**            | **Critério de Aprovação Automática**                   | **Cobertura Automática** | **Esforço Editorial** |
| ----------------------------- | ------------------- | ------------------------------------------------------ | ------------------------ | --------------------- |
| **Curadoria Manual**          | Fase 1 (0-30 dias)  | Nenhum — 100% passa por fila de revisão humana         | 0%                       | ~1h/dia               |
| **Híbrida**                   | Fase 2 (30-90 dias) | Risk score ≤ 0 E relevance ≥ 0.80                      | ~60%                     | ~30min/dia            |
| **Automática Supervisionada** | Fase 3 (90+ dias)   | Modelo IA treinado + risk score ≤ 0 E relevance ≥ 0.75 | ~80%                     | ~15min/dia            |

# 📄 6. Conformidade Legal e Editorial

## 6.1 Seis Regras Inegociáveis de Agregação

Derivadas da análise jurídica de precedentes internacionais (AP v. Meltwater, Copiepresse v. Google, Diretiva UE 2019/790) e da Lei 9.610/98 (Lei de Direitos Autorais brasileira):

6.  **Nunca reproduzir o corpo do artigo.** Apenas headline original + snippet redigido pela iPYSY.
7.  **Sempre atribuir a fonte.** Nome do portal e data de publicação visíveis.
8.  **Sempre linkar para o original.** Link direto para o artigo completo no site da fonte.
9.  **Nunca monetizar diretamente o conteúdo de terceiros.** Notícias são contexto, não produto.
10. **Respeitar robots.txt e termos de uso de cada portal.**
11. **Para Portugal/UE: modelo opt-in ou licenciamento** conforme Diretiva de Copyright Digital.

## 6.2 Conformidade LGPD/GDPR

O NCS **não processa dados pessoais**. Não há coleta de informações de usuários, nem cruzamento entre dados de notícias e perfis de previsores. A conformidade com LGPD/GDPR é garantida pela ausência total de dados pessoais no microsserviço.

## 6.3 Conformidade com Manual Editorial

Toda a lógica de filtragem da Etapa 2 é derivada diretamente da Matriz de Risco (seção 5 do Manual Editorial v1), da Classificação Temática (seção 4) e do Princípio de Não-Dano (seção 2.4). O filtro automático é configurado para ser **mais conservador** que a avaliação humana — na dúvida, bloqueia e encaminha para revisão.

# 📄 7. Infraestrutura e Estimativas

## 7.1 Stack Técnico

* **Microsserviço:** News Context Service (NCS) — mesma stack do backend iPYSY.
* **Banco de dados:** Tabelas news_items + news_event_links (banco próprio, separado do Core).
* **Fila:** Redis ou RabbitMQ para pipeline de processamento assíncrono.
* **Scheduler:** Cron job configurável (30min / 2h conforme horário).
* **Cache:** Redis com TTL de 24h para notícias ativas.
* **Monitoramento:** Health checks a cada 15min; alertas via Slack/e-mail se coleta falhar por 4h+.

## 7.2 Estimativa de Volume

* 5 fontes RSS × ~50 notícias/dia = ~250 notícias brutas/dia.
* Após deduplicação: ~80-100 únicas/dia.
* Após filtragem editorial: ~40-60 aprovadas/dia.
* Armazenamento: ~1KB por NewsItem × 60/dia × 365 = ~22MB/ano (desprezível).

## 7.3 Custo por Fase
| **Fase**            | **Infraestrutura**                       | **Desenvolvimento**             | **Editorial**     |
| ------------------- | ---------------------------------------- | ------------------------------- | ----------------- |
| **Fase 1 (0-30d)**  | R\$ 0 (RSS gratuito; infra existente)    | 2 sprints (~80h engenharia)     | ~1h/dia curadoria |
| **Fase 2 (30-90d)** | ~US\$ 200-250/mês (API + embeddings)     | 3-4 sprints (classif. + painel) | ~30min/dia        |
| **Fase 3 (90+d)**   | ~US\$ 130/mês (API + modelo) + parcerias | 1 sprint (fine-tuning)          | ~15min/dia        |

# 📄 8. Riscos e Mitigações
| **Risco**                                 | **Severidade** | **Mitigação**                                                                                                            |
| ----------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Feed RSS cai ou muda estrutura**        | Média          | Health check a cada 15min; alerta se nenhuma notícia em 4h; fallback para fontes alternativas                            |
| **Classificação automática erra vínculo** | Média          | Fase 1: 100% revisão humana. Fase 2: threshold conservador (0.80). Dashboard de falsos positivos para retreino do modelo |
| **Notícia fake ou fonte não confiável**   | Alta           | Whitelist rígida de fontes aprovadas. Nunca consumir fontes não verificadas. Apenas portais Tier 1 e Tier 2 reconhecidos |
| **Viés político na seleção**              | Alta           | Para eventos políticos: obrigatório incluir fontes de múltiplos portais. Matriz de Risco score ≥ 5 = revisão global      |
| **Sobrecarga editorial**                  | Baixa          | Sistema projetado para REDUZIR carga. Se curadoria > 1.5h/dia, reduzir volume ou aumentar threshold                      |
| **Violação de direito autoral**           | Alta           | 6 regras inegociáveis de agregação (seção 6.1). Snippets sempre redigidos pela iPYSY. Nunca reproduzir corpo de artigo   |
| **Dependência de fontes externas**        | Baixa          | Mínimo 5-8 fontes ativas; fallback RSS se API falhar; parcerias na Fase 3 diversificam                                   |

# 📄 9. Critérios de Implementação e Validação
| **ID**    | **Critério**                                                                                                            | **Responsável**        |
| --------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **CI-01** | Scheduler coleta notícias de ≥ 5 fontes RSS sem erro por 72h consecutivas                                               | Engenharia             |
| **CI-02** | Deduplicação reduz volume bruto em ≥ 50% sem eliminar notícias únicas                                                   | Engenharia             |
| **CI-03** | Classificação por categoria com precisão ≥ 75% (validada em amostra de 100 notícias)                                    | Engenharia + Editorial |
| **CI-04** | Vinculação a eventos com score ≥ 0.80 correta em ≥ 80% dos casos (amostra de 50)                                        | Engenharia + Produto   |
| **CI-05** | Schema NewsItem completo e válido para 100% das notícias publicadas                                                     | Engenharia             |
| **CI-06** | Filtro de Categoria C bloqueia 100% de notícias com keywords de violência/sofrimento (teste com 50 exemplos sintéticos) | Engenharia + Editorial |
| **CI-07** | Nenhuma query ao Core v3.2 é afetada pela operação do NCS (teste de regressão)                                          | Engenharia             |
| **CI-08** | Widget "Notícias Relacionadas" renderiza corretamente na página de evento em desktop e mobile                           | Produto + Frontend     |
| **CI-09** | Notícias expiradas são removidas automaticamente após TTL sem intervenção                                               | Engenharia             |
| **CI-10** | DPO valida ausência de dados pessoais em todo o schema e fluxo do NCS                                                   | DPO / Jurídico         |

# 📄 10. Relação com Outros Documentos
| **Documento**            | **Relação**                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **CORE v3.2**            | O NCS lê lista de eventos via endpoint read-only. O Core não sabe que o NCS existe. Nenhuma alteração no Core.      |
| **ADR-006**              | Confirma que produtos não alteram matemática. Notícias são camada de contexto informacional, análoga a comentários. |
| **ADR-008**              | Padrão de microsserviço REST desacoplado do Core. O NCS segue o mesmo padrão arquitetural.                          |
| **Manual Editorial v1**  | Toda a lógica de filtragem deriva da Matriz de Risco, Classificação Temática e Princípio de Não-Dano.               |
| **PRD-001 (Free)**       | Notícias contextualizam eventos para usuários Free, cumprindo o objetivo de "formação de contexto e educação".      |
| **Guias Complice BR/PT** | Presença de notícias de portais de referência mitiga risco de "confusão com apostas" (BR) e "jogo social" (PT).     |
| **Sessão Estratégica**   | Resolve Ação #4 (fluxo de sugestão de eventos), Ação #10 (Desafio de Acurácia) e gargalo de escala editorial.       |

# 📄 11. Cronograma de Implementação
| **Fase**                 | **Escopo**                                                                         | **Entregáveis**                                                                    | **Prazo**                              |
| ------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------- |
| **Fase 1 — MVP**       | RSS de 5 portais BR; curadoria 100% manual; vínculo a 20 eventos                   | NCS operacional; widget "Notícias Relacionadas" na página de evento; seção na home | 4 semanas após aprovação               |
| **Fase 2 — Escala**    | API NewsAPI; classificação automática; modo híbrido de aprovação; painel editorial | Vínculo automático notícia ↔ evento; painel de curadoria; push notifications       | 8 semanas após Fase 1                  |
| **Fase 3 — Parcerias** | Licenciamento com 3-5 portais; modelo fine-tuned; modo automático supervisionado   | Selo "Fonte verificada"; sugestão automática de novos eventos; 80% automação       | Negociação contínua a partir da Fase 2 |

# 📄 12. DECLARAÇÃO FINAL

O ADR-010 formaliza a decisão técnica de implementar o News Context Service (NCS) como microsserviço autônomo de coleta, padronização e publicação automatizada de notícias externas vinculadas a eventos de previsão. A implementação respeita integralmente o mandato do ADR-006 — o Core v3.2 permanece congelado e inalterado. A governança editorial segue o Manual Editorial v1 em todas as etapas. A conformidade legal é garantida pelo modelo de agregação por referência, sem reprodução de conteúdo protegido.

> A iPYSY não busca antecipar o futuro como espetáculo, busca estruturar previsões com rigor técnico, responsabilidade institucional e governança internacional.

---

# STATUS DE IMPLEMENTAÇÃO NO BACKEND

| **Status backend** | ✅ IMPLEMENTADO — Fase 1 concluída em 2026-05-06 |
| ------------------ | ----------------------------------------------- |
| **Ticket**         | p2-195 — commit `7d856b0`                       |
| **Status ADR**     | ✅ IMPLEMENTADO (Fase 1)                         |
| **Data**           | 2026-05-06                                      |

**O que foi implementado (Fase 1)**:

* `NewsSourceProvider` interface CDI plug-and-play — `GoogleNewsRssProvider` + `GenericRssProvider`
* `NewsSourceFactory` com CDI `Instance<NewsSourceProvider>` + `@PostConstruct`
* `EventKeywordExtractor` — tokenização, stopwords PT/EN, dedup, max 20 keywords
* `EventCorrelationJob` `@Scheduled` 6×/dia — TF-IDF score ≥ 0.30 → `NewsEventLink` + Kafka
* V72 migration — `source_id`, `country_code`, `language`, `correlated_at` em `ncs_news_items`
* Tópicos Kafka: `ipysy.news.ingested` + `ipysy.news.correlated`
* 5 endpoints admin: `POST /news/admin/ingest`, `POST /news/admin/correlate`, `GET /news/admin/providers`
* **66 testes passando** (26 novos)

**Roadmap restante**:

* **Fase 2**: `NewsApiProvider`, `GNewsProvider`, `GuardianNewsProvider`; classificação automática NLP; painel editorial; push notifications
* **Fase 3**: Licenciamento com portais BR/PT; modelo fine-tuned (90+ dias dados); 80% automação

---
*IPYSY — Intelligence for Decisions | ADR-010 v2.0 | Maio de 2026*
