import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Modo standalone: necessário para Docker multi-stage (ADR-017)
  output: 'standalone',

  // Corrige detecção de workspace root (múltiplos lockfiles no monorepo)
  outputFileTracingRoot: __dirname,

  // Desabilitar source maps em produção (ADR-017 — segurança)
  productionBrowserSourceMaps: false,

  // Variáveis de ambiente que devem ser disponíveis em build-time
  env: {
    NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION ?? '0.0.1-dev',
  },

  // Configuração do compilador SWC
  compiler: {
    // Remove console.log em produção (mantém console.error/warn)
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Rewrites para proxy local (desenvolvimento sem backend local)
  // Quando GATEWAY_UPSTREAM está definido, redireciona /api/* para o gateway remoto
  async rewrites() {
    const gatewayUpstream = process.env.GATEWAY_UPSTREAM

    if (!gatewayUpstream) return []

    return [
      {
        source: '/api/backend/:path*',
        destination: `${gatewayUpstream}/:path*`,
      },
    ]
  },

  // Imagens
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ipysy.com',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
