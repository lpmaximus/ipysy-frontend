# CORE_IPYSY v3.2.1
IPYSY (Prediction Intelligence & Reputation Platform)
*CORE — Sistema Matemático de Agregação Probabilística com Camada de Engajamento*

| **Titular**           | L2Tech / iPYSY                                                                |
| --------------------- | ----------------------------------------------------------------------------- |
| **Natureza**          | Documento técnico de descrição algorítmica                                    |
| **Versão do Core**    | v3.2.1                                                                        |
| **Supersede**         | CORE iPYSY v3.1 (permanece como registro histórico)                           |
| **Finalidade**        | Registro de autoria, prova de anterioridade, anexo técnico de patente         |
| **Status**            | VIGENTE                                                                       |
| **Data original**     | Abril de 2026                                                                 |
| **Data revisão**      | 4 de Maio de 2026                                                             |
| **Motivo da revisão** | ADR-016 — Sistema de Selos de Usuário, Gamificação e Estrutura de Bonificação |
| **Decisores**         | CTO, Engenharia, Produto                                                      |
| Classificação         | INTERNO — CONFIDENCIAL                                                        |
| **Documentos base**   | CORE iPYSY v3.1 · ADR-006 v2.0 · ADR-016 v1.0                                 |

> **DECLARAÇÃO DE IMUTABILIDADE: O Core v3.2 é o documento matemático vigente do iPYSY. Qualquer extensão futura deve ser implementada como camada separada, preservando este núcleo intacto. O Core v3.1 permanece arquivado como registro histórico auditável e não precisa ser consultado — este documento é autossuficiente.**

# 1. Objetivo do Documento

Este documento descreve o Core Matemático final do sistema iPYSY (versão v3.2), formalizando de forma rigorosa:
- agregação probabilística coletiva (IGCI)
- reputação dinâmica contínua
- decaimento por inatividade (3%)
- níveis meritocráticos de usuário (EVT v2)
- limites explícitos de influência por nível
- saturação logarítmica da influência
- governança sistêmica contra superusuários
- camada de engajamento: streak, especialização por domínio e onboarding (novidade v3.2)

O modelo é determinístico, auditável, reproduzível e juridicamente defensável.

# 2. Escopo das Alterações v3.1 → v3.2

O Core v3.2 incorpora três alterações matemáticas fundamentais motivadas pela calibração empírica do sistema de gamificação (ADR-016). Todas as demais propriedades do Core v3.1 permanecem inalteradas e estão documentadas nas seções seguintes.

| **Componente**                 | **Core v3.1 (arquivado)**                | **Core v3.2 (vigente)**                                                                   |
| ------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| Função de acurácia             | accuracy = baseAccuracy × consensusValue | accuracy = base × (1 + consensus) / 2                                                     |
| Scale factor                   | Não existia (implícito = 1,0)            | Scale factor explícito: 40×                                                               |
| Multiplicadores de engajamento | Não existiam                             | streak_mult, domain_mult, onb_mult (Seção 9)                                              |
| ΔR — fórmula                 | ΔR = f(εi, κi) — função não linear     | ΔR = (accuracy − 0,5) × confidence × EVT_mult × 40 × streak_mult × domain_mult × onb_mult |
| Demais componentes             | Inalterados                              | Inalterados (Seções 3 a 8)                                                                |

# 📄 3. Conjuntos Fundamentais

$$
U = \{u₁, u₂, …, uₙ\}
$$
Conjunto de todos os usuários (agentes) participantes do sistema iPYSY. Cada usuário é um agente autônomo que submete previsões probabilísticas.

$$
E = \{e₁, e₂, …, eₘ\}
$$
Conjunto de todos os eventos futuros previsíveis cadastrados no sistema. Cada evento possui uma fonte de resolução previamente estabelecida.

$$
P ⊂ U × E × [0,1]
$$
Conjunto de todas as previsões probabilísticas registradas no sistema. Cada elemento de P associa um usuário a um evento e a uma probabilidade subjetiva contínua.

