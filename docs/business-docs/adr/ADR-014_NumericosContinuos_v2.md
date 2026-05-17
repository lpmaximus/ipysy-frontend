# ADR-014_NumericosContinuos v2.0
IPYSY (Prediction Intelligence & Reputation Platform)
*ARCHITECTURAL DECISION RECORD*

| **Número**         | ADR-014                                                                               |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Versão**         | v2.0                                                                                  |
| **Título**         | Eventos Numéricos Contínuos: Decisão de Deferimento — Documento de Composição Técnica |
| **Status**         | DEFERIDO — SEM IMPLEMENTAÇÃO                                                          |
| **Data original**  | Abril de 2026                                                                         |
| **Data revisão**   | 5 de Maio de 2026                                                                     |
| **Autor**          | Equipe de Produto & Engenharia iPYSY                                                  |
| Classificação      | INTERNO — CONFIDENCIAL                                                                |
| **Revisores**      | Head de Produto, CTO, Arquiteto de Software                                           |
| **Relacionados**   | ADR-013, CORE v3.2, ADR-015                                                           |
| **Ação de origem** | ADR-014 v1.2 - Maio de 2026                                                           |

> **⚠ AVISO INSTITUCIONAL --- LEIA ANTES DE QUALQUER USO DESTE DOCUMENTO**
> 
> Este ADR existe exclusivamente para compor a sequência numérica da documentação técnica institucional do iPYSY (ADR-001 a ADR-015). Ele NÃO representa uma decisão de implementação, NÃO gera roadmap de desenvolvimento e NÃO deve ser referenciado como requisito técnico ativo em nenhum sprint, planejamento de produto ou conversa com investidores.
> 
> A decisão arquitetural real está registrada na Seção 4 deste documento: o suporte a eventos numéricos contínuos foi avaliado, comparado com a cobertura do ADR-013 (multiclasse) e formalmente deferido por tempo indeterminado. Qualquer reabertura desta discussão requer novo ADR com numeração própria.

# 1. Contexto

O ADR-013 formalizou a extensão da plataforma iPYSY para eventos multiclasse por meio da Camada de Adaptação de Tipo de Evento (CATE). Ao concluir o ADR-013, a equipe identificou um quarto tipo de evento presente em plataformas de referência de mercado: eventos numéricos contínuos, nos quais a previsão do usuário é um valor real em um intervalo aberto — por exemplo, uma taxa percentual, um índice de pontos ou uma contagem absoluta.

Este ADR foi reservado no índice institucional para documentar a avaliação deste tipo de evento e o raciocínio que levou à decisão de deferimento. Não há implementação associada.

# 2. Descrição do Tipo de Evento Avaliado

Eventos numéricos contínuos são perguntas cuja resposta esperada é um número real dentro de um domínio contínuo, sem discretização prévia dos outcomes. Exemplos representativos:

| **Exemplo de Pergunta**                      | **Resposta Esperada**                              |
| -------------------------------------------- | -------------------------------------------------- |
| Qual será o IPCA acumulado em 2026?          | Ex.: 4,73% — valor real no intervalo (0, ∞)      |
| A qual valor o Ibovespa fechará em dezembro? | Ex.: 138.400 pontos — valor real positivo        |
| Qual será a taxa Selic na reunião de junho?  | Ex.: 10,75% — valor real em faixa conhecida      |
| Quantos gols Vini Jr. marcará na temporada?  | Ex.: 31 — inteiro positivo tratado como contínuo |

# 3. Análise Técnica — Por Que Requer Novo Mecanismo

O Core v3.2 e a extensão CATE do ADR-013 operam sobre distribuições de probabilidade em espaços discretos finitos (simplex probabilístico Δᴷ). A introdução de eventos numéricos contínuos exigiria três alterações sem precedente na arquitetura atual:

| **Componente Afetado**    | **Natureza da Alteração Requerida**                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Função de erro            | Substituição do Brier Score (discreto) por MAE, RMSE ou CRPS — métricas incompatíveis com a escala [0,1] do Core v3.2 sem normalização externa                          |
| Representação de previsão | Previsão deixa de ser p⃗ ∈ Δᴷ e passa a ser x ∈ ℝ — quebra da interface de entrada da CATE sem redesign                                                                 |
| Resolução de eventos      | Sem outcomes discretos cadastrados em event_outcomes, o ResolutionService precisaria de lógica de comparação numérica com tolerância — nova classe fora do escopo atual |
| Experiência do usuário    | Pedir ao usuário um valor numérico livre é cognitivamente mais custoso que escolher entre outcomes — impacto negativo em engajamento e densidade de consenso no M0      |

# 4. Decisão — Deferimento por Cobertura Equivalente do ADR-013

> O iPYSY NÃO implementará suporte nativo a eventos numéricos contínuos. A decisão é de deferimento por tempo indeterminado, fundamentada na cobertura equivalente provida pelo ADR-013 (multiclasse) via discretização de intervalos. Esta decisão é definitiva para o horizonte M0--M12 e só pode ser reaberta por novo ADR com numeração própria.

## 4.1 Cobertura por Discretização de Intervalos

Qualquer evento numérico contínuo pode ser convertido em evento multiclasse por meio da discretização do domínio em faixas mutuamente exclusivas e exaustivas. Esta conversão preserva toda a expressividade preditiva relevante para o usuário e para o consenso IGCI, sem qualquer alteração ao Core v3.2 ou à CATE:

