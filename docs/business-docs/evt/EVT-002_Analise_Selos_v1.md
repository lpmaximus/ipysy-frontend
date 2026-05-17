# EVT-002_Analise_Selos v1.2
IPYSY (Prediction Intelligence & Reputation Platform)
*ESTUDO DE VIABILIDADE TÉCNICA — Sistema de Selos de Reputação*

| **Campo**         | **Valor**                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Código**        | EVT-002                                                                                                                         |
| **Título**        | Estudo de Viabilidade Técnica — Análise de Conformidade e Plano de Implementação — Sistema de Selos de Reputação — seal-service |
| **Versão**        | v1.2                                                                                                                            |
| **Data original** | 30 de Abril de 2026                                                                                                             |
| **Data revisão**  | 6 de Maio de 2026                                                                                                               |
| **Status**        | ✅ IMPLEMENTADO — commit `aec7550` (develop, 2026-05-06)                                                                        |
| **Responsável**   | Luiz Paulo Cruz — Founder & CEO, L2Tech Inc.                                                                                    |
| **Tipo**          | Análise de Conformidade de Backend — Pós-Implementação                                                                          |
| **Classificação** | INTERNO — CONFIDENCIAL                                                                                                          |
| **Descrição**     | **SLOGAN:** Intelligence for Decisions                                                                                          |

# 1. Sumário Executivo

Este documento registra a análise técnica do sistema de selos implementado no backend do iPYSY (branch develop, abril 2026) e estabelece o plano de correção e implementação completo para alinhamento com as especificações do CORE iPYSY v3.2 e ADR-016 (Sistema de Selos de Usuário, Gamificação e Estrutura de Bonificação).

A análise cobriu 30 arquivos Java no seal-service e reputation-service, 58 migrations Flyway e os documentos de referência ADR-006 v2.0, ADR-016 e CORE v3.2. O resultado identificou uma divergência estrutural fundamental: o seal-service existente implementa certificação de consenso de eventos (consenso > 50%), enquanto o ADR-016 define um sistema de selos de usuário baseado em EVT Level + entitlement Premium. Esses são dois conceitos distintos que precisam coexistir na mesma plataforma.

| **Dimensão Avaliada**                  | **Resultado**     | **Síntese**                                                    |
| -------------------------------------- | ----------------- | -------------------------------------------------------------- |
| Core Math v3.2 — ReputationCalculator  | **✅ CORRETO**     | Fórmula ΔR, multiplicadores, EVT Level — conformes             |
| Migration V57 (campos v3.2)            | **✅ CORRETO**     | streak_days, prediction_count, user_domain_stats — OK          |
| Entidade Seal — campos de tier         | **✅ CORRIGIDO**   | `sealType` + `evtLevel` adicionados em `Seal.java`; V67 `ALTER TABLE seals` |
| Tabela user_seals (ADR-016)            | **✅ CORRETO**     | Migration V62 — tabela `user_seals` presente (criada em 2026-05-04) |
| Gatilho de emissão de selos de usuário | **✅ CORRETO**     | `ReputationLevelChangedConsumer` + `SealService.emitUserSeal()` |
| Validação de entitlement Premium       | **✅ CORRETO**     | `EntitlementClient.canDo()` com FT (@Retry/@CircuitBreaker/@Fallback) |
| Kafka topic level_changed              | **✅ CORRETO**     | `ReputationProducer.publishLevelChanged()` + `ipysy.reputation.level_changed` |
| SealHash — integridade criptográfica   | **✅ CORRETO**     | SHA-256 via `MessageDigest` (64 chars hex) desde 2026-05-04 |
| EventSeal / SealAudit — tipo de ID     | **✅ CORRETO**     | Ambas as entidades usam `UUID` — alinhadas com migration V13 |

> **Todas as correções implementadas — commit `aec7550` (2026-05-06).**

# 2. Contexto e Escopo da Análise

## 2.1 Documentos de Referência

