'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth'
import { initOtel, setOtelUserContext } from '@/lib/telemetry/otel'

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
    // Import estático garante que FetchInstrumentation patcha window.fetch
    // imediatamente no mount, eliminando a race condition com submissões rápidas
    initOtel()
  }, [])

  useEffect(() => {
    // Propaga identidade do usuário logado no W3C Baggage (apenas produção)
    if (!user || !traceSessionId) return
    setOtelUserContext(user.id, traceSessionId)
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
