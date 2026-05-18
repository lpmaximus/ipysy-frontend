'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { registerWaitlist, type WaitlistStatus } from '@/lib/api'

// ─── Conteúdo rotativo ────────────────────────────────────────────────────────

interface Content {
  title: React.ReactNode
  desc: React.ReactNode
}

const CONTENTS: Content[] = [
  {
    title: (
      <>
        Sua experiência agora{' '}
        <em className="font-normal italic text-gold">tem valor mensurável.</em>
      </>
    ),
    desc: (
      <>
        O IPYSY é o novo padrão para quem valoriza a{' '}
        <strong className="text-white font-semibold">clareza analítica</strong>. Uma estrutura
        desenhada para validar o conhecimento e premiar a{' '}
        <strong className="text-white font-semibold">reputação construída com rigor</strong>.
      </>
    ),
  },
  {
    title: (
      <>
        Transforme sua previsão{' '}
        <em className="font-normal italic text-gold">em sinal coletivo.</em>
      </>
    ),
    desc: (
      <>
        Diferente de redes sociais, aqui a sua opinião vira{' '}
        <strong className="text-white font-semibold">probabilidade real</strong>. Participe da
        plataforma que agrega expectativas humanas com{' '}
        <strong className="text-white font-semibold">precisão estatística</strong>.
      </>
    ),
  },
  {
    title: (
      <>
        Onde o conhecimento{' '}
        <em className="font-normal italic text-gold">encontra o rigor.</em>
      </>
    ),
    desc: (
      <>
        Meça, valide e registre seu histórico de acertos. O IPYSY transforma palpites dispersos em
        um <strong className="text-white font-semibold">indicador confiável</strong> sobre o futuro
        da ciência, economia e sociedade.
      </>
    ),
  },
  {
    title: (
      <>
        A inteligência do consenso{' '}
        <em className="font-normal italic text-gold">além do ruído.</em>
      </>
    ),
    desc: (
      <>
        Uma plataforma pública projetada para quem busca{' '}
        <strong className="text-white font-semibold">dados antecedentes</strong>. O valor do IPYSY
        reside na acurácia histórica e na{' '}
        <strong className="text-white font-semibold">qualidade do sinal gerado</strong>.
      </>
    ),
  },
  {
    title: (
      <>
        Sua reputação validada{' '}
        <em className="font-normal italic text-gold">por algoritmos.</em>
      </>
    ),
    desc: (
      <>
        Construa um{' '}
        <strong className="text-white font-semibold">histórico de autoridade</strong> auditável. No
        IPYSY, não há apostas — apenas a busca pela verdade através da{' '}
        <strong className="text-white font-semibold">inteligência preditiva colaborativa</strong>.
      </>
    ),
  },
]

const TRUST_BADGES = ['Rigor Metodológico', 'Privacidade Garantida', 'Inteligência Coletiva']

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ComingSoonPage() {
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    setIndex(Math.floor(Math.random() * CONTENTS.length))
    setMounted(true)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: 0.2 + Math.random() * 0.3,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#9A7B2E'
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2)
        ctx.fill()
        p.y -= p.v
        if (p.y < 0) p.y = canvas.height
      })
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const content = CONTENTS[index]

  return (
    <div className="relative min-h-screen bg-surface text-white flex items-center justify-center overflow-hidden">
      {/* Canvas de fundo */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-20 pointer-events-none"
        aria-hidden="true"
      />

      {/* Conteúdo central */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-16 sm:py-24 text-center">
        {/* Logo / marca */}
        <span className="block text-[0.7rem] font-semibold tracking-[0.75em] text-gold uppercase mb-6">
          IPYSY
        </span>

        {/* Título com troca animada */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={`title-${index}-${mounted}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 min-h-[2.5em]"
          >
            {content.title}
          </motion.h1>
        </AnimatePresence>

        {/* Descrição com troca animada */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`desc-${index}-${mounted}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: 'easeInOut', delay: 0.05 }}
            className="text-base sm:text-lg text-slate-400 font-light leading-relaxed max-w-2xl mx-auto mb-12 min-h-[5rem]"
          >
            {content.desc}
          </motion.p>
        </AnimatePresence>

        {/* CTA — formulário de waitlist */}
        <div className="w-full max-w-lg mx-auto">
          <InputWrapper />
          <p className="mt-5 text-[0.65rem] tracking-[0.2em] uppercase text-gold/80">
            Acesso Exclusivo • 2026
          </p>
        </div>
      </div>

      {/* Trust badges — visíveis apenas em telas médias+ */}
      <div className="absolute bottom-8 hidden md:flex gap-10 opacity-50" aria-hidden="true">
        {TRUST_BADGES.map((badge, i) => (
          <div
            key={badge}
            className={cn(
              'text-[0.7rem] tracking-widest uppercase',
              i > 0 && 'border-l border-gold pl-10'
            )}
          >
            {badge}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Input + Botão ────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function InputWrapper() {
  const [focused, setFocused] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<WaitlistStatus>('idle')
  const [message, setMessage] = useState('')

  const isLocked = status === 'success'
  const isLoading = status === 'loading'
  const isError = status === 'error' || status === 'already_registered'

  const handleSubmit = async () => {
    if (!email.trim() || isLocked || isLoading) return
    if (!EMAIL_REGEX.test(email.trim())) {
      setStatus('error')
      setMessage('E-mail inválido. Verifique o formato e tente novamente.')
      return
    }
    setStatus('loading')
    setMessage('')
    const result = await registerWaitlist(email)
    setStatus(result.status)
    setMessage(result.message)
    if (result.status === 'already_registered') setEmail('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  if (isLocked) {
    return (
      <div className="text-center py-5">
        <p className="text-4xl mb-2">✅</p>
        <p className="text-white font-semibold text-lg mb-1">Solicitação recebida!</p>
        <p className="text-slate-400 text-sm">{message}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Campo + botão: empilhado em mobile, lado a lado em sm+ */}
      <div
        className={cn(
          'flex flex-col sm:flex-row border transition-colors duration-300',
          'bg-white/5',
          isError
            ? 'border-red-400'
            : focused
              ? 'border-gold'
              : 'border-gold/40',
          isLocked && 'opacity-60'
        )}
      >
        <input
          type="email"
          placeholder="E-mail para convite prioritário"
          value={email}
          disabled={isLocked || isLoading}
          onChange={(e) => {
            setEmail(e.target.value)
            if (isError) { setStatus('idle'); setMessage('') }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex-1 bg-transparent border-none outline-none',
            'text-white placeholder:text-slate-500',
            'px-5 py-4 sm:py-5 text-base font-sans',
            'disabled:cursor-not-allowed'
          )}
        />
        <button
          disabled={isLocked || isLoading}
          onClick={handleSubmit}
          className={cn(
            'px-8 py-4 sm:py-5 font-bold uppercase tracking-widest text-sm font-sans',
            'transition-colors duration-300',
            'text-surface disabled:cursor-not-allowed',
            isError ? 'bg-red-400' : 'bg-gold hover:bg-white'
          )}
        >
          {isLoading ? 'Enviando…' : 'Solicitar Acesso'}
        </button>
      </div>

      {/* Feedback */}
      <p
        className={cn(
          'mt-3 text-sm text-center min-h-[1.25rem]',
          status === 'already_registered' ? 'text-gold' : 'text-red-400'
        )}
      >
        {message || '\u00A0'}
      </p>
    </div>
  )
}
