/**
 * Endpoints centralizados do API Gateway (https://api.ipysy.com).
 *
 * Organizado por microserviço. Rotas com parâmetros dinâmicos
 * são funções que recebem o ID e retornam a string final.
 *
 * Uso:
 *   import { API } from '@/lib/api/endpoints'
 *
 *   apiClient.fetch(API.users.waitlist, { method: 'POST', ... })
 *   apiClient.fetch(API.events.detail(eventId))
 */

const BASE          = '/api/v1'

// Prefixos privados de cada microserviço — alterar aqui reflete em todos os endpoints
const SECURITY      = `${BASE}/security`
const PROFILES      = `${BASE}/profiles`
const USERS         = `${BASE}/users`
const EVENTS        = `${BASE}/events`
const NOTIFICATIONS = `/ws/v1/notifications`
const REPUTATION    = `${BASE}/reputation`
const CONSENSUS     = `${BASE}/consensus`
const PREDICTIONS   = `${BASE}/predictions`
const COMMENTS      = `${BASE}/comments`
const VOTING        = `${BASE}/votes`
const ENTITLEMENT   = `${BASE}/entitlements`
const GOVERNANCE    = `${BASE}/governance`
const ANALYTICS     = `${BASE}/analytics`
const SEALS         = `${BASE}/seals`
const CONTRACTS     = `${BASE}/contracts`
const NEWS          = `${BASE}/news`
const DASHBOARD     = `${BASE}/dashboard`
const ADMIN         = `${BASE}/admin`

