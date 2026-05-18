# Observabilidade — IPYSY Frontend

## Visão Geral

O IPYSY usa **OpenTelemetry (OTel)** end-to-end para rastreabilidade distribuída entre frontend e backend. Os traces são coletados pelo **SigNoz** (stack: ClickHouse + otel-collector + query-service).

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLUXO DE TRACES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Browser (React)                                                           │
│   ├── OTel SDK Web                                                          │
│   │   ├── FetchInstrumentation: injeta traceparent em toda requisição       │
│   │   └── BatchSpanProcessor → POST /api/telemetry/traces (same-origin)    │
│   │                                                                         │
│   └── fetch('/api/waitlist', { ... })                                       │
│       └── Header: traceparent: 00-{traceId}-{spanId}-01                    │
│                                                                             │
│   Next.js BFF (Route Handlers)                                              │
│   ├── /api/telemetry/traces → forward → otel-collector:4318/v1/traces      │
│   └── /api/* → apiClient.ts → Java Gateway                                 │
│       └── FORWARDED_HEADERS inclui: traceparent, tracestate, baggage       │
│                                                                             │
│   Java Gateway (Quarkus + OTel)                                             │
│   ├── Recebe traceparent → continua o trace no mesmo traceId               │
│   └── Exporta spans via gRPC → otel-collector:4317 → SigNoz               │
│                                                                             │
│   SigNoz                                                                    │
│   ├── otel-collector:4317 (gRPC — backend Java)                            │
│   ├── otel-collector:4318 (HTTP — browser via proxy BFF)                   │
│   └── UI em porta 3301 (acesso via SSH tunnel)                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Componentes

### 1. OTel SDK Web (`src/lib/telemetry/otel.ts`)

Inicialização browser-side do OpenTelemetry:

- **Ativo apenas em produção**: `NEXT_PUBLIC_ENVIRONMENT === 'production'`
- **Propagador**: W3C TraceContext + W3C Baggage
- **Exportador**: OTLP HTTP → `/api/telemetry/traces` (proxy BFF)
- **Instrumentações ativas**:
  - `fetch`: injeta `traceparent` automaticamente em cada requisição HTTP
  - `document-load`: spans de carregamento de página

```typescript
// Chamado pelo Providers (useEffect — browser only)
import('@/lib/telemetry/otel').then(({ initOtel }) => initOtel())
```

### 2. Proxy OTLP (`src/app/api/telemetry/traces/route.ts`)

Route Handler BFF que faz bridge entre browser e otel-collector interno:

- Browser não acessa `otel-collector:4318` diretamente (rede Docker interna)
- Same-origin (`/api/telemetry/traces`) elimina problemas de CORS
- Controlado por `OTEL_COLLECTOR_HTTP_URL` (vazio = desativado em dev)

### 3. Propagação BFF → Java (`src/lib/http/api-client.ts`)

O `apiClient` propaga automaticamente os headers W3C para o Java Gateway:

```typescript
const FORWARDED_HEADERS = [
  'traceparent',  // W3C Trace Context — liga browser span ao span Java
  'tracestate',   // W3C Trace Context — vendor state
  'baggage',      // W3C Baggage
  // ...outros headers
]
```

Isso garante que o trace do browser e o span Java fiquem no **mesmo traceId** no SigNoz.

### 4. Backend Java (Quarkus OTel)

Configurado em `application-global.properties`:

```properties
quarkus.otel.enabled=true
quarkus.otel.propagators=tracecontext,baggage  # W3C
quarkus.otel.traces.sampler=always_on
quarkus.otel.exporter.otlp.endpoint=http://otel-collector:4317  # gRPC
```

## Variáveis de Ambiente

| Variável | Onde | Descrição |
|----------|------|-----------|
| `OTEL_COLLECTOR_HTTP_URL` | Server-only | URL HTTP do otel-collector para o proxy BFF. Ex: `http://otel-collector:4318`. Vazio = proxy desativado. |
| `OTEL_ENDPOINT` | Server-only | URL gRPC do otel-collector (uso futuro para OTel server-side no Node.js). |
| `OTEL_SERVICE_NAME` | Server-only | Nome do serviço (uso futuro). |
| `NEXT_PUBLIC_ENVIRONMENT` | Build-time | OTel browser só ativa quando `=== 'production'`. |
| `NEXT_PUBLIC_VERSION` | Build-time | Incluído como `service.version` em todos os spans. |

## Acesso ao SigNoz UI

O SigNoz UI corre na porta 3301 dentro da rede Docker interna (não exposta externamente por segurança).

### SSH Tunnel (recomendado)

```bash
# No terminal local — mantém o túnel ativo enquanto a sessão SSH estiver aberta
ssh -L 3301:localhost:3301 user@46.62.230.6

# Em outra sessão, no servidor, verificar o IP do container:
docker inspect signoz-frontend --format '{{.NetworkSettings.Networks.ipysy-net.IPAddress}}'
```

> **Nota**: O tunnel SSH padrão (`localhost:3301`) requer que a porta 3301 esteja exposta no host do servidor. Alternativamente, usar `docker exec` para verificar dados.

### Verificar no ClickHouse diretamente

```bash
# No servidor Hetzner
docker exec -it clickhouse clickhouse-client --query \
  "SELECT TraceId, SpanId, ServiceName, SpanName, StatusCode, Duration \
   FROM signoz_traces.signoz_index_v2 \
   WHERE ServiceName = 'ipysy-frontend' \
   ORDER BY Timestamp DESC LIMIT 10"
```

## Como Verificar o Funcionamento

### 1. Verificar spans do browser

1. Acessar `https://ipysy.com` com o Chrome DevTools aberto
2. Na aba **Network**, filtrar por `/api/telemetry/traces`
3. Verificar que o browser envia POST com status 200
4. Na aba **Network**, verificar que as requisições para `/api/*` têm o header `traceparent`

### 2. Verificar spans no SigNoz

Após o SSH tunnel (`ssh -L 3301:...`), acessar `http://localhost:3301`:

1. **Services** → verificar `ipysy-frontend` na lista
2. **Traces** → filtrar por `service.name = ipysy-frontend`
3. **Trace detail** → verificar se spans do Java estão linkados (mesmo traceId)

### 3. Verificar via ClickHouse

```sql
-- Últimos traces do frontend (últimos 10 minutos)
SELECT
  TraceId,
  SpanId,
  ServiceName,
  SpanName,
  StatusCode,
  formatReadableTimeDelta(Duration / 1e9) AS duration
FROM signoz_traces.signoz_index_v2
WHERE ServiceName IN ('ipysy-frontend', 'ipysy-gateway')
  AND Timestamp > now() - INTERVAL 10 MINUTE
ORDER BY Timestamp DESC
LIMIT 20;

-- Trace end-to-end: verificar se traceId do browser aparece no Java
SELECT DISTINCT TraceId, ServiceName, SpanName
FROM signoz_traces.signoz_index_v2
WHERE TraceId = '<traceId-do-browser>'
ORDER BY ServiceName, SpanName;
```

## Rastreabilidade end-to-end esperada

Quando tudo está funcionando, um único trace no SigNoz mostra:

```
traceId: abc123...
├── ipysy-frontend / HTTP GET /                    (browser, document-load)
├── ipysy-frontend / HTTP POST /api/waitlist       (browser, fetch)
│   ├── ipysy-gateway / POST /v1/users/waitlist   (Java Gateway)
│   └── ipysy-users / save waitlist entry         (Java Users microservice)
└── [browser spans exportados via /api/telemetry/traces → otel-collector:4318]
    [java spans exportados via OTLP gRPC → otel-collector:4317]
```

## Troubleshooting

| Sintoma | Causa | Solução |
|---------|-------|---------|
| Sem serviço `ipysy-frontend` no SigNoz | `NEXT_PUBLIC_ENVIRONMENT` não é `production` em prod | Verificar build-arg no Dockerfile/CI |
| POST `/api/telemetry/traces` com erro 500 | `OTEL_COLLECTOR_HTTP_URL` incorreta | Verificar se otel-collector está no ar |
| Spans sem `traceparent` nas requisições | `FetchInstrumentation` não inicializada | Verificar se `initOtel()` foi chamado |
| traceId do browser não aparece no Java | `traceparent` não está em `FORWARDED_HEADERS` | Já corrigido — verificar deploy |
| SigNoz UI inacessível | Porta 3301 não exposta externamente | Usar SSH tunnel ou ClickHouse diretamente |