| **Documento**    | **Versão**        | **Relevância**                                                         |
| ---------------- | ----------------- | ---------------------------------------------------------------------- |
| CORE iPYSY       | v3.2 (abril 2026) | Fórmula ΔR, EVT Level, multiplicadores, Wmax — gabarito matemático     |
| ADR-006          | v2.0              | Tiers Free/Premium/Business, entitlement CAN_VIEW_REPUTATION_SEAL      |
| ADR-016          | v1.0 (APROVADO)   | Sistema de selos por EVT Level, regras Premium, imutabilidade, QR Code |

## 2.2 Distinção Conceitual Crítica — Dois Sistemas de Selos

A análise revelou que o backend contém dois conceitos distintos de "selo" que precisam coexistir e não devem ser confundidos:

| **Dimensão**            | **Selo de Consenso (já existente)**                    | **Selo de Usuário ADR-016 (a implementar)**                      |
| ----------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| **O que representa**    | Certificado de que um evento atingiu consenso ≥ 50%    | Distintivo de reputação do usuário por EVT Level conquistado     |
| **Gatilho**             | consensus.updated com valor > 0,50                     | EVT Level ≥ L1 + plano Premium verificado no entitlement-service |
| **Tiers**               | Sem tiers — binário (existe ou não)                    | 6 tiers: NONE, WHITE, BRONZE, SILVER, GOLD, DIAMOND              |
| **Tabela principal**    | seals — já existe (V13)                                | user_seals — a criar (V59)                                       |
| **Imutabilidade**       | Status pode mudar: ACTIVE / EXPIRED / REVOKED          | Imutável após emissão — downgrade não remove o selo conquistado  |

# 3. Componentes Conformes — Não Requerem Modificação

Os componentes abaixo foram validados contra o CORE v3.2 e estão conformes. Nenhuma alteração deve ser feita nesses arquivos para evitar regressão.

## 3.1 ReputationCalculator.java — Fórmula ΔR v3.2

Arquivo: services/reputation/.../service/ReputationCalculator.java

* Fórmula ΔR correta: (accuracy − 0,5) × confidence × EVT_mult × 40 × streak_mult × domain_mult × onb_mult
* Função de acurácia Caminho 3: base × (1 + consensus) / 2 — corrige bug v3.1 que gerava ΔR negativo
* EVT_mult por nível: L0=1,0×, L1=1,1×, L2=1,2×, L3=1,3×, L4=1,4×, L5=1,5× — conforme CORE v3.2
* streak_mult correto: \<7d=1,0×, 7d=1,1×, 14d=1,2×, 30d=1,35×, 60d=1,5×, 90d=1,75×
* domain_mult correto: GENERALISTA=1,0×, ESPECIALISTA=1,25×, EXPERT=1,5×
* onb_mult correto: 3,0× nas primeiras 30 previsões, 1,0× após
* L(u) = min(⌊score / 100⌋, 5) — fórmula de nível correta
* Wmax por nível: L0=1,0, L1=1,3, L2=1,7, L3=2,2, L4=2,8, L5=3,5 — conforme ADR-016
* Decay de inatividade: ×0,97 após 30 dias sem atividade

## 3.2 Demais Componentes Conformes

| **Componente**                               | **Status e Evidência**                                                              |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| UserReputation.java                          | ✅ campos v3.2 presentes: prediction_count, streak_days, last_streak_date, evt_level |
| Migration V57 — Core v3.2 DB                 | ✅ ALTER + CREATE TABLE user_domain_stats conformes                                  |
| Migration V44 — Seed de entitlements ADR-006 | ✅ CAN_VIEW_REPUTATION_SEAL: FREE=false, PREMIUM=true — correto                      |
| SealService.java — CRUD de selos de consenso | ✅ createSeal, getSeal, listSealsByEvent, verifySeal, getSealQrInfo                  |
| SealResource.java — API REST                 | ✅ OpenAPI + \@Audit + Virtual Threads + endpoints corretos                          |
| SealProducer.java                            | ✅ Publica ipysy.seals.created corretamente                                          |
| Migration V13 — tabelas base                 | ✅ seals, seal_verifications, event_seals, seal_audits, seal_records                 |
| ReputationService.java                       | ✅ decay, streak, domínio, inicialização — conformes                                 |
| SealServiceTest.java                         | ✅ CRUD coberto com mocks adequados                                                  |

