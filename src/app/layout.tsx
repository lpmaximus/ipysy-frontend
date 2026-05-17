import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Providers } from '@/app/providers'
import '@/styles/main.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: '700',
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'IPYSY — Plataforma de Previsão de Mercado',
    template: '%s | IPYSY',
  },
  description:
    'Preveja tendências de mercado com inteligência artificial. IPYSY combina análise quantitativa, machine learning e dados em tempo real para insights acionáveis.',
  keywords: ['previsão de mercado', 'inteligência artificial', 'finanças', 'análise quantitativa'],
  authors: [{ name: 'L2Tech' }],
  creator: 'L2Tech',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://ipysy.com',
    siteName: 'IPYSY',
    title: 'IPYSY — Plataforma de Previsão de Mercado',
    description:
      'Preveja tendências de mercado com inteligência artificial.',
  },
  robots: {
    index: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
    follow: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-gray-950 text-gray-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
