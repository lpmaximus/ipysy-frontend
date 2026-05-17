# LGL-002_Politica_de_Privacidade_iPYSY v1.1
IPYSY (Prediction Intelligence & Reputation Platform)
*LGL — POLÍTICA DE PRIVACIDADE*

| **Campo**                 | **Valor**                              |
| ------------------------- | -------------------------------------- |
| **Código**                | LGL-002                                |
| **Título**                | Política de Privacidade — iPYSY        |
| **Versão**                | v1.1                                   |
| **Data original**         | Março de 2026                          |
| **Data revisão**          | 5 de Maio de 2026                      |
| **Status**                | Vigente — Público                      |
| **Responsável**           | DPO + Compliance & Legal — L2Tech Inc. |
| **Entidade**              | L2Tech Inc. (Delaware, EUA)            |
| **Documento relacionado** | LGL-001 — Termos de Uso                |
| **Próximo documento**     | LGL-003 — Política de Cookies (futuro) |

> *Esta Política de Privacidade operacionaliza os direitos declarados no LGL-001 (Termos de Uso). Ela mapeia cada categoria de dado pessoal, sua finalidade, base legal e ciclo de vida completo. É válida para as jurisdições do Brasil (LGPD), Portugal/UE (GDPR) e EUA (CCPA, quando aplicável).*

# 1. Identificação do Controlador e do Encarregado de Dados (DPO)

## 1.1 Controlador dos Dados

O controlador dos dados pessoais coletados pela Plataforma iPYSY é:

| **Razão Social**          | L2Tech Inc.                                                   |
| ------------------------- | ------------------------------------------------------------- |
| **Registro**              | Estado de Delaware, Estados Unidos da América                 |
| **Plataforma operada**    | iPYSY — infraestrutura de inteligência preditiva colaborativa |
| **Contato geral**         | legal@ipysy.com                                               |

## 1.2 Encarregado de Proteção de Dados (DPO)

A L2Tech Inc. possui Encarregado de Proteção de Dados (DPO) formalmente nomeado, conforme exigido pelo Art. 41 da LGPD e pelo Art. 37 do GDPR. O DPO é o canal oficial para todas as solicitações relacionadas a dados pessoais.

| **Cargo**                | Data Protection Officer (DPO) — Encarregado de Dados                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **E-mail**               | dpo@ipysy.com                                                                                                                                                                                          |
| **Prazo de resposta**    | Até 15 dias corridos (LGPD Art. 18 §3º) / Até 30 dias (GDPR Art. 12.3)                                                                                                                                 |
| **Idiomas**              | Português (BR), Português (PT), Inglês                                                                                                                                                                 |

# 2. Categorias de Dados Pessoais Coletados

A Plataforma coleta dados em categorias distintas, conforme o nível de verificação alcançado pelo usuário no fluxo de onboarding. A coleta é progressiva e proporcional às funcionalidades desbloqueadas.

| **Categoria** | **Dado Coletado**                    | **Formato Armazenado**                                                            | **Nível de Coleta** |
| ------------- | ------------------------------------ | --------------------------------------------------------------------------------- | ------------------- |
| Identificação | Endereço de e-mail                   | Texto — campo único indexado                                                    | Nível 1             |
| Identificação | Senha de acesso                      | Hash bcrypt — nunca em texto                                                    | Nível 1             |
| Contato       | Número de telefone                   | Hash HMAC-SHA256 — número não armazenado em texto                               | Nível 2             |
| Identidade    | Nome legal completo                  | Texto — vinculado ao user_id ativo                                              | Nível 3             |
| Identidade    | Data de nascimento                   | Data estruturada (AAAA-MM-DD)                                                     | Nível 3             |
| Identidade    | Endereço residencial                 | Texto estruturado (país, cidade, CEP)                                             | Nível 3             |
| Documento     | CPF (Brasil) / NIF (Portugal)        | Apenas hash HMAC-SHA256 com salt — doc. original nunca armazenado               | Nível 3             |
| Biometria     | Documento oficial (frente/verso)     | Processado pelo provedor KYC — não armazenado pela iPYSY                        | Nível 4             |
| Biometria     | Selfie / liveness check              | Processado pelo provedor KYC — referência face_id_ref armazenada (não a imagem) | Nível 4             |
| Reputação     | Histórico de previsões e Brier Score | Estruturado — vinculado ao user_id / ghost_id                                   | Operação            |
| Técnico       | Logs de acesso e IP                  | Armazenado por até 5 anos — protegido                                           | Automático          |
| Técnico       | Dados de sessão e cookies essenciais | Sessão — expiram conforme política de cookies (LGL-003)                         | Automático          |