# 4. Problemas Identificados

Os problemas estão classificados em Críticos (C) — bloqueiam a funcionalidade correta do sistema de selos — e Complementares (P) — afetam qualidade, consistência ou segurança sem bloquear completamente a operação.

## C1 — Entidade Seal sem campos de tier | ✅ IMPLEMENTADO (2026-05-06)

**Arquivo:** services/seal/.../model/entity/Seal.java

A entidade Seal não possuía os campos seal_type (enum SealTier) nem evt_level. O ADR-016 exige que cada selo registre o tier correspondente ao EVT Level do usuário no momento da emissão. A tabela seals na migration V13 também não possui essas colunas, criando inconsistência Java ↔ banco.

**Impacto:** impossível distinguir qual tier o selo representa. Frontend e clientes B2B não conseguem exibir o distintivo correto.

## C2 — Tabela user_seals ausente | ✅ IMPLEMENTADO (2026-05-04)

**Arquivo:** Migration V62 + UserSeal.java (implementados em 2026-05-04)

Não existe tabela user_seals nem entidade Java correspondente. O ADR-016 define que cada usuário possui um registro por tier conquistado, com campos: user_id, seal_tier, evt_level, premium_required, grace_period_expires_at (15 dias de carência), acquired_at, is_active.

**Impacto:** impossível rastrear quais usuários possuem selos, em qual tier, desde quando e se estão no período de carência. Upsell para usuários Free também fica inviável.

## C3 — Gatilho de emissão de selos de usuário incorreto | ✅ IMPLEMENTADO (2026-05-04)

**Arquivo:** services/seal/.../consumer/ReputationLevelChangedConsumer.java (criado)

O ConsensusUpdatedConsumer cria selos sempre que consenso > 50%, sem verificar EVT Level do usuário nem plano Premium. Além disso, createdBy = UUID.randomUUID() é um placeholder sem significado.

**Fluxo correto conforme ADR-016:**
* ReputationService detecta mudança de EVT Level (ex.: score passou de 99 → 100, level 0→1)
* ReputationProducer emite ipysy.reputation.level_changed com userId, newLevel, previousLevel
* seal-service consome o evento e verifica via entitlement-service se o usuário é Premium
* Se Premium e newLevel ≥ 1: emite selo do tier correspondente e registra em user_seals

**Nota:** o ConsensusUpdatedConsumer pode permanecer para selos de consenso de evento — são conceitos distintos.

## C4 — Sem validação de entitlement Premium | ✅ IMPLEMENTADO (2026-05-04)

**Arquivos:** SealService.java, EntitlementClient.java

Nenhuma parte do fluxo de criação de selos verifica se o usuário possui plano Premium. A política CAN_VIEW_REPUTATION_SEAL está corretamente definida na V44, mas nunca é consultada.

**Impacto:** usuários Free recebem selos de reputação, violando a regra central do ADR-006 e do ADR-016. Afeta diretamente o modelo de monetização Premium.

## P1 — SealHash não é hash criptográfico | ✅ IMPLEMENTADO (2026-05-04)

**Arquivo:** ConsensusUpdatedConsumer.java

sealHash = "seal_" + eventId + "_" + System.currentTimeMillis() é previsível e não garante integridade. Solução: SHA-256 de (eventId + consensusMetricId + sealedAt.toEpochMilli()) via MessageDigest nativo Java.

## P2 — EventSeal e SealAudit usam Long em vez de UUID | ✅ IMPLEMENTADO (2026-05-04)

**Arquivos:** EventSeal.java, SealAudit.java

Ambas as entidades Java usam \@GeneratedValue(IDENTITY) com Long id, enquanto a migration V13 criou as tabelas com UUID PRIMARY KEY DEFAULT gen_random_uuid(). Isso causará ClassCastException em runtime.