export const API = {

  // ─── Security (9001) — Auth, signup, OAuth, KYC, TOTP ─────────────────────
  security: {
    login:               `${SECURITY}/auth/login`,
    signup:              `${SECURITY}/auth/signup`,
    verifyEmail:         `${SECURITY}/auth/verify-email`,
    verifyPhone:         `${SECURITY}/auth/verify-phone`,
    oauthGoogle:         `${SECURITY}/auth/oauth/google`,
    passwordResetReq:    `${SECURITY}/auth/password/reset-request`,
    passwordReset:       `${SECURITY}/auth/password/reset`,
    checkDuplicate:      `${SECURITY}/auth/check-duplicate`,
    totpSetup:           (userId: string) => `${SECURITY}/totp/${userId}/setup`,
    totpQr:              (userId: string) => `${SECURITY}/totp/${userId}/qr`,
  },

  // ─── Profile (9002) — Dados de perfil, KYC ────────────────────────────────
  profile: {
    update:              `${PROFILES}`,
    get:                 (id: string)     => `${PROFILES}/${id}`,
    kycSubmit:           `${PROFILES}/kyc/submit`,
  },

  // ─── User (9003) — Identidade, privacidade, LGPD ──────────────────────────
  users: {
    waitlist:            `${USERS}/waitlist`,
    delete:              (id: string)     => `${USERS}/${id}`,
    privacy:             (id: string)     => `${USERS}/${id}/privacy`,
  },

  // ─── Event (9004) — Criação e gestão de eventos ───────────────────────────
  events: {
    list:                `${EVENTS}`,
    create:              `${EVENTS}`,
    featured:            `${EVENTS}/featured`,
    trending:            `${EVENTS}/trending`,
    feed:                `${EVENTS}/feed`,
    recommended:         `${EVENTS}/recommended`,
    myStats:             `${EVENTS}/my/stats`,
    detail:              (id: string)     => `${EVENTS}/${id}`,
    update:              (id: string)     => `${EVENTS}/${id}`,
    delete:              (id: string)     => `${EVENTS}/${id}`,
    follow:              (id: string)     => `${EVENTS}/${id}/follow`,
    approve:             (id: string)     => `${EVENTS}/${id}/approve`,
    reject:              (id: string)     => `${EVENTS}/${id}/reject`,
  },

  // ─── Notification (9006) — Notificações + WebSocket push ──────────────────
  notifications: {
    // WebSocket — conectado diretamente no cliente, não via apiClient
    // wss://api.ipysy.com/ws/v1/notifications/{userId}?token=<uuid>
    ws:                  (userId: string) => `${NOTIFICATIONS}/${userId}`,
  },

  // ─── Reputation (9007) — ΔR, ranking, percentil ───────────────────────────
  reputation: {
    ranking:             `${REPUTATION}/ranking`,
    myRank:              `${REPUTATION}/me/rank`,
    myHistory:           `${REPUTATION}/me/history`,
    myPercentile:        `${REPUTATION}/me/ranking/percentile`,
  },

  // ─── Consensus (9008) — IGCI, consenso multiclasse ────────────────────────
  consensus: {
    byEvent:             (eventId: string) => `${CONSENSUS}/events/${eventId}`,
  },

  // ─── Prediction (9009) — Submissão de previsões, Brier Score ──────────────
  predictions: {
    submit:              `${PREDICTIONS}`,
    myCalibration:       `${PREDICTIONS}/me/calibration`,
    myMurphy:            `${PREDICTIONS}/me/murphy`,
    mySharpness:         `${PREDICTIONS}/me/sharpness`,
    myBrierHistory:      `${PREDICTIONS}/me/brier-score/history`,
  },

  // ─── Comment (9011) — Comentários ─────────────────────────────────────────
  comments: {
    byEvent:             (eventId: string) => `${COMMENTS}/events/${eventId}`,
    create:              `${COMMENTS}`,
    like:                (commentId: string) => `${COMMENTS}/${commentId}/like`,
  },

  // ─── Voting (9012) — Votos em outcomes ────────────────────────────────────
  voting: {
    countByEvent:        (eventId: string) => `${VOTING}/events/${eventId}/count`,
  },

  // ─── Entitlement (9013) — Planos, pricing, Stripe ─────────────────────────
  entitlement: {
    plans:               `${ENTITLEMENT}/plans`,
    myPlan:              `${ENTITLEMENT}/me`,
  },

  // ─── Governance (9014) — Teams e permissões Business ──────────────────────
  governance: {
    teams:               `${GOVERNANCE}/teams`,
    createTeam:          `${GOVERNANCE}/teams`,
  },

  // ─── Analytics (9015) — KPIs, métricas admin ──────────────────────────────
  analytics: {
    org:                 `${ANALYTICS}/org`,
    platform:            `${ANALYTICS}/platform/stats`,
    adminKpis:           `${ANALYTICS}/admin/kpis`,
    adminDlq:            `${ANALYTICS}/admin/dlq`,
    adminSystem:         `${ANALYTICS}/admin/system`,
  },

  // ─── Seal (9016) — Selos de reputação (NONE → DIAMOND) ────────────────────
  seals: {
    mine:                `${SEALS}/me`,
    upsell:              `${SEALS}/me/upsell`,
  },

  // ─── Contract (9017) — API Keys B2B, contratos ────────────────────────────
  contracts: {
    mine:                `${CONTRACTS}/me`,
    apiKeys:             `${CONTRACTS}/me/api-keys`,
    deleteApiKey:        (id: string)     => `${CONTRACTS}/me/api-keys/${id}`,
  },

  // ─── News (9018) — Context Service (NCS) ──────────────────────────────────
  news: {
    ticker:              `${NEWS}/ticker`,
    recent:              `${NEWS}/recent`,
    courses:             `${NEWS}?type=COURSE`,
    glossary:            `${NEWS}?type=GLOSSARY`,
    academic:            `${NEWS}?type=ACADEMIC`,
  },

  // ─── Dashboard (agregado pelo Gateway) ────────────────────────────────────
  dashboard: {
    free:                `${DASHBOARD}/free`,
    premium:             `${DASHBOARD}/premium`,
  },

  // ─── Admin (rota interna do Gateway) ──────────────────────────────────────
  admin: {
    kycPending:          `${ADMIN}/kyc/pending`,
    kycApprove:          `${ADMIN}/kyc/approve`,
    kycReject:           `${ADMIN}/kyc/reject`,
  },

} as const
