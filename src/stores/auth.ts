import { create } from 'zustand'

/**
 * Phantom Token Pattern (ADR-006)
 *
 * - Access token armazenado APENAS em memória (nunca em localStorage ou cookie)
 * - Refresh token gerenciado via httpOnly cookie pelo Gateway (transparente ao frontend)
 * - Frontend NUNCA decodifica o access token
 * - Em SSR (Server Components / Route Handlers), o refresh silencioso popula este store
 */

export interface User {
  id: string
  name: string
  email: string
  roles: string[]
}

interface AuthState {
  // Token em memória — perde ao refresh da página (intencional — Phantom Token)
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  isHydrated: boolean

  /**
   * UUID único por sessão de login — distingue 2 browsers do mesmo usuário no OTel.
   * Gerado via crypto.randomUUID() a cada setAuth() — nunca persistido.
   * Propagado no W3C Baggage para rastreabilidade end-to-end no SigNoz.
   */
  traceSessionId: string | null

  // Actions
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  setHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  traceSessionId: null,

  setAuth: (accessToken, user) =>
    set({
      accessToken,
      user,
      isAuthenticated: true,
      // UUID único por login — mesmo usuário em 2 browsers terá traceSessionIds distintos
      traceSessionId: typeof crypto !== 'undefined' ? crypto.randomUUID() : null,
    }),

  clearAuth: () =>
    set({ accessToken: null, user: null, isAuthenticated: false, traceSessionId: null }),

  setHydrated: (isHydrated) => set({ isHydrated }),
}))