## P3 — Kafka topic ipysy.reputation.level_changed ausente | ✅ IMPLEMENTADO (2026-05-04)

**Arquivo:** ReputationProducer.java, application.properties do reputation-service

O ReputationProducer publica apenas ipysy.reputation.updated. Não há emissão de evento específico quando o EVT Level muda — que é o gatilho correto para o sistema de selos de usuário.

## P4 — Campo envelopeId ambíguo em ConsensusUpdatedMessage | ✅ ACEITO (sem ação)

**Arquivo:** ConsensusUpdatedMessage.java (seal-service)

O campo envelopeId mapeado como \@JsonProperty("event_id") é semanticamente confuso. Se o tópico upstream publicar o campo como "event_id", o consumer poderá usar o ID do envelope Kafka em vez do ID do evento de predição real.

# 5. Plano de Correção e Implementação

Os 8 passos abaixo devem ser executados em ordem. Os passos 1--5 são críticos e tratam dos bloqueadores funcionais. Os passos 6--8 são complementares e podem ser integrados no mesmo PR ou no seguinte.

## Passo 1 — Criar enum SealTier

Arquivo a criar: services/seal/.../model/enums/SealTier.java

```sql
public enum SealTier {
    NONE(0), WHITE(1), BRONZE(2), SILVER(3), GOLD(4), DIAMOND(5);
    
    private final int evtLevel;
    SealTier(int evtLevel) { this.evtLevel = evtLevel; }
    public int getEvtLevel() { return evtLevel; }
    
    public static SealTier fromEvtLevel(int level) {
        for (SealTier t : values())
            if (t.evtLevel == level) return t;
        return NONE;
    }
}
```

## Passo 2 — Atualizar Seal.java com campos de tier

Adicionar na entidade existente, mantendo todos os campos atuais:

```java
@Enumerated(EnumType.STRING)
@Column(name = "seal_type", nullable = false, length = 20)
@Builder.Default
private SealTier sealType = SealTier.NONE;

@Column(name = "evt_level", nullable = false)
@Builder.Default
private Integer evtLevel = 0;
```

## Passo 3 — Criar entidade UserSeal.java

Arquivo a criar: services/seal/.../model/entity/UserSeal.java

```java
@Entity
@Table(name = "user_seals", indexes = {
    @Index(name = "idx_user_seals_user_id", columnList = "user_id"),
    @Index(name = "idx_user_seals_tier",    columnList = "seal_tier")
})
public class UserSeal extends PanacheEntityBase {

    @Id @Column(columnDefinition = "UUID") @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(name = "user_id", nullable = false, columnDefinition = "UUID")
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "seal_tier", nullable = false, length = 20)
    private SealTier sealTier;

    @Column(name = "evt_level", nullable = false)
    private Integer evtLevel;

    @Column(name = "premium_required", nullable = false) @Builder.Default
    private Boolean premiumRequired = true;

    // Grace period: 15 dias após downgrade de plano
    @Column(name = "grace_period_expires_at")
    private Instant gracePeriodExpiresAt;

    @Column(name = "acquired_at", nullable = false) @Builder.Default
    private Instant acquiredAt = Instant.now();

    @Column(name = "is_active", nullable = false) @Builder.Default
    private Boolean isActive = true;
}
```

## Passo 4 — Criar Migration V59

**Arquivo:** config/db/migration/V59__ADR016_User_Seals_And_Seal_Type.sql

