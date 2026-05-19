'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth'

// Preload: inicia o download do chunk OTel imediatamente na avaliação do módulo
// (antes do primeiro render), mas NÃO executa initOtel() ainda.
// A execução ocorre no useEffect — após hidratação React 19, antes de qualquer
// interação do usuário (o browser não pinta antes do useEffect do primeiro mount).
// SSR-safe: typeof window === 'undefined' nunca inicia o preload no servidor.
const otelModulePromise =
  typeof window !== 'undefined' ? import('@/lib/telemetry/otel') : null

const otelLogsModulePromise =
  typeof window !== 'undefined' ? import('@/lib/telemetry/logger') : null

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Dados considerados frescos por 60 segundos
        staleTime: 60 * 1000,
        // Retry automático apenas 1x em produção
        retry: process.env.NODE_ENV === 'production' ? 1 : false,
        // Refetch em foco de janela desabilitado para dados de mercado (uso explícito)
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => getQueryClient())
  const user = useAuthStore((s) => s.user)
  const traceSessionId = useAuthStore((s) => s.traceSessionId)

  useEffect(() => {
    if (otelModulePromise) {
      otelModulePromise
        .then(({ initOtel }) => {
          console.log('[OTel] módulo carregado, chamando initOtel()')
          initOtel()
        })
        .catch((err) => console.error('[OTel] falha ao carregar módulo:', err))
    }
    if (otelLogsModulePromise) {
      otelLogsModulePromise
        .then(({ initOtelLogs }) => initOtelLogs())
        .catch((err) => console.error('[OTel logs] falha ao carregar módulo:', err))
    }
  }, [])

  useEffect(() => {
    // Propaga identidade do usuário logado no W3C Baggage (apenas produção)
    if (!user || !traceSessionId) return
    if (otelModulePromise) {
      otelModulePromise.then(({ setOtelUserContext }) => {
        setOtelUserContext(user.id, traceSessionId)
      })
    }
  }, [user?.id, traceSessionId])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}


