import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-indigo-500/30 mb-4 select-none">404</p>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Página não encontrada</h2>
        <p className="text-gray-400 text-sm mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors inline-block"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}