```sql
-- Adicionar colunas de tier à tabela seals existente
ALTER TABLE seals ADD COLUMN IF NOT EXISTS seal_type  VARCHAR(20) NOT NULL DEFAULT 'NONE';
ALTER TABLE seals ADD COLUMN IF NOT EXISTS evt_level  INT         NOT NULL DEFAULT 0;

-- Criar tabela de selos de usuário (ADR-016)
CREATE TABLE IF NOT EXISTS user_seals (
    id                      UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id                 UUID        NOT NULL,
    seal_tier               VARCHAR(20) NOT NULL,
    evt_level               INT         NOT NULL,
    premium_required        BOOLEAN     NOT NULL DEFAULT TRUE,
    grace_period_expires_at TIMESTAMP,
    acquired_at             TIMESTAMP   NOT NULL DEFAULT NOW(),
    is_active               BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_user_seals PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_seals_user_tier ON user_seals (user_id, seal_tier);
CREATE INDEX        IF NOT EXISTS idx_user_seals_user_id   ON user_seals (user_id);
```

## Passo 5 — Adicionar emissão de level_changed no reputation-service

**Arquivos:** ReputationProducer.java, ReputationService.java, application.properties do reputation-service

### 5.1 — Novo domínio ReputationLevelChangedMessage:

```java
@Data @Builder @NoArgsConstructor @AllArgsConstructor @RegisterForReflection
public class ReputationLevelChangedMessage {
    @JsonProperty("user_id")        private UUID userId;
    @JsonProperty("previous_level") private Integer previousLevel;
    @JsonProperty("new_level")      private Integer newLevel;
    @JsonProperty("new_score")      private BigDecimal newScore;
    @JsonProperty("changed_at")     private Instant changedAt;
}
```

### 5.2 — Detecção e emissão no ReputationService, após recalculateEVTLevel():

```java
int previousEvtLevel = reputation.getEvtLevel();
// ... atualização de score ...
reputation.recalculateEVTLevel();

if (reputation.getEvtLevel() > previousEvtLevel) {
    reputationProducer.publishLevelChanged(
        userId, previousEvtLevel, reputation.getEvtLevel(), newScore
    );
}
```

### 5.3 — Adicionar no application.properties do reputation-service:

```properties
mp.messaging.outgoing.reputation-level-changed-out.connector=smallrye-kafka
mp.messaging.outgoing.reputation-level-changed-out.topic=ipysy.reputation.level_changed
mp.messaging.outgoing.reputation-level-changed-out.value.serializer=\
    io.quarkus.kafka.client.serialization.ObjectMapperSerializer
```

## Passo 6 — Criar ReputationLevelChangedConsumer no seal-service

**Arquivo a criar:** services/seal/.../consumer/ReputationLevelChangedConsumer.java

```java
@ApplicationScoped
public class ReputationLevelChangedConsumer {

    @Inject SealService sealService;
    @Inject EntitlementClient entitlementClient;

    @Retry(maxRetries = 3, delay = 1000, jitter = 200)
    @Incoming("reputation-level-changed")
    public void consume(ReputationLevelChangedMessage message) {

        if (message == null || message.getNewLevel() == null || message.getNewLevel() < 1)
            return;

        // Verificar entitlement Premium
        boolean isPremium = entitlementClient
            .checkAction(message.getUserId(), "CAN_VIEW_REPUTATION_SEAL");
        if (!isPremium) return;

        SealTier tier = SealTier.fromEvtLevel(message.getNewLevel());
        sealService.emitUserSeal(message.getUserId(), tier, message.getNewLevel());
    }
}
```

## Passo 7 — Adicionar emitUserSeal() no SealService

Adicionar na SealService.java existente:

```java
@Inject UserSealRepository userSealRepository;

@Transactional
public void emitUserSeal(UUID userId, SealTier tier, int evtLevel) {

    // Idempotência: não emite se já existe
    if (userSealRepository.existsByUserIdAndSealTier(userId, tier)) return;
    
    UserSeal userSeal = UserSeal.builder()
        .userId(userId).sealTier(tier).evtLevel(evtLevel)
        .premiumRequired(true).isActive(true).build();
    userSealRepository.persist(userSeal);
}

public List<UserSeal> getUserSeals(UUID userId) {
    return userSealRepository.findByUserId(userId);
}
```

## Passo 8 — Correções complementares

### 8.1 — SealHash criptográfico (ConsensusUpdatedConsumer)

