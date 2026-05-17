# EDT-002_Compliance_Portugal v1.1
IPYSY (Prediction Intelligence & Reputation Platform)
*Guia de Compliance — Portugal — Modelo Reputacional Não-Financeiro*

| **Campo**         | **Valor**                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Código**        | EDT-002                                                                                                                                                |
| **Título**        | Guia de Compliance — Portugal                                                                                                                          |
| **Versão**        | v1.1                                                                                                                                                   |
| **Data original** | 14 de Fevereiro de 2026                                                                                                                                |
| **Data revisão**  | 5 de Maio de 2026                                                                                                                                      |
| **Status**        | Vigente                                                                                                                                                |
| **Responsável**   | Compliance & Regulatory Advisor                                                                                                                        |
| **Classificação** | INTERNO — CONFIDENCIAL                                                                                                                                 |
| **Descrição**     | Enquadramento jurídico, marcos regulatórios e boas práticas de compliance da plataforma iPYSY para operação em Portugal e no espaço da União Europeia. |

# Histórico de Revisões

| **Versão** | **Data**   | **Autor**          | **Descrição da Alteração**                            |
| ---------- | ---------- | ------------------ | ----------------------------------------------------- |
| v1.0       | 14/02/2026 | Compliance Advisor | Versão inicial — enquadramento jurídico Portugal / UE |

# Aprovação Formal

Este documento requer aprovação formal antes de sua distribuição.

# 1. Enquadramento Jurídico Base

Portugal possui regulação robusta para jogos e apostas online, supervisionada pelo Serviço de Regulação e Inspeção de Jogos (SRIJ). A iPYSY não se enquadra no escopo desta regulação pelos seguintes motivos:
* Ausência de aposta monetária
* Ausência de risco financeiro para o utilizador
* Ausência de prémio ou recompensa pecuniária
* Ausência de payout ou mecanismo de distribuição financeira

# 2. Regime Jurídico dos Jogos e Apostas

## 2.1 Decreto-Lei 66/2015

O Decreto-Lei 66/2015 aplica-se a:
* Jogos de fortuna ou azar
* Apostas à cota
* Jogos com prémio em dinheiro

A iPYSY não se enquadra neste regime porque:
* Não há prémio ou recompensa financeira
* Não há odds ou probabilidades com valor monetário
* Não há intermediação financeira entre utilizadores

# 3. Proteção de Dados — RGPD

## 3.1 Regulamento Geral sobre a Proteção de Dados

Requisitos obrigatórios de cumprimento:
* Nomeação de Data Protection Officer (DPO)
* Realização de DPIA — Data Protection Impact Assessment — antes do lançamento
* Base legal clara e documentada para cada operação de tratamento
* Garantia do direito ao esquecimento com atenção ao conflito com histórico permanente

## 3.2 Conflito: Direito ao Apagamento vs. Imutabilidade dos Contratos

O RGPD garante ao titular o direito ao apagamento dos seus dados pessoais. Este direito pode colidir com o princípio da plataforma de que nenhum contrato pode ser retroativamente apagado. A solução adotada é:
* Anonimização do utilizador no histórico
* Preservação do registo do contrato sem vínculo à identidade
* Separação técnica entre histórico reputacional e dados de identidade (ghost_id)

# 4. Riscos Específicos — Portugal

## 4.1 Enquadramento como Jogo Social

**Risco:** Classificação da plataforma como jogo social pelo SRIJ ou outros organismos reguladores.

**Mitigação:**
* Linguagem estritamente institucional em toda a comunicação
* Evitar gamificação excessiva na interface
* Evitar leaderboard com estrutura agressiva de competição

## 4.2 Temas Políticos

**Risco:** Ambiente regulatório sensível a matérias políticas em Portugal.

**Mitigação:**
* Fontes oficiais obrigatórias para contratos políticos
* Limitação de previsões eleitorais na fase inicial de operação

## 4.3 Direitos do Consumidor

**Risco:** Legislação europeia de defesa do consumidor é particularmente rigorosa.

**Mitigação:**
* Transparência total nos Termos e Condições
* Linguagem clara e acessível ao utilizador comum
* Processo de contestação de resolução documentado e acessível

# 5. Estrutura Societária e Substância

Em caso de operação com entidade jurídica portuguesa, são requisitos obrigatórios:
* Sede real com endereço registado
* Gestão técnica com presença local efetiva
* Contratos de trabalho ou prestação de serviços locais
* Contabilidade separada e auditável

Esta estrutura está alinhada com a estratégia Startup Visa e o regime fiscal de inovação vigente em Portugal.

# 6. Boas Práticas Recomendadas — Portugal

* DPIA formal concluída antes do lançamento ao público
* Parecer jurídico prévio junto de escritório especializado em direito digital
* Teste piloto com volume reduzido de contratos antes da abertura geral
* Comunicação institucional formal com o SRIJ se necessário
* Monitoramento contínuo de transposições de diretivas europeias

---

# STATUS DE IMPLEMENTAÇÃO NO BACKEND

| Campo              | Valor                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| **Status backend** | ✅ IMPLEMENTADO — DPIA registrado, RoPA criado, Fases 4a/4b concluídas |
| **Ticket**         | p2-184 ✅, p2-185 ✅ (concluídos 2026-05-05)                            |
| **Data**           | 2026-05-05                                                            |

**Implementado**:
- **DPIA (GDPR Art. 35)** (p2-185 ✅): campos `dpia_required` e `dpia_completed_at` em `data_processing_registry`. Operações KYC e ERASE_REQUEST marcadas como alto risco (`dpia_required=true`). Endpoint `PUT /compliance/.../dpia-completed` para DPO registrar conclusão formal.
- **RoPA (GDPR Art. 30)** (p2-185 ✅): tabela `data_processing_registry` (V64) com bases legais GDPR, transferências internacionais e salvaguardas (SCCs), processadores identificados.
- **ERASE_REQUEST Fase 4a** (p2-184 ✅): cron alerta SigNoz 30 dias antes de expirar TTL vault
- **ERASE_REQUEST Fase 4b** (p2-184 ✅): DPO Vault Access com MFA + log imutável
- GDPR base compliance: ghost_id, ERASE_REQUEST Fases 0–4b, bases legais Art. 6 documentadas

**Pendente** (pré go-live PT/UE):
- **Registro CNPD (Portugal)**: a ser definido após DPIA concluído e parecer jurídico
- **Teste piloto volume reduzido**: recomendado antes da abertura geral
- **Parecer jurídico especializado em direito digital português**: não contratado
- **p2-189**: portabilidade `GET /me/data-export` (GDPR Art. 20) — P1

---
*IPYSY — Intelligence for Decisions | EDT-002_Compliance_Portugal v1.1 | Maio de 2026*
