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

  setAuth: (accessToken, user) =>
    set({ accessToken, user, isAuthenticated: true }),

  clearAuth: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),

  setHydrated: (isHydrated) => set({ isHydrated }),
}))