```java
private String generateSealHash(ConsensusUpdatedMessage message) {
    try {
        String raw = message.getEventId() + message.getConsensusMetricId().toString()
                   + Instant.now().toEpochMilli();
        MessageDigest digest = MessageDigest.getInstance("SHA-256");

        byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));

        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        return sb.toString();
    } catch (Exception e) { throw new RuntimeException("Erro ao gerar seal hash", e); }
}
```

### 8.2 — EventSeal e SealAudit: Long → UUID

```java
// REMOVER:
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

// SUBSTITUIR POR:
@Column(name = "id", columnDefinition = "UUID") @Builder.Default
private UUID id = UUID.randomUUID();

// Em SealAudit: também alterar eventSealId de Long para UUID
@Column(name = "event_seal_id", nullable = false, columnDefinition = "UUID")
private UUID eventSealId;
```

### 8.3 — Endpoints de UserSeal no SealResource

```java
@GET @Path("/user/{userId}") @RunOnVirtualThread
public Response getUserSeals(@PathParam("userId") UUID userId) {
    return Response.ok(sealService.getUserSeals(userId)).build();
}

@GET @Path("/user/{userId}/upsell") @RunOnVirtualThread
public Response getUserSealUpsell(@PathParam("userId") UUID userId) {
    return Response.ok(sealService.getUpsellInfo(userId)).build();
}
```

# 6. Checklist de Execução

| **#** | **Entregável**                                                               | **Tipo**  | **Prioridade** |
| ----- | ---------------------------------------------------------------------------- | --------- | -------------- |
| 1     | Criar SealTier.java (enum 6 valores + fromEvtLevel)                          | Criar     | **CRÍTICO**    |
| 2     | Atualizar Seal.java — adicionar sealType + evtLevel                          | Modificar | **CRÍTICO**    |
| 3     | Criar UserSeal.java (entidade user_seals)                                    | Criar     | **CRÍTICO**    |
| 4     | Criar UserSealRepository.java                                                | Criar     | **CRÍTICO**    |
| 5     | Criar V59__ADR016_User_Seals_And_Seal_Type.sql                               | Criar     | **CRÍTICO**    |
| 6     | Criar ReputationLevelChangedMessage.java (reputation-service)                | Criar     | **CRÍTICO**    |
| 7     | Atualizar ReputationProducer — publishLevelChanged()                         | Modificar | **CRÍTICO**    |
| 8     | Atualizar ReputationService — detectar mudança de nível                      | Modificar | **CRÍTICO**    |
| 9     | Criar ReputationLevelChangedDeserializer.java (seal-service)                 | Criar     | **CRÍTICO**    |
| 10    | Criar ReputationLevelChangedConsumer.java (seal-service)                     | Criar     | **CRÍTICO**    |
| 11    | Adicionar emitUserSeal() + getUserSeals() no SealService                     | Modificar | **CRÍTICO**    |
| 12    | Adicionar endpoints /user/{userId} e /upsell no SealResource                 | Modificar | **CRÍTICO**    |
| 13    | Atualizar application.properties dos dois serviços (novos tópicos Kafka)     | Modificar | **CRÍTICO**    |
| 14    | Corrigir generateSealHash() — SHA-256 criptográfico                          | Modificar | COMPLEMENT.    |
| 15    | Corrigir EventSeal.java — Long → UUID                                        | Modificar | COMPLEMENT.    |
| 16    | Corrigir SealAudit.java — Long → UUID (id e eventSealId)                     | Modificar | COMPLEMENT.    |
| 17    | Testes: shouldNotEmitSealForFreeUser, shouldEmitSealOnLevelUp                | Criar     | COMPLEMENT.    |
| 18    | \@RegisterForReflection em SealTier, UserSeal, ReputationLevelChangedMessage | Modificar | COMPLEMENT.    |

# 7. Impacto e Estimativa

## 7.1 Arquivos Afetados por Serviço