Cada previsão individual é representada por:

$$
pᵢ = (uᵢ, eⱼ, pᵢ)
$$
Previsão individual associando o usuário uᵢ ao evento eⱼ com probabilidade pᵢ ∈ [0,1]. pᵢ representa a probabilidade subjetiva atribuída pelo usuário à ocorrência do evento.

# 📄 4. Estado do Sistema

$$
Sₜ = (Rₜ, Pₜ, Yₜ)
$$
Estado global do sistema no instante discreto t. Compõe-se da reputação de todos os usuários, das previsões ativas e do estado de resolução dos eventos.

$$
t
$$
Índice temporal discreto que representa o instante de avaliação do sistema. A cada período t, o sistema processa as resoluções de eventos e atualiza as reputações.

$$
Pₜ
$$
Conjunto de previsões ativas registradas no sistema no instante t. Inclui todas as previsões cujos eventos ainda não foram resolvidos.

$$
Yₜ
$$
Função que associa cada evento ao seu estado de resolução no instante t. Permite ao sistema determinar quais previsões podem ser avaliadas e pontuadas.

# 📄 5. Resultado dos Eventos

$$
Y(e) ∈ \{0, 1, ⊥\}
$$
Resultado observado do evento e, verificado pela fonte de resolução previamente estabelecida:

> *1 = evento ocorreu | 0 = evento não ocorreu | ⊥ = ainda não resolvido*

# 📄 6. Reputação

$$
Rₜ : U → ℝ⁺
$$
Função de reputação no instante t, que associa cada usuário a um valor real não negativo. Representa a confiabilidade preditiva histórica acumulada.

$$
Rₜ(uᵢ) ∈ ℝ⁺
$$
Reputação interna acumulada do usuário uᵢ no instante t. Sem limite superior — a reputação nunca é limitada artificialmente, preservando incentivo e granularidade.

$$
Rₜ₊₁(uᵢ)
$$
Reputação atualizada do usuário uᵢ após aplicação das regras de aprendizado ou decaimento temporal. Calculada após cada evento resolvido ou a cada período de inatividade.

# 📄 7. Atividade, Inatividade e Decaimento

## 7.1 Limiar Temporal

$$
T = 30 dias
$$
Limiar temporal máximo permitido sem interação válida antes da aplicação do decaimento de reputação. Uma interação válida é qualquer previsão submetida pelo usuário.

## 7.2 Funções de Estado

$$
tᵢˡᵃˢᵗ
$$
Instante temporal da última interação válida do usuário uᵢ no sistema. Usado para calcular o intervalo de inatividade e determinar se o decaimento deve ser aplicado.

$$
ativo(uᵢ, t)
$$
Indica se o usuário uᵢ está ativo no instante t. Usuários ativos nunca sofrem decaimento.

> *ativo(uᵢ, t) = 1, se (t − tᵢˡᵃˢᵗ) ≤ T | 0, se (t − tᵢˡᵃˢᵗ) > T*

$$
inativo(uᵢ, t)
$$
Complemento de ativo(uᵢ, t). Usuários inativos perdem 3% de reputação a cada período de 30 dias.

> *inativo(uᵢ, t) = 1 − ativo(uᵢ, t)*

## 7.3 Regra de Evolução da Reputação

$$
γ = 0,97
$$
Fator multiplicativo de decaimento aplicado à reputação de usuários inativos. Corresponde a uma redução de 3% por período de 30 dias de inatividade.

**Fórmula de evolução:**
> Rₜ₊₁(uᵢ) = Rₜ(uᵢ) + ΔRᵢ, se ativo(uᵢ, t) = 1
> Rₜ₊₁(uᵢ) = γ · Rₜ(uᵢ), se inativo(uᵢ, t) = 1

# 📄 8. Erro e Confiança

