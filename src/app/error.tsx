'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Loga o erro em serviço de monitoramento (ex: OpenTelemetry)
    console.error('[IPYSY Error Boundary]', error)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Algo deu errado</h2>
        <p className="text-gray-400 text-sm mb-6">
          Ocorreu um erro inesperado. Nossa equipe foi notificada.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-600 font-mono mb-6">
            ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          Tentar novamente
        </button>
      </motion.div>
    </main>
  )
}