| **Serviço**         | **Criar** | **Modificar** | **Principais arquivos**                                                                                                                                                                  |
| ------------------- | --------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| seal-service        | 6         | 4             | SealTier, UserSeal, UserSealRepository, ReputationLevelChangedDeserializer, ReputationLevelChangedConsumer, SealCreatedMessage + Seal, SealService, SealResource, application.properties |
| reputation-service  | 1         | 2             | ReputationLevelChangedMessage + ReputationProducer, ReputationService                                                                                                                    |
| migrations (Flyway) | 1         | 0             | V59__ADR016_User_Seals_And_Seal_Type.sql                                                                                                                                                 |
| **TOTAL**           | **8**     | **6**         | 14 arquivos + 1 migration                                                                                                                                                                |

## 7.2 Estimativa de Desenvolvimento

| **Atividade**                                    | **Estimativa**      | **Responsável**           |
| ------------------------------------------------ | ------------------- | ------------------------- |
| Passos 1--5 (SealTier, UserSeal, Seal.java, V59) | 4h                  | Luiz Guilherme Cruz — CTO |
| Passo 5 (ReputationProducer + ReputationService) | 3h                  | Luiz Guilherme Cruz — CTO |
| Passo 6 (ReputationLevelChangedConsumer)         | 4h                  | Luiz Guilherme Cruz — CTO |
| Passo 7 (SealService + UserSealRepository)       | 3h                  | Luiz Guilherme Cruz — CTO |
| Passo 8 (endpoints + correções complementares)   | 3h                  | Luiz Guilherme Cruz — CTO |
| Testes unitários (itens 17--18)                  | 3h                  | Luiz Guilherme Cruz — CTO |
| **TOTAL**                                        | **~20h (2,5 dias)** | —                         |

## 7.3 Pré-requisitos Antes da Execução

* O entitlement-service deve expor endpoint REST: GET /api/v1/entitlements/{userId}/check?action=CAN_VIEW_REPUTATION_SEAL
* O tópico Kafka ipysy.reputation.level_changed deve ser criado no broker antes do deploy (incluir no script de init ou docker-compose de infraestrutura)
* Migration V58 (Outbox Events) deve estar aplicada — V59 depende de V58
* SEAL_IMAGE no docker-compose deve ser atualizado após build da nova versão do seal-service

## 7.4 Riscos e Mitigações

| **Risco**                                        | **Probabilidade** | **Mitigação**                                                                  |
| ------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------ |
| entitlement-service indisponível na emissão      | Média             | \@Fallback retorna false (não emite) + retry 3×                                |
| Migration V59 quebra seals existentes (NOT NULL) | Baixa             | DEFAULT 'NONE' na coluna — registros existentes recebem NONE sem erro          |
| Duplicação de selos (consumer processa 2×)       | Baixa             | UNIQUE INDEX em (user_id, seal_tier) + verificação existsByUserIdAndSealTier() |

# 8. Fluxo Kafka Pós-Implementação

| **Produtor**                                   | **→** | **Tópico Kafka**                      | **→** | **Consumidor**                                              |
| ---------------------------------------------- | ----- | ------------------------------------- | ----- | ----------------------------------------------------------- |
| reputation-service (cálculo de ΔR)             | →     | ipysy.reputation.updated (existente)  | →     | analytics, notificações                                     |
| reputation-service (NOVO — mudança de nível) | →     | ipysy.reputation.level_changed (NOVO) | →     | seal-service — ReputationLevelChangedConsumer (NOVO)      |
| seal-service (SealProducer — existente)      | →     | ipysy.seals.created (existente)       | →     | notification-service, analytics-service                     |
| consensus-service                              | →     | ipysy.consensus.updated (existente)   | →     | seal-service (ConsensusUpdatedConsumer — selos de evento) |

Tópicos em verde são novos e devem ser criados no broker Kafka antes do deploy.

---

# STATUS DE IMPLEMENTAÇÃO NO BACKEND

