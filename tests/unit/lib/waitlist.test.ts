import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { registerWaitlist } from '@/lib/api/waitlist'

// Mock do httpClient para isolar o teste de rede
vi.mock('@/lib/http/http-client', () => ({
  httpClient: {
    fetch: vi.fn(),
  },
}))

import { httpClient } from '@/lib/http/http-client'
const mockFetch = vi.mocked(httpClient.fetch)

describe('registerWaitlist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deve retornar success em 201 (novo cadastro)', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Cadastrado com sucesso!' }), { status: 201 })
    )

    const result = await registerWaitlist('novo@example.com')
    expect(result.status).toBe('success')
    expect(result.message).toBe('Cadastrado com sucesso!')
  })

  it('deve usar mensagem padrão em 201 sem message no body', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 201 })
    )

    const result = await registerWaitlist('novo@example.com')
    expect(result.status).toBe('success')
    expect(result.message).toContain('primeiros')
  })

  it('deve retornar already_registered em 200 com already_registered=true', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ already_registered: true, message: 'Você já está na lista!' }),
        { status: 200 }
      )
    )

    const result = await registerWaitlist('existente@example.com')
    expect(result.status).toBe('already_registered')
    expect(result.message).toBe('Você já está na lista!')
  })

  it('deve retornar error em 400 com violations', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ violations: [{ message: 'E-mail inválido' }] }),
        { status: 400 }
      )
    )

    const result = await registerWaitlist('invalido')
    expect(result.status).toBe('error')
    expect(result.message).toBe('E-mail inválido')
  })

  it('deve retornar error em 422 (EmailValidation — domínio descartável)', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: 'Domínio descartável não permitido', rejectedBy: 'DISPOSABLE_DOMAIN' }),
        { status: 422 }
      )
    )

    const result = await registerWaitlist('teste@tempmail.com')
    expect(result.status).toBe('error')
    expect(result.message).toContain('descartável')
  })

  it('deve retornar error em 500 com mensagem genérica', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 500 })
    )

    const result = await registerWaitlist('teste@example.com')
    expect(result.status).toBe('error')
    expect(result.message).toContain('Erro ao processar')
  })

  it('deve enviar o email no body como JSON', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 201 })
    )

    await registerWaitlist('teste@example.com')

    expect(mockFetch).toHaveBeenCalledWith('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teste@example.com' }),
    })
  })
})