$$
εᵢ = |pᵢ − Y(e)| ∈ [0, 1]
$$
Erro absoluto da previsão do usuário uᵢ em relação ao resultado real do evento e. Quanto menor o erro, melhor a previsão. ε = 0 indica previsão perfeita; ε = 1 indica erro máximo.

$$
κi = 2 · |pᵢ − 0,5| ∈ [0, 1]
$$
Nível de confiança implícito da previsão, inferido automaticamente pelo sistema a partir do valor submetido. κ = 0 indica máxima incerteza (previsão = 50%); κ = 1 indica máxima confiança (previsão = 0% ou 100%). Confiança alta penaliza mais em caso de erro e recompensa mais em caso de acerto.

# 📄 9. Função de Atualização de Reputação (v3.2)

## 9.1 Visão Geral

No Core v3.2, a função de atualização foi reformulada para corrigir a assimetria identificada na versão anterior e calibrada empiricamente via scale factor. A nova fórmula é linear, determinística e auditável.

## 9.2 Função de Acurácia Revisada

$$
accuracy(base, consensus)
$$
Acurácia ajustada da previsão, combinando o resultado bruto com o nível de consenso do evento. A fórmula revisada (Caminho 3) corrige a assimetria do Core v3.1, onde acertar eventos de alto consenso gerava ΔR negativo por força da multiplicação direta pelo consenso.

> *accuracy = base × (1 + consensus) / 2*

$$
base ∈ \{0,0; 0,5; 1,0\}
$$
Acurácia bruta determinada pelo resultado do evento: CORRECT = 1,0 | SEMI_CORRECT = 0,5 | INCORRECT = 0,0.

$$
consensus ∈ [0, 1]
$$
Valor do consenso coletivo IGCI no momento da resolução do evento. Representa a expectativa agregada dos participantes antes do resultado.

**Tabela de exemplos:**

| **Outcome**  | **base** | **consensus (ex.)** | **accuracy resultante** |
| ------------ | -------- | ------------------- | ----------------------- |
| CORRECT      | 1,0      | 0,65                | 1,0 × 1,65 / 2 = 0,825  |
| CORRECT      | 1,0      | 0,90                | 1,0 × 1,90 / 2 = 0,950  |
| INCORRECT    | 0,0      | 0,65                | 0,0 × 1,65 / 2 = 0,000  |
| SEMI_CORRECT | 0,5      | 0,65                | 0,5 × 1,65 / 2 = 0,413  |

## 9.3 Fórmula Completa de ΔR (v3.2)

$$
ΔR = (accuracy − 0,5) × confidence × EVT_mult(L) × 40 × streak_mult × domain_mult × onb_mult
$$

**Descrição de cada parâmetro:**

$$
accuracy ∈ [0, 1]
$$
Acurácia ajustada da previsão, calculada conforme Seção 9.2. Valor acima de 0,5 gera ΔR positivo; abaixo de 0,5 gera ΔR negativo.

$$
confidence ∈ (0, 1]
$$
Grau de confiança da previsão submetida pelo usuário. Corresponde ao valor absoluto da distância entre a previsão e 50%. Amplifica tanto recompensas quanto penalizações proporcionalmente à confiança declarada.

$$
EVT_mult(L) ∈ [1,0; 1,5]
$$
Multiplicador de reputação por nível EVT. Usuários de nível mais alto ganham e perdem mais por previsão, refletindo maior responsabilidade preditiva.

> *L0=1,0× | L1=1,1× | L2=1,2× | L3=1,3× | L4=1,4× | L5=1,5×*

$$
scale = 40 (constante)
$$
Fator de calibração empírica determinado por simulação. Calibrado para que o perfil Moderado (3 previsões/dia, 65% de acertos) atinja o Nível 1 em aproximadamente 39 dias de uso ativo. Sem este fator, o ganho diário é de 0,065 pts — tempo para Nível 1 seria de 1.533 dias.

$$
streak_mult ∈ [1,0; 1,75]
$$
Bônus sobre ΔR por sequência contínua de dias ativos. Incentiva consistência e recorrência de uso. Ver tabela completa na Seção 9.4.

