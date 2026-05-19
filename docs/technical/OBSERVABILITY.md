# Observabilidade — IPYSY Frontend

## Visão Geral

O IPYSY usa **OpenTelemetry (OTel)** end-to-end para rastreabilidade distribuída entre frontend e backend. Traces **e logs** são coletados pelo **SigNoz** (stack: ClickHouse + otel-collector + query-service), com correlação automática por `trace_id` + `span_id`.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FLUXO DE TRACES E LOGS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Browser (React)                                                           │
│   ├── OTel Traces SDK (otel.ts)                                             │
│   │   ├── document-load: span de carregamento de página                    │
│   │   ├── fetch: injeta traceparent em toda requisição HTTP                 │
│   │   ├── user-interaction: spans em cliques                                │
│   │   └── SimpleSpanProcessor → POST /api/telemetry/traces (same-origin)   │
│   │                                                                         │
│   ├── OTel Logs SDK (logger.ts)                                             │
│   │   ├── logger.{info,warn,error}: emite logs com trace_id + span_id      │
│   │   ├── patchConsole(): redireciona console.warn/error → logger          │
│   │   └── SimpleLogRecordProcessor → POST /api/telemetry/logs (same-origin)│
│   │                                                                         │
│   └── fetch('/api/waitlist', { ... })                                       │
│       └── Header: traceparent: 00-{traceId}-{spanId}-01                    │
│                                                                             │
│   Next.js BFF (Route Handlers)                                              │
│   ├── /api/telemetry/traces → forward → otel-collector:4318/v1/traces      │
│   ├── /api/telemetry/logs   → forward → otel-collector:4318/v1/logs        │
│   └── /api/* → apiClient.ts → Java Gateway                                 │
│       └── FORWARDED_HEADERS inclui: traceparent, tracestate, baggage       │
│                                                                             │
│   Java Gateway (Quarkus + OTel)                                             │
│   ├── Recebe traceparent → continua o trace no mesmo traceId               │
│   └── Exporta spans via gRPC → otel-collector:4317 → SigNoz               │
│                                                                             │
│   SigNoz                                                                    │
│   ├── otel-collector:4317 (gRPC — backend Java)                            │
│   ├── otel-collector:4318 (HTTP — traces + logs do browser via proxy BFF)  │
│   └── UI em porta 3301 (acesso via SSH tunnel)                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Componentes

### 1. OTel Traces SDK (`src/lib/telemetry/otel.ts`)

Inicialização browser-side do OpenTelemetry Traces:

- **Ativo em produção** (`NEXT_PUBLIC_ENVIRONMENT === 'production'`) **ou dev** (`NEXT_PUBLIC_OTEL_ENABLED === 'true'`)
- **Propagador**: W3C TraceContext + W3C Baggage
- **Exportador**: OTLP HTTP → `/api/telemetry/traces` (proxy BFF)
- **Instrumentações ativas** (via `@opentelemetry/auto-instrumentations-web`):
  - `document-load`: span de carregamento de página
  - `fetch`: monkey-patch em `window.fetch`, injeta `traceparent` para `api.ipysy.com`
  - `user-interaction`: spans em cliques
  - `xhr`: desabilitado (projeto usa `fetch`)

```typescript
// Chamado pelo Providers (useEffect — browser only)
import('@/lib/telemetry/otel').then(({ initOtel }) => initOtel())
```

### 2. OTel Logs SDK (`src/lib/telemetry/logger.ts`)

Logger OTel browser-side com correlação automática de traces:

- **Ativo nas mesmas condições** que o SDK de traces
- Emite logs com `trace_id` e `span_id` do contexto ativo → correlação no SigNoz
- **`patchConsole()`**: redireciona `console.warn` e `console.error` para o OTel logger automaticamente
  - Em produção, `console.log` é removido pelo SWC (`removeConsole`) — apenas `warn`/`error` chegam ao SigNoz
- **Exportador**: OTLP HTTP → `/api/telemetry/logs` (proxy BFF)

```typescript
// Uso direto nos componentes
import { logger } from '@/lib/telemetry/logger'

logger.info('usuário logou', { userId: '123' })
logger.warn('token próximo de expirar')
logger.error('falha na requisição', { status: 500, endpoint: '/api/events' })
```

No SigNoz, abra qualquer trace → aba **"Related Logs"** para ver os logs correlacionados.

### 3. Proxies OTLP BFF

Dois Route Handlers fazem bridge entre browser e otel-collector interno (inacessível pelo browser — rede Docker):

| Rota | Destino | Protocolo |
|------|---------|-----------|
| `/api/telemetry/traces` | `OTEL_COLLECTOR_HTTP_URL/v1/traces` | OTLP HTTP |
| `/api/telemetry/logs`   | `OTEL_COLLECTOR_HTTP_URL/v1/logs`   | OTLP HTTP |

- Same-origin elimina problemas de CORS
- `OTEL_COLLECTOR_HTTP_URL` vazio → descarta silenciosamente (dev sem tunnel)

### 4. Propagação BFF → Java (`src/lib/http/api-client.ts`)

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
| `OTEL_COLLECTOR_HTTP_URL` | Server-only | URL HTTP do otel-collector para os proxies BFF. Ex: `http://otel-collector:4318`. Vazio = proxies desativados (dev sem tunnel). |
| `OTEL_ENDPOINT` | Server-only | URL gRPC do otel-collector (uso futuro para OTel server-side no Node.js). |
| `OTEL_SERVICE_NAME` | Server-only | Nome do serviço (uso futuro). |
| `NEXT_PUBLIC_ENVIRONMENT` | Build-time | OTel browser ativa automaticamente quando `=== 'production'`. |
| `NEXT_PUBLIC_OTEL_ENABLED` | Build-time | Define `true` para ativar OTel em dev/local (ex: `.env.local`). |
| `NEXT_PUBLIC_VERSION` | Build-time | Incluído como `service.version` em todos os spans e logs. |

## Desenvolvimento Local com Observabilidade

Para testar OTel localmente (ver traces e logs no SigNoz do Hetzner), abrir tunnels SSH:

```bash
# Gateway + otel-collector — manter os 3 em sessões separadas
ssh -L 8080:localhost:8080 user@46.62.230.6 -N   # Gateway
ssh -L 4318:otel-collector:4318 user@46.62.230.6 -N  # OTel collector HTTP
ssh -L 3301:localhost:3301 user@46.62.230.6 -N   # SigNoz UI
```

No `.env.local`, garantir:
```env
NEXT_PUBLIC_OTEL_ENABLED=true
OTEL_COLLECTOR_HTTP_URL=http://localhost:4318
```

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

### 1. Verificar spans e logs do browser

1. Acessar `https://ipysy.com` com o Chrome DevTools aberto
2. Na aba **Network**, filtrar por `/api/telemetry/` — verificar POSTs para `/traces` e `/logs` com status 200
3. Verificar que as requisições para `/api/*` têm o header `traceparent`

### 2. Verificar no SigNoz

Após os SSH tunnels, acessar `http://localhost:3301`:

1. **Services** → verificar `ipysy-frontend` na lista
2. **Traces** → filtrar por `service.name = ipysy-frontend`
3. **Trace detail** → aba **"Related Logs"** para ver logs correlacionados
4. **Logs** → filtrar por `service.name = ipysy-frontend`

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

-- Logs correlacionados com um trace
SELECT Timestamp, SeverityText, Body, TraceId, SpanId
FROM signoz_logs.logs
WHERE TraceId = '<traceId-do-browser>'
ORDER BY Timestamp;
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
| Sem serviço `ipysy-frontend` no SigNoz | `NEXT_PUBLIC_ENVIRONMENT` não é `production` e `NEXT_PUBLIC_OTEL_ENABLED` não é `true` | Verificar build-arg no Dockerfile/CI ou `.env.local` |
| POST `/api/telemetry/traces` com erro | `OTEL_COLLECTOR_HTTP_URL` incorreta | Verificar se otel-collector está no ar |
| POST `/api/telemetry/logs` com erro | `OTEL_COLLECTOR_HTTP_URL` incorreta | Mesma causa acima |
| Spans sem `traceparent` nas requisições | `FetchInstrumentation` não inicializada | Verificar se `initOtel()` foi chamado |
| Logs sem `trace_id` no SigNoz | Logger emitido fora de span ativo | Normal para logs emitidos fora de um fetch/click instrumentado |
| traceId do browser não aparece no Java | `traceparent` não está em `FORWARDED_HEADERS` | Já corrigido — verificar deploy |
| SigNoz UI inacessível | Porta 3301 não exposta externamente | Usar SSH tunnel ou ClickHouse diretamente |
| `console.log` aparece em produção | SWC `removeConsole` não ativo | Verificar `next.config.ts` — `NODE_ENV=production` no build |
