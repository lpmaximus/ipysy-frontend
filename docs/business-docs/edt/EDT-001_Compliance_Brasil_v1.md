# EDT-001_Compliance_Brasil v1.1
IPYSY (Prediction Intelligence & Reputation Platform)
*Guia de Compliance — Brasil — Modelo Não-Financeiro de Previsões Estruturadas*

| **Campo**         | **Valor**                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Código**        | EDT-001                                                                                                                               |
| **Título**        | Guia de Compliance — Brasil                                                                                                           |
| **Versão**        | v1.1                                                                                                                                  |
| **Data original** | 14 de Fevereiro de 2026                                                                                                               |
| **Data revisão**  | 5 de Maio de 2026                                                                                                                     |
| **Status**        | Vigente                                                                                                                               |
| **Responsável**   | Compliance & Regulatory Advisor                                                                                                       |
| **Classificação** | INTERNO — CONFIDENCIAL                                                                                                                |
| **Descrição**     | Enquadramento jurídico, marcos regulatórios e boas práticas de compliance da plataforma iPYSY para operação no território brasileiro. |

# Histórico de Revisões

| **Versão** | **Data**   | **Autor**          | **Descrição da Alteração**                     |
| ---------- | ---------- | ------------------ | ---------------------------------------------- |
| v1.0       | 14/02/2026 | Compliance Advisor | Versão inicial — enquadramento jurídico Brasil |

# Aprovação Formal

Este documento requer aprovação formal antes de sua distribuição.

# 1. Enquadramento Jurídico Base

## 1.1 Natureza do Produto

O contrato iPYSY no Brasil é classificado como:
* Conteúdo estruturado
* Atividade informacional
* Sistema reputacional
* Produto sem risco financeiro

O produto não se enquadra como:
* Aposta (Lei 13.756/2018)
* Betting de quota fixa (Lei 14.790/2023)
* Mercado financeiro supervisionado pela CVM
* Derivativo ou valor mobiliário

# 2. Principais Marcos Regulatórios Brasileiros

## 2.1 Lei 13.756/2018

Regula loterias e apostas no território nacional. A iPYSY não envolve prêmio financeiro e, portanto, não se enquadra no escopo desta lei.

## 2.2 Lei 14.790/2023

Regula apostas esportivas de quota fixa. A iPYSY não possui:
* Odds
* Pagamento por acerto
* Intermediação financeira

## 2.3 Comissão de Valores Mobiliários (CVM)

A plataforma não:
* Capta investimento de terceiros
* Oferece retorno financeiro
* Estrutura derivativos ou instrumentos de mercado

# 3. LGPD — Proteção de Dados

## 3.1 Lei Geral de Proteção de Dados Pessoais

Requisitos obrigatórios de cumprimento:
* Base legal definida para todo tratamento de dados
* Política de privacidade clara e acessível
* Consentimento explícito do usuário
* DPO (Data Protection Officer) nomeado formalmente
* Registro de operações de tratamento de dados pessoais

## 3.2 Pontos Críticos de Atenção
* Dados reputacionais são classificados como dados pessoais
* Logs de sistema devem ser protegidos e acessíveis ao titular
* Garantir direito de acesso e portabilidade de dados

# 4. Riscos Específicos — Brasil

## 4.1 Confusão com Apostas

**Risco:** Enquadramento indevido da plataforma como serviço de apostas por usuários, parceiros ou reguladores.

**Mitigação:**
* Uso de linguagem estritamente institucional
* Proibição explícita de prêmio financeiro nos Termos de Uso
* Exclusão dos termos 'apostar', 'ganhar', 'odds' de toda a interface

## 4.2 Temas Políticos

**Risco:** Violação da legislação eleitoral ou contribuição para disseminação de desinformação.

**Mitigação:**
* Fontes oficiais obrigatórias para contratos políticos
* Matriz de risco editorial reforçada para Categoria B
* Vedação de contratos com formulações opinativas

## 4.3 Regulação Futura

**Risco:** Expansão do controle regulatório brasileiro sobre plataformas digitais.

**Mitigação:**
* Modelo posicionado como claramente educacional e informacional
* Transparência total nos processos editoriais e de resolução

# 5. Tributação

Em caso de operação via entidade jurídica brasileira, aplicam-se os seguintes tributos:
* ISS sobre serviços digitais
* IRPJ/CSLL conforme regime tributário adotado
* PIS/COFINS sobre receitas operacionais

Em caso de filial operacional sem sede fiscal brasileira, avaliar configuração de estabelecimento permanente. Decisão deve ser alinhada com a estratégia societária Delaware → Brasil → Portugal já formalizada.

# 6. Boas Práticas Recomendadas — Brasil

* Termos de uso robustos com cláusula explícita: este serviço não é uma aposta
* Política anti-manipulação de contratos documentada
* Registro e retenção de logs por no mínimo 5 anos
* Auditoria interna anual de compliance
* Monitoramento contínuo de alterações regulatórias

---

# STATUS DE IMPLEMENTAÇÃO NO BACKEND

| Campo              | Valor                                                        |
| ------------------ | ------------------------------------------------------------ |
| **Status backend** | ✅ IMPLEMENTADO — LGPD Art. 37 + retenção 5 anos configurados |
| **Ticket**         | p2-185 ✅ (concluído 2026-05-05)                              |
| **Data**           | 2026-05-05                                                   |

**Implementado**:
- **LGPD Art. 37 / GDPR Art. 30 — RoPA** (p2-185 ✅): tabela `data_processing_registry` (V64) com 11 operações de tratamento incluindo finalidade, base legal LGPD + GDPR, retenção em dias, controlador, processador e transferências internacionais. Endpoint `GET /api/v1/compliance/data-processing-registry` para o DPO.
- **Log retention 5 anos (§6)**: `retention_days` registrado por operação no RoPA. Vault TTL 5 anos para dados ghost_id (V63 `dpo_access_log`). SigNoz alerta expiração 30 dias antes (`[VAULT_EXPIRY_SOON]`).
- **DPIA (GDPR Art. 35)**: campos `dpia_required` e `dpia_completed_at` no RoPA. Endpoint `PUT /compliance/.../dpia-completed` para registrar conclusão. Operações KYC e ERASE_REQUEST marcadas como `dpia_required=true`.

**Pendente**:
- **Auditoria interna anual**: processo a ser definido pelo DPO
- **Cold storage MinIO**: logs SigNoz > 5 anos — avaliar política de arquivamento

---
*IPYSY — Intelligence for Decisions | EDT-001_Compliance_Brasil v1.1 | Maio de 2026*