$$
domain_mult ∈ [1,0; 1,5]
$$
Bônus sobre ΔR por especialização em domínio específico de eventos. Incentiva profundidade analítica e cria perfis de especialistas verificados. Ver Seção 9.5.

$$
onb_mult ∈ \{1,0; 3,0\}
$$
Multiplicador de onboarding. Aplicado nas primeiras 30 previsões do usuário para reduzir o risco de churn precoce por progressão lenta. Após a 30ª previsão, retorna a 1,0 permanentemente. O contador de previsões é atômico e não resetável.

> *onb_mult = 3,0, se prediction_count ≤ 30 | onb_mult = 1,0, se prediction_count > 30*

## 9.4 Tabela de streak_mult

| **Streak mínimo** | **streak_mult** | **Descrição**                                                                                    |
| ----------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| \< 7 dias         | 1,00×           | Sem bônus. Nível base de progressão.                                                             |
| 7 dias            | 1,10×           | +10% sobre ΔR. Recompensa primeira semana completa.                                              |
| 14 dias           | 1,20×           | +20% sobre ΔR. Consolidação do hábito de duas semanas.                                           |
| 30 dias           | 1,35×           | +35% sobre ΔR. Primeiro mês completo de consistência.                                            |
| 60 dias           | 1,50×           | +50% sobre ΔR. Dois meses contínuos de engajamento.                                              |
| 90 dias           | 1,75×           | +75% sobre ΔR. Três meses — corta o tempo para Diamante de 163 para 93 dias (Perfil Moderado). |

## 9.5 Tabela de domain_mult

| **Tier**     | **domain_mult** | **Concentração mínima** | **Brier Score exigido**                                       |
| ------------ | --------------- | ----------------------- | ------------------------------------------------------------- |
| Generalista  | 1,00×           | \< 30% em 1 domínio     | Sem exigência. Nível padrão para todos os usuários.           |
| Especialista | 1,25×           | ≥ 30% em 1 domínio      | Brier \< 0,25. Concentração significativa com boa calibração. |
| Expert       | 1,50×           | ≥ 50% em 1 domínio      | Brier \< 0,20. Especialista dominante com alta precisão.      |

> **IMPORTANTE:** Os multiplicadores streak_mult e domain_mult afetam exclusivamente a velocidade de progressão de nível (ΔR). O peso no consenso IGCI (wᵢ) é calculado exclusivamente com base no score e nível EVT, sem qualquer influência de streak ou domínio. A integridade estatística do IGCI é preservada.

## 9.6 Invariantes Preservadas

- ΔR pode ser negativo — previsões erradas penalizam a reputação
- score ≥ 0 sempre — piso em zero preservado, reputação nunca é negativa
- Incentivo correto preservado: prever com alta confiança e errar penaliza mais que prever com baixa confiança
- Nenhum multiplicador de engajamento altera o cálculo de wᵢ (peso no consenso)
- Inatividade nunca é estratégia dominante — o decaimento sempre penaliza o usuário inativo

# 10. Níveis de Usuário (EVT v2)

$$
L(uᵢ) = min(⌊Rₜ(uᵢ) / 100⌋, 5)
$$
Nível de reputação discreto do usuário uᵢ, utilizado para governança e controle de influência. Calculado dinamicamente a cada atualização de score. Níveis não são permanentes: caem se o score cair.

$$
Lₘₐₓ = 5
$$
Nível máximo permitido (Especialista Sênior / Elite). Manter o nível máximo exige participação contínua — o decaimento por inatividade pode reduzir o nível.