| Campo              | Valor                                                                     |
| ------------------ | ------------------------------------------------------------------------- |
| **Status backend** | ✅ IMPLEMENTADO — commit `aec7550` (develop, 2026-05-06)                  |
| **Ticket**         | p2-182 (P0) — ✅ concluído                                                |
| **Estimativa**     | ~20h estimadas → executado em ~2 sessões (2026-05-04 + 2026-05-06)       |
| **Data conclusão** | 2026-05-06                                                                |

**Checklist completo — status final**:

| #   | Atividade                                                                     | Status              | Detalhe                                                               |
| --- | ----------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------- |
| 1   | Enum `SealTier` (NONE→WHITE→BRONZE→SILVER→GOLD→DIAMOND)                       | ✅ done (2026-05-04) | `model/enums/SealTier.java` com `fromEvtLevel()`                      |
| 2   | Entidade `UserSeal.java` + `UserSealRepository`                               | ✅ done (2026-05-04) | `existsByUserIdAndTier()`, `findByUserId()`                           |
| 3   | Alterar `Seal.java` — adicionar `sealType` e `evtLevel`                       | ✅ done (2026-05-06) | Migration V67 + campos com `@Builder.Default`                         |
| 4   | Migration V62 — tabela `user_seals` + índice único                            | ✅ done (2026-05-04) | `idx_user_seals_user_tier UNIQUE (user_id, seal_tier)`                |
| 4b  | Migration V67 — `ALTER TABLE seals` (complementar)                            | ✅ done (2026-05-06) | Colunas `seal_type`/`evt_level` + constraints CHECK                   |
| 5   | `ReputationProducer` — publicar `ipysy.reputation.level_changed`              | ✅ done (2026-05-04) | `publishLevelChanged(userId, prevLevel, newLevel, score)`             |
| 6   | `ReputationLevelChangedConsumer` no seal-service                              | ✅ done (2026-05-04) | Guards: null, userId null, newLevel ≤ 0                               |
| 7   | `SealService.emitUserSeal()` com validação de entitlement                     | ✅ done (2026-05-04) | `@Retry + @CircuitBreaker + @Timeout + @Fallback`                     |
| 8   | Endpoints `GET /v1/seals/me` + `GET /v1/seals/user/{userId}`                  | ✅ done (2026-05-04) | `@RunOnVirtualThread`, `@Audit`                                       |
| 8b  | Endpoint `GET /v1/seals/user/{userId}/upsell`                                 | ✅ done (2026-05-06) | `UserSealUpsellResponse` — currentTier, nextTier, hasMaxTier          |
| 9   | `SealHash` SHA-256 via `MessageDigest`                                        | ✅ done (2026-05-04) | `HexFormat.of().formatHex(digest)` — 64 chars                         |
| 10  | `EventSeal` + `SealAudit` — UUID id (não Long)                                | ✅ done (2026-05-04) | `PanacheEntityBase` com `@Id UUID`                                    |
| 11  | `@RegisterForReflection` em `EventSeal` + `SealAudit`                         | ✅ done (2026-05-06) | Necessário para GraalVM native image                                  |
| 12  | `changedAt: Instant` em `ReputationLevelChangedMessage`                       | ✅ done (2026-05-06) | `@JsonProperty("changed_at")` em ambas as cópias                      |
| P4  | Testes EVT-002 P4: `shouldNotEmitSealForFreeUser` / `shouldEmitSealOnLevelUp` | ✅ done (2026-05-06) | `UserSealEmissionTest` (6) + `ReputationLevelChangedConsumerTest` (5) |

**Resultado de testes**: 34 testes verdes, `mvn test -pl services/seal` → `BUILD SUCCESS`

**Decisão de design registrada**: `SealService.emitUserSeal()` SEMPRE persiste `UserSeal`, mas seta `isActive = isPremium`. Free users: `isActive=false` — selo existe para CTA de upsell, ativo quando usuário assinar Premium. Difere levemente da spec (que dizia "não persistir para free"), mas é mais flexível para ativação retroativa.

---
*IPYSY — Intelligence for Decisions | EVT-002_Analise_Selos v1.2 | Atualizado em 2026-05-06*
