import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/stores/auth'

const mockUser = {
  id: 'user-123',
  name: 'João Silva',
  email: 'joao@example.com',
  roles: ['USER'],
}

describe('useAuthStore — Phantom Token Pattern', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,
    })
  })

  it('deve iniciar sem autenticação', () => {
    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isHydrated).toBe(false)
  })

  it('deve autenticar com setAuth()', () => {
    const { setAuth } = useAuthStore.getState()
    setAuth('uuid-opaque-token', mockUser)

    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('uuid-opaque-token')
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
  })

  it('deve limpar autenticação com clearAuth()', () => {
    const { setAuth, clearAuth } = useAuthStore.getState()
    setAuth('uuid-opaque-token', mockUser)
    clearAuth()

    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('deve marcar como hidratado com setHydrated()', () => {
    const { setHydrated } = useAuthStore.getState()
    setHydrated(true)
    expect(useAuthStore.getState().isHydrated).toBe(true)

    setHydrated(false)
    expect(useAuthStore.getState().isHydrated).toBe(false)
  })

  it('não deve expor token após clearAuth (Phantom Token)', () => {
    const { setAuth, clearAuth } = useAuthStore.getState()
    setAuth('secret-uuid', mockUser)
    clearAuth()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})