> *O CPF e o NIF nunca são armazenados em texto claro. Apenas o hash criptográfico (HMAC-SHA256 com salt gerenciado via KMS) é persistido, exclusivamente para verificação de unicidade de conta. O documento original e a imagem biométrica não têm contato com os servidores da iPYSY.*

# 3. Dados que Não Coletamos

A iPYSY adota um modelo de coleta mínima (privacy by design). Os seguintes dados não são coletados, solicitados ou processados em nenhuma hipótese:

* Informações financeiras: números de cartão, contas bancárias, saldo ou histórico de transações
* Dados de saúde ou genéticos
* Crença religiosa, filiação política ou orição sindical
* Orição sexual ou identidade de gênero
* Contatos da agenda do dispositivo
* Localização em tempo real (GPS)
* Dados de crianças ou adolescentes menores de 18 anos

> *A ausência de dados financeiros é estrutural e intencional: a Plataforma não movimenta dinheiro, não oferece prêmios e não opera como instituição financeira. Esta é a garantia técnica que complementa a declaração jurídica do LGL-001, Cláusula 3.*

# 4. Finalidades do Tratamento e Base Legal

Cada operação de tratamento de dados pessoais possui finalidade definida e base legal correspondente, conforme exigido pelo Art. 7º da LGPD e pelo Art. 6º do GDPR.

| **Finalidade**                          | **Dado utilizado**                             | **Base legal LGPD**                 | **Base legal GDPR**                   |
| --------------------------------------- | ---------------------------------------------- | ----------------------------------- | ------------------------------------- |
| Autenticação e acesso seguro            | E-mail, senha (hash), sessão                   | Art. 7º, V — execução de contrato | Art. 6(1)(b) — execução de contrato |
| Verificação de identidade e unicidade   | Telefone (hash), doc. (hash), biometria (ref.) | Art. 7º, V — execução de contrato | Art. 6(1)(b) — execução de contrato |
| Operação do sistema reputacional        | Histórico de previsões, Brier Score, IGCI      | Art. 7º, V — execução de contrato | Art. 6(1)(b) — execução de contrato |
| Segurança, antifraude e auditoria       | Logs de acesso, IP, device fingerprint         | Art. 7º, IX — legítimo interesse  | Art. 6(1)(f) — interesse legítimo   |
| Comunicações transacionais              | E-mail, telefone                               | Art. 7º, V — execução de contrato | Art. 6(1)(b) — execução de contrato |
| Comunicações de marketing (opt-in)      | E-mail                                         | Art. 7º, I — consentimento        | Art. 6(1)(a) — consentimento        |
| Defesa legal e conformidade regulatória | ghost_id, logs, Vault                          | Art. 16, II — obrigação legal     | Art. 6(1)(c) + Art. 17(3)(e)          |
| Análise agregada de uso da plataforma   | Dados anônimos / agregados sem PII             | Art. 7º, IX — legítimo interesse  | Art. 6(1)(f) — interesse legítimo   |

> *A iPYSY não realiza tomada de decisão automatizada com efeitos jurídicos sobre o usuário (Art. 20 LGPD / Art. 22 GDPR). O Core Math v3.1 calcula reputação como métrica informãacional, sem impacto em crédito, emprego ou serviços externos.*

# 5. Compartilhamento com Terceiros

A L2Tech Inc. não vende, aluga ou comercializa dados pessoais. O compartilhamento ocorre exclusivamente com prestadores de serviço essenciais à operação da Plataforma, sob contratos de processamento de dados (DPA) com obrigações de confidencialidade e conformidade.

| **Categoria**     | **Provedor (Piloto)**             | **Dados Compartilhados**                       | **Finalidade**                            |
| ----------------- | --------------------------------- | ---------------------------------------------- | ----------------------------------------- |
| KYC — Documento   | Persona / Unico Check             | Imagem do documento (processada pelo provedor) | Verificação de autenticidade do documento |
| KYC — Biometria   | Socure / Unico Check              | Selfie + liveness (processados pelo provedor)  | Deduplicacão biométrica e liveness check  |
| OTP / SMS         | Zenvia / Sinch                    | Número de telefone (para envio do código)      | Verificação de número de telefone         |
| Infraestrutura    | Hetzner (Alemão)                  | Todos os dados — hospedagem nos servidores     | Hospedagem e processamento da Plataforma  |
| Autenticação      | Keycloak (self-hosted)            | Credenciais de sessão e tokens                 | Gestão de identidade e acesso             |
| Análises (futuro) | A definir — apenas dados anônimos | Dados agregados sem PII                        | Análise de uso da plataforma              |

