import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Isola a classe HttpClient sem usar o singleton (que tem middleware device-info)
// para testar a lógica de pipeline de forma pura.

type RequestContext = { url: string; init: RequestInit }
type NextFn = () => Promise<Response>
type HttpMiddleware = (ctx: RequestContext, next: NextFn) => Promise<Response>

class HttpClient {
  private readonly middlewares: HttpMiddleware[] = []

  use(middleware: HttpMiddleware): this {
    this.middlewares.push(middleware)
    return this
  }

  async fetch(url: string, init: RequestInit = {}): Promise<Response> {
    const ctx: RequestContext = { url, init: { ...init } }
    const execute = (index: number): Promise<Response> => {
      if (index < this.middlewares.length) {
        return this.middlewares[index](ctx, () => execute(index + 1))
      }
      return globalThis.fetch(ctx.url, ctx.init)
    }
    return execute(0)
  }
}

describe('HttpClient — pipeline de middlewares', () => {
  let client: HttpClient
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    client = new HttpClient()
    fetchMock = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('deve executar fetch sem middlewares', async () => {
    const res = await client.fetch('/api/test')
    expect(fetchMock).toHaveBeenCalledWith('/api/test', {})
    expect(res.status).toBe(200)
  })

  it('deve executar middlewares na ordem de registro', async () => {
    const order: number[] = []

    client.use(async (ctx, next) => { order.push(1); return next() })
    client.use(async (ctx, next) => { order.push(2); return next() })
    client.use(async (ctx, next) => { order.push(3); return next() })

    await client.fetch('/api/test')
    expect(order).toEqual([1, 2, 3])
  })

  it('deve permitir que middleware injete headers', async () => {
    client.use(async (ctx, next) => {
      ctx.init.headers = { ...ctx.init.headers as Record<string, string>, 'x-custom': 'valor' }
      return next()
    })

    await client.fetch('/api/test')
    expect(fetchMock).toHaveBeenCalledWith('/api/test', {
      headers: { 'x-custom': 'valor' },
    })
  })

  it('deve permitir que middleware modifique a URL', async () => {
    client.use(async (ctx, next) => {
      ctx.url = ctx.url + '?v=1'
      return next()
    })

    await client.fetch('/api/test')
    expect(fetchMock).toHaveBeenCalledWith('/api/test?v=1', {})
  })

  it('deve permitir que middleware curto-circuite sem chamar next()', async () => {
    const shortCircuit = new Response('Short circuit', { status: 403 })

    client.use(async (_ctx, _next) => shortCircuit)
    client.use(async (_ctx, next) => next()) // não deve ser chamado

    const res = await client.fetch('/api/test')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(res.status).toBe(403)
  })

  it('deve suportar encadeamento de use()', () => {
    const result = client.use(async (_ctx, next) => next()).use(async (_ctx, next) => next())
    expect(result).toBe(client)
  })

  it('deve isolar init entre chamadas (não compartilhar referência)', async () => {
    const capturedInits: RequestInit[] = []

    client.use(async (ctx, next) => {
      capturedInits.push(ctx.init)
      return next()
    })

    await client.fetch('/api/test', { method: 'POST' })
    await client.fetch('/api/test', { method: 'GET' })

    expect(capturedInits[0]).not.toBe(capturedInits[1])
    expect(capturedInits[0].method).toBe('POST')
    expect(capturedInits[1].method).toBe('GET')
  })
})