| **Nível EVT (L)** | **Nome**            | **Faixa de Rₜ** | **Selo (ADR-016)**      |
| ----------------- | ------------------- | --------------- | ----------------------- |
| 0                 | Observador          | 0 — 99          | Nenhum                  |
| 1                 | Iniciado            | 100 — 199       | Branco — Premium only   |
| 2                 | Contribuidor        | 200 — 299       | Bronze — Premium only   |
| 3                 | Analista            | 300 — 399       | Prata — Premium only    |
| 4                 | Especialista        | 400 — 499       | Ouro — Premium only     |
| 5                 | Especialista Sênior | ≥ 500           | Diamante — Premium only |

# 📄 11. Limites de Influência por Nível (Governança)

$$
Wₘₐₓ(L)
$$
Limite máximo de peso permitido no consenso para usuários do nível L. Garante que nenhum usuário, independentemente do score acumulado, domine o consenso coletivo. Implementa governança explícita contra superusuários.

| **Nível EVT (L)**       | **Wₘₐₓ(L)** | **Interpretação**                                                             |
| ----------------------- | ----------- | ----------------------------------------------------------------------------- |
| 0 — Observador          | 1,0         | Peso base. Influência mínima no consenso.                                     |
| 1 — Iniciado            | 1,3         | Leve aumento de influência após calibração inicial.                           |
| 2 — Contribuidor        | 1,7         | Influência crescente com consistência preditiva.                              |
| 3 — Analista            | 2,2         | Influência relevante — analista calibrado.                                    |
| 4 — Especialista        | 2,8         | Alta influência — especialista com histórico sólido.                          |
| 5 — Especialista Sênior | 3,5         | Influência máxima — elite não dominante. Teto explícito preserva diversidade. |

# 📄 12. Peso Efetivo no Consenso

$$
wᵢ = min(log(1 + Rₜ(uᵢ)) + ϵ, Wₘₐₓ(L(uᵢ)))
$$
Peso efetivo da previsão do usuário uᵢ no cálculo do consenso coletivo. Combina saturação logarítmica (crescimento marginal decrescente), teto explícito por nível, preservação de mérito e prevenção de superusuários. Os multiplicadores de engajamento (streak, domínio, onboarding) NÃO afetam este cálculo.

$$
ϵ > 0
$$
Constante positiva mínima utilizada para garantir estabilidade numérica e evitar divisão por zero no cálculo do consenso, mesmo para usuários com reputação zero.

**Propriedades combinadas por wᵢ:**
* Saturação marginal: crescimento logarítmico reduz o retorno marginal de reputação adicional
* Teto explícito: Wₘₐₓ(L) impede dominância mesmo com reputação muito alta
* Preservação de mérito: usuários mais calibrados sempre têm mais peso que menos calibrados
* Prevenção de superusuários: nenhum agente domina o IGCI individualmente

# 📄 13. Consenso Coletivo (IGCI)

$$
C(e) = Σ(wᵢ · pᵢ) / Σwᵢ
$$
Consenso probabilístico coletivo do evento e, denominado iPYSY Global Consensus Index (IGCI). Média ponderada das previsões de todos os participantes, onde cada peso reflete a confiabilidade histórica calibrada do usuário. O IGCI é dinâmico, auditável e congelado após a resolução do evento.

**Propriedades do IGCI:**
* Varia continuamente com novas previsões e revisões
* Reflete mudanças de expectativa coletiva em tempo real
* Funciona como indicador antecedente de eventos futuros
* É congelado após a resolução do evento e torna-se dado histórico auditável
* Nunca é afetado diretamente por notícias ou dados externos — reage apenas à mudança de expectativa humana

# 📄 14. Propriedades Garantidas

| **Propriedade**                    | **Descrição**                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Incentivo correto preservado       | Prever com alta confiança e acertar maximiza ganho; prever com alta confiança e errar maximiza perda.    |
| Inatividade nunca é dominante      | O decaimento sempre penaliza o usuário inativo em relação ao ativo.                                      |
| Nenhum usuário domina o consenso   | Wₘₐₓ(L) garante teto explícito de influência para qualquer nível.                                        |
| Governança clara por nível         | Cada nível EVT tem peso máximo definido e público.                                                       |
| Aderência ao EVT v2                | Os seis níveis meritocráticos estão mapeados à fórmula L(uᵢ).                                            |
| Compatível com ambientes regulados | Sem instrumentos financeiros, sem dados biométricos no motor, sem GPS.                                   |
| Integridade do IGCI preservada     | Multiplicadores de engajamento afetam ΔR mas não wᵢ — o consenso é sempre calculado sobre mérito puro. |

