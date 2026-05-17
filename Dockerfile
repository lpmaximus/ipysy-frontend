# ─────────────────────────────────────────────────────────────────────────────
# IPYSY Frontend — Dockerfile multi-stage (Next.js 15 / Node)
# Targets:
#   development  → docker-compose.yml (dev local com hot-reload)
#   production   → docker-compose.prod.yml (imagem otimizada para Hetzner)
# ─────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base

RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

# ─── development ─────────────────────────────────────────────────────────────
FROM base AS development

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
EXPOSE 3000
CMD ["dumb-init", "yarn", "dev"]

# ─── builder ─────────────────────────────────────────────────────────────────
FROM base AS builder

ARG NEXT_PUBLIC_API_URL=https://api.ipysy.com
ARG NEXT_PUBLIC_ENVIRONMENT=production
ARG NEXT_PUBLIC_VERSION=0.1.0

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT}
ENV NEXT_PUBLIC_VERSION=${NEXT_PUBLIC_VERSION}
ENV NODE_ENV=production
# Necessário para Next.js standalone output
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

COPY . .
RUN yarn build

# Gate de segurança (ADR-017): nenhum .map deve existir no output standalone
RUN find .next/standalone -name "*.map" 2>/dev/null | grep -q . && echo "ERRO: source maps encontrados!" && exit 1 || true

# ─── production ──────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS production

RUN apk add --no-cache dumb-init
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone: copia apenas o necessário para rodar
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health | grep -q '"status":"ok"' || exit 1

USER node
CMD ["dumb-init", "node", "server.js"]