> *Os provedores de KYC (Persona, Socure, Unico Check) processam dados biométricos exclusivamente para verificação de identidade. A imagem do documento e a selfie não trafegam pelos servidores da iPYSY — são enviadas diretamente ao provedor via SDK. A iPYSY recebe apenas a referência (face_id_ref) e o resultado (aprovado/rejeitado).*

## 5.1 Divulgação por Obrigação Legal

A L2Tech Inc. poderá divulgar dados pessoais às autoridades competentes quando exigido por lei, ordem judicial ou requisição regulatória válida, nas jurisdições aplicáveis. Em qualquer caso, a divulgação será limitada ao mínimo necessário para o cumprimento da obrigação.

# 6. Retenção de Dados e Ciclo de Vida

## 6.1 Prazos de Retenção por Categoria

| **Categoria de Dado**                              | **Prazo de Retenção**                             | **Fundamento**                                 |
| -------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| Dados de conta ativa (e-mail, nome, telefone hash) | Durante a vigência da conta                       | Execução do contrato                           |
| Histórico de previsões (vinculado ao user_id)      | Durante a vigência da conta                       | Execução do contrato                           |
| Dados anonimizados pós-exclusão (ghost_id)         | Até 5 anos após a exclusão da conta               | Art. 16, II LGPD / Art. 17(3)(e) GDPR          |
| Logs de acesso e segurança                         | Até 5 anos                                        | Legítimo interesse — segurança e defesa legal  |
| Referência biométrica (face_id_ref)                | Excluída imediatamente após encerramento da conta | Minimização de dados (LGPD Art. 6º, III)       |
| Doc. hash (CPF/NIF) — pós-exclusão                 | Até 5 anos (Vault segregado)                      | Prevenção de recadastro abusivo + defesa legal |
| Comunicacões de marketing (opt-in)                 | Até revogação do consentimento                    | Consentimento (Art. 7º, I LGPD)                |
| Dados de sessão e cookies essenciais               | Duração da sessão (detalhado no LGL-003)          | Execução do contrato                           |

## 6.2 Mecanismo de Pseudonimização (ghost_id)

Quando um usuário solicita a exclusão de sua conta, o sistema executa a rotina ERASE_REQUEST, que opera em fases progressivas para conciliar o direito ao esquecimento (LGPD Art. 18 / GDPR Art. 17) com a integridade do histórico de consenso da Plataforma:

| **Fase** | **Gatilho**        | **Ação**                                                                  | **Estado dos Dados**                |
| -------- | ------------------ | ------------------------------------------------------------------------- | ----------------------------------- |
| Fase 1   | Solicitação válida | Rotina ERASE_REQUEST — SLA: 72h                                         | PII pendente de removção            |
| Fase 2   | Confirmação        | user_id → ghost_id. Remoção de PII do banco principal                     | ghost_id no banco. PII removido     |
| Fase 3   | Após Fase 2        | Cópia cifrada (AES-256) replicada ao Vault segregado. TTL = hoje + 5 anos | Vault cifrado. Invisível ao produto |
| Fase 4a  | TTL expirado       | Exclusão física definitiva no Vault                                       | Dado irrecuperaçável                |
| Fase 4b  | Ordem judicial     | DPO ativa acesso controlado ao Vault                                      | Recuperação com log completo        |

> *O Core Math v3.1 permanece completamente inalterado pelo processo de exclusão. O ghost_id carrega o peso histórico congelado no momento da exclusão, que decai naturalmente a zero pelo mecanismo de inatividade já previsto no Core (3% por período). O Vault é acessível exclusivamente pelo DPO e pela equipe jurídica, com MFA obrigatório e log imutável de cada acesso.*

# 7. Transferências Internacionais de Dados

A L2Tech Inc. está registrada nos Estados Unidos (Delaware) e opera servidores hospedados pela Hetzner na Alemanha (território da União Europeia). Esta configuração gera fluxos internacionais de dados que são endereçados da seguinte forma:

| **Fluxo de Transferência**                    | **Mecanismo de Adequação**                                          | **Base Normativa**                   |
| --------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------ |
| Brasil → Alemanha (Hetzner)                   | País destinatário (Alemanha/UE) reconhecido como adequado pela ANPD | LGPD Art. 33, I                      |
| Brasil → EUA (L2Tech Inc.)                    | Cláusulas contratuais padrão + DPA específico                       | LGPD Art. 33, II                     |
| Portugal/UE → Alemanha (Hetzner)              | Transferência intra-UE — não requer mecanismo adicional           | GDPR Art. 44 (transferência interna) |
| Portugal/UE → EUA (L2Tech Inc.)               | Cláusulas contratuais padrão (SCCs) adotadas pela Comissão Europeia | GDPR Art. 46(2)(c)                   |
| Dados KYC → Provedores (Persona/Socure/Unico) | DPA específico com cada provedor + SCCs quando aplicável            | LGPD Art. 33, II / GDPR Art. 46      |