# 📄 15. Calibração Empírica — Janelas de Progressão

Simulação com scale = 40 e onboarding ativo, por perfil de uso e tier de especialização. Todos os valores assumem hit rate e confiança representativos de cada perfil.

| **Nível** | **Selo** | **Casual** | **Moderado** | **Mod. Expert** | **Power User** |
| --------- | -------- | ---------- | ------------ | --------------- | -------------- |
| 1         | Branco   | N/A        | 19 dias      | 9 dias          | 4 dias         |
| 2         | Bronze   | N/A        | 54 dias      | 29 dias         | 11 dias        |
| 3         | Prata    | N/A        | 86 dias      | 51 dias         | 20 dias        |
| 4         | Ouro     | N/A        | 115 dias     | 70 dias         | 28 dias        |
| 5         | Diamante | N/A        | 143 dias     | 89 dias         | 35 dias        |

> Perfil Casual (1 previsão/dia, 5 dias/semana, 60% de acertos): não atinge Nível 1 em 2 anos. Limitacão conhecida e deliberada — documentada como D9 no ADR-016. O usuário Casual contribui para a massa de consenso do IGCI mas não é alvo de conversão Premium via selos.

# 📄 16. Definição Canônica Final (v3.2)

O Core iPYSY v3.2 é um sistema matemático de agregação probabilística no qual a reputação evolui por desempenho quando o usuário está ativo, sofre decaimento controlado exclusivamente por inatividade, e tem sua influência no consenso regulada por saturação logarítmica e níveis explícitos de governança, garantindo estabilidade sistêmica, incentivo correto e diversidade informacional. A velocidade de progressão de nível é modulada por multiplicadores de engajamento (streak, domínio, onboarding) que não afetam o peso no consenso IGCI, preservando a integridade estatística do sistema. O scale factor de 40× é calibrado empiricamente para que o perfil Moderado atinja o Nível 1 em aproximadamente 39 dias de uso ativo.

---

# STATUS DE IMPLEMENTAÇÃO NO BACKEND

| Campo                    | Valor                                                                       |
| ------------------------ | --------------------------------------------------------------------------- |
| **Status backend**       | 🟡 PARCIAL — motor matemático implementado, camadas novas do v3.2 pendentes |
| **Tickets relacionados** | p2-182 (selos P0), p2-190 (CATE P2)                                         |
| **Data**                 | 2026-05-04                                                                  |

**Implementado (v3.1 base + v3.2 fórmulas)**:
- `ReputationCalculator`: ΔR com multiplicadores, decaimento γ=0,97, saturação logarítmica, `Wₘₐₓ` por nível EVT. 32 testes unitários passando (CON-002 v4).
- `ConsensusCalculator`: IGCI ponderado por reputação, pipeline Kafka completo.
- Nível EVT v2 (6 níveis 0–5), streak_days, prediction_count, user_domain_stats (V57 migration).
- Onboarding multiplicador (v3.2 novidade): campo presente na entidade.

**Pendente (v3.2 — camada de selos + CATE)**:
- **p2-182**: Sistema de selos de usuário (ADR-016 / EVT-002) — `SealTier`, `user_seals`, trigger por EVT Level, `SealHash` SHA-256.
- **p2-190**: CATE multiclasse (ADR-013) — extensão paramétrica do Core para N outcomes.

> O scale factor 40× está calibrado. Perfil Moderado atinge Nível 1 em ~39 dias de uso ativo.

---
*IPYSY — Intelligence for Decisions | CORE_IPYSY v3.2.1 | Maio de 2026*