| **Evento Numérico Original**     | **Reformulação Multiclasse (ADR-013)**            | **Outcomes**                                     |
| -------------------------------- | ------------------------------------------------- | ------------------------------------------------ |
| Qual será o IPCA em 2026?        | O IPCA de 2026 ficará em qual faixa?              | < 3% / 3—4% / 4—5% / 5—6% / > 6%                 |
| A qual valor fechará o Ibovespa? | O Ibovespa encerrará o ano em qual faixa?         | < 120k / 120—130k / 130—140k / 140—150k / > 150k |
| Qual será a Selic em junho?      | A Selic na reunião de junho estará em qual nível? | 10,25% / 10,50% / 10,75% / 11,00% / outro        |

## 4.2 Vantagens da Discretização sobre o Numérico Contínuo Nativo

| **Critério**                  | **Numérico Contínuo Nativo**                                                             | **Multiclasse por Discretização (ADR-013)**                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Complexidade de implementação | Alta — novo mecanismo de erro, nova interface CATE, novo fluxo de resolução            | Zero — 100% coberto pelo ADR-013 já aprovado                               |
| Integridade do Core v3.2      | Requer normalização externa da função de erro — risco de ambiguidade no registro de IP | Preservada integralmente — sem alteração                                   |
| UX / Engajamento              | Entrada livre — alta fricção cognitiva, dispersão de respostas                         | Escolha entre faixas — baixa fricção, concentração de consenso mais rápida |
| Qualidade do consenso no M0   | Baixa — distribuição esparsa prejudica Brier Score inicial                             | Alta — faixas concentram previsões e aceleram validação da Tríade          |
| Débito técnico gerado         | Alto — nova lógica de tolerância numérica na resolução                                 | Zero                                                                         |

# 5. Condições de Reabertura

A decisão de deferimento poderá ser revisada exclusivamente nas seguintes condições, todas verificáveis e documentáveis:

| **#** | **Condição de Reabertura**                                                                                                                                |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-1   | Demanda explícita e documentada de cliente B2B (LOI ou contrato) especificando eventos numéricos contínuos como requisito não-atendível por discretização |
| C-2   | Evidência quantitativa de que a discretização produz perda estatística relevante no IGCI em pelo menos 20% dos eventos resolvidos na plataforma           |
| C-3   | Conclusão da Tríade de Validação (Brier Score \< 0,20 por 3 meses + 500 eventos resolvidos) — plataforma estabilizada antes de adicionar complexidade     |

*A reabertura requer a criação de um novo ADR com numeração própria (ADR-016 ou superior). Este documento não é atualizado em caso de reabertura — permanece como registro histórico da decisão original.*

# 6. Relação com Outros ADRs e Documentos

| **Documento**                   | **Relação**               | **Impacto**                                                                                                                                  |
| ------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-013 (Multiclasse — CATE)    | Substituto funcional      | DIRETO — a discretização de intervalos reutiliza 100% da arquitetura CATE do ADR-013 sem alteração                                           |
| CORE v3.2 (Registro de IP)      | Imutável — engine central | NENHUM — deferimento preserva a imutabilidade; implementação futura exigiria análise de impacto sobre o registro de IP                       |
| ADR-015 (Taxonomia de Mercados) | Contexto de aplicação     | NENHUM — categorias como ECONOMIA e CORPORATIVO são as mais propensas a eventos numéricos; a taxonomia permanece válida independente do tipo |

# 7. Declaração Final

O ADR-014 registra formalmente a avaliação do tipo de evento numérico contínuo e a decisão de deferimento por tempo indeterminado. A cobertura funcional equivalente é provida pelo ADR-013 via discretização de intervalos, que elimina a necessidade de novo mecanismo técnico, preserva a integridade do Core v3.2 e produz melhor experiência de usuário e qualidade de consenso no horizonte M0—M12.

> Este documento existe para compor a sequência numérica da documentação institucional e para registrar o raciocínio que tornou este tipo de evento desnecessário no horizonte atual. Não há artefatos de implementação, roadmap ou sprint associados a este ADR.

# Changelog

| **Versão** | **Data**   | **Autor**    | **Descrição**                                                                                       |
| ---------- | ---------- | ------------ | --------------------------------------------------------------------------------------------------- |
| v1.0       | Abril/2026 | Equipe iPYSY | Versão inicial — decisão de deferimento formal; documento de composição técnica sem implementação |

# Aprovação

| **Papel**             | **Nome**        | **Assinatura** | **Data**     |
| --------------------- | --------------- | -------------- | ------------ |
| Autor / CEO           | Luiz Paulo Cruz |                | **_/**_/2026 |
| CTO                   |                 |                | **_/**_/2026 |
| Arquiteto de Software |                 |                | **_/**_/2026 |


---

# STATUS DE IMPLEMENTAÇÃO NO BACKEND

| **Status backend** | ✅ DEFERIDO — decisão formal registrada |
| ------------------ | -------------------------------------- |
| **Ticket**         | p2-163 (concluído)                     |
| **Data**           | 2026-05-04                             |

**Decisão**: ADR-014-D criado em `docs/adr/ADR-014-D-Eventos-Numericos-Continuos-Deferido.md`. Eventos numéricos contínuos cobertos por discretização via ADR-013 (multiclasse). Sem implementação associada — este documento existe como registro de raciocínio e sequência numérica. Arquitetura CATE do ADR-013 é pré-requisito para eventual implementação futura pós-M0.

---
*IPYSY — Intelligence for Decisions | ADR-014 v2.0 | Maio de 2026*