Em todos os casos de transferência internacional, a L2Tech Inc. garante que os destinatários dos dados ofereçam nível de proteção equivalente ao exigido pela LGPD e pelo GDPR, por meio de contratos formais de processamento de dados (DPA).

# 8. Segurança Técnica e Organizacional

## 8.1 Medidas Técnicas

A L2Tech Inc. implementa medidas de segurança proporcionais ao risco e ao estado da arte tecnológico, incluindo:

* Criptografia em trânsito: TLS 1.3 em todas as comunicações
* Criptografia em repouso: AES-256 para dados sensíveis e para o Vault segregado
* Hashing criptográfico: HMAC-SHA256 com salt gerenciado por KMS para CPF/NIF e telefone
* Senhas armazenadas exclusivamente como hash bcrypt — nunca em texto
* Controle de acesso baseado em funções (RBAC) e autenticação multifator (MFA) para acesso administrativo e ao Vault
* Phantom Token Pattern para gestão segura de tokens de sessão via Keycloak
* Logs de acesso imutáveis (append-only) para operações críticas

## 8.2 Medidas Organizacionais

* Política de acesso mínimo necessário (least privilege) para toda a equipe
* DPO com responsabilidade formal sobre o Vault e sobre solicitações de titulares
* Auditoria trimestral de acessos ao Vault e volume de solicitações de exclusão
* Treinamento de equipe sobre proteção de dados e LGPD/GDPR
* Plano de resposta a incidentes de segurança com notificação à ANPD/CNPD em até 72h (LGPD Art. 48 / GDPR Art. 33)

> *Nenhum sistema de segurança oferece proteção absoluta. Em caso de incidente que afete dados pessoais, a L2Tech Inc. notificará a autoridade competente e os titulares afetados conforme os prazos legais aplicáveis.*

# 9. Cookies e Tecnologias de Rastreamento

A Plataforma utiliza cookies e tecnologias similares de forma restrita e proporcional. Não utilizamos cookies publicitários ou de rastreamento de terceiros para fins comerciais.

| **Tipo**          | **Finalidade**                                      | **Duração**          | **Consentimento**  |
| ----------------- | --------------------------------------------------- | -------------------- | ------------------ |
| Essenciais        | Autenticação, sessão, segurança CSRF                | Sessão / Até 30 dias | Não necessário     |
| Preferências      | Idioma, tema, configurações de interface            | Até 1 ano            | Não necessário     |
| Análise (anônima) | Métricas agregadas de uso da plataforma — sem PII | Até 13 meses         | Opt-in (Brasil/PT) |
| Marketing         | NÃO UTILIZADOS                                      | —                  | —                |

A Política de Cookies detalhada (LGL-003) será publicada antes do lançamento da Plataforma e descreverá cada cookie individualmente, com opções de gestão pelo usuário.

# 10. Direitos do Titular — Como Exercer na Prática

Você pode exercer seus direitos a qualquer momento. O canal oficial é o e-mail do DPO: dpo@ipysy.com. Todas as solicitações serão respondidas dentro dos prazos legais.

| **Direito**                       | **O que cobre**                                                     | **Prazo (LGPD)** | **Prazo (GDPR)** |
| --------------------------------- | ------------------------------------------------------------------- | ---------------- | ---------------- |
| Acesso                            | Confirmação e cópia dos dados tratados                              | 15 dias          | 30 dias          |
| Correção                          | Retificação de dados inexatos ou desatualizados                     | 15 dias          | 30 dias          |
| Eliminação                        | Exclusão de dados desnecessários — com ressalva do Vault (5 anos) | 15 dias          | 30 dias          |
| Portabilidade                     | Recebimento dos dados em formato estruturado (JSON/CSV)             | 15 dias          | 30 dias          |
| Revogação de consentimento        | Cancelamento de marketing ou cookies opcionais                      | Imediato         | Imediato         |
| Oposição                          | Contestação ao tratamento baseado em legítimo interesse             | 15 dias          | 30 dias          |
| Informação sobre compartilhamento | Lista de terceiros que receberam seus dados                         | 15 dias          | 30 dias          |
| Revisão de decisão automatizada   | Revisão humana de qualquer decisão automática (LGPD Art. 20)        | Conforme ANPD    | 30 dias          |

## 10.1 Procedimento de Solicitação

* Envie um e-mail para dpo@ipysy.com com o assunto: [DIREITO LGPD] ou [GDPR REQUEST]
* Identifique-se com o e-mail cadastrado na Plataforma
* Descreva o direito que deseja exercer e, se aplicável, os dados específicos envolvidos
* O DPO poderá solicitar documentação adicional para verificar sua identidade antes de processar a solicitação

## 10.2 Direito de Reclamação às Autoridades

Caso considere que o tratamento dos seus dados viola a legislação aplicável, você tem o direito de apresentar reclamação à autoridade supervisora competente:

* Brasil: Autoridade Nacional de Proteção de Dados (ANPD) — www.gov.br/anpd
* Portugal / UE: Comissão Nacional de Proteção de Dados (CNPD) — www.cnpd.pt
* EUA (Califórnia): California Privacy Protection Agency (CPPA) — cppa.ca.gov

# 11. Menores de Idade

A Plataforma é destinada exclusivamente a maiores de 18 anos. Não coletamos intencionalmente dados pessoais de menores de idade.

Se tomarmos conhecimento de que dados de um menor foram coletados inadvertidamente, procederemos à exclusão imediata dessas informações, seguindo o fluxo da Cláusula 6.2, e notificaremos o responsável legal quando identificável.

O sistema de verificação de idade (data de nascimento obrigatória no Nível 3, com validação imediata) é a salvaguarda técnica primária. Contas identificadas como pertencentes a menores de 18 anos serão bloqueadas e os dados excluídos conforme o protocolo ERASE_REQUEST.

> *Pais ou responsáveis legais que identificarem o cadastro indevido de um menor podem contatar o DPO em dpo@ipysy.com para solicitação de exclusão imediata.*

# 12. Alterações desta Política

Esta Política de Privacidade pode ser atualizada para refletir mudanças na legislação, nas práticas de tratamento de dados ou nas funcionalidades da Plataforma.

Para alterações materiais — que afetem direitos dos titulares, finalidades de tratamento ou categorias de dados coletados — a L2Tech Inc. comunicará o usuário com antecedência mínima de 15 (quinze) dias corridos, por notificação no painel da Plataforma e por e-mail.

Alterações não materiais (correções tipográficas, atualização de contatos, esclarecimentos que não alterem direitos) poderão ser realizadas sem aviso prévio, com indicação de nova data de emissão no cabeçalho do documento.

Todas as versões anteriores desta Política serão arquivadas e disponibilizadas mediante solicitação ao DPO.

---

# STATUS DE IMPLEMENTAÇÃO NO BACKEND

| Campo              | Valor                                                                  |
| ------------------ | ---------------------------------------------------------------------- |
| **Status backend** | ✅ IMPLEMENTADO — Fases 0–4b completas. Portabilidade (p2-189) pendente |
| **Tickets**        | p2-184 ✅, p2-185 ✅, p2-189 (P1 pendente)                               |
| **Data**           | 2026-05-05                                                             |

**Implementado**:
- ERASE_REQUEST Fases 0–4b: pseudonimização ghost_id, remoção PII banco principal, cópia Vault AES-256 TTL 5 anos (Fases 1–3)
- **Fase 4a** (p2-184 ✅): `alertExpiringSoon()` — cron 01:30 UTC diário, `[VAULT_EXPIRY_SOON]` WARN ≤30 dias, capturado pelo SigNoz
- **Fase 4b** (p2-184 ✅): `POST /api/v1/admin/dpo/vault-access/{ghostId}` — role `dpo`, MFA via Keycloak, log imutável `dpo_access_log` (V63)
- AccessAuditFilter LGPD-ready (p2-88)
- CCPA opt-out (p2-183 ✅): `POST /api/v1/privacy/ccpa/opt-out` idempotente
- RoPA / Registro de Tratamento (p2-185 ✅): `data_processing_registry` V64, 11 operações seed, `GET /compliance/data-processing-registry`
- DPIA registrado (p2-185 ✅): `PUT /compliance/data-processing-registry/{id}/dpia-completed` — GDPR Art. 35

**Pendente**:
- **p2-189** (P1): `GET /v1/me/data-export` — portabilidade LGPD Art. 18 / GDPR Art. 20 em JSON/CSV
- Verificar que `dpo@ipysy.com` está roteado no notification-service

---
*IPYSY — Intelligence for Decisions | LGL-002_Politica_de_Privacidade_iPYSY v1.1 | Maio de 2026*
