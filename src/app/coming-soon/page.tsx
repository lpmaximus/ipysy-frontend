'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Conteúdo rotativo ────────────────────────────────────────────────────────
// Cada entrada tem title (JSX) e desc (JSX) para preservar a semântica
// sem recorrer a dangerouslySetInnerHTML.

interface Content {
  title: React.ReactNode
  desc: React.ReactNode
}

const CONTENTS: Content[] = [
  {
    title: (
      <>
        Sua experiência agora <br />
        <em>tem valor mensurável.</em>
      </>
    ),
    desc: (
      <>
        O IPYSY é o novo padrão para quem valoriza a <strong>clareza analítica</strong>.
        Uma estrutura desenhada para validar o conhecimento e premiar a{' '}
        <strong>reputação construída com rigor</strong>.
      </>
    ),
  },
  {
    title: (
      <>
        Transforme sua previsão <br />
        <em>em sinal coletivo.</em>
      </>
    ),
    desc: (
      <>
        Diferente de redes sociais, aqui a sua opinião vira{' '}
        <strong>probabilidade real</strong>. Participe da plataforma
        que agrega expectativas humanas com <strong>precisão estatística</strong>.
      </>
    ),
  },
  {
    title: (
      <>
        Onde o conhecimento <br />
        <em>encontra o rigor.</em>
      </>
    ),
    desc: (
      <>
        Meça, valide e registre seu histórico de acertos. O IPYSY transforma
        palpites dispersos em um <strong>indicador confiável</strong> sobre
        o futuro da ciência, economia e sociedade.
      </>
    ),
  },
  {
    title: (
      <>
        A inteligência do consenso <br />
        <em>além do ruído.</em>
      </>
    ),
    desc: (
      <>
        Uma plataforma pública projetada para quem busca{' '}
        <strong>dados antecedentes</strong>. O valor do IPYSY reside
        na acurácia histórica e na{' '}
        <strong>qualidade do sinal gerado</strong>.
      </>
    ),
  },
  {
    title: (
      <>
        Sua reputação validada <br />
        <em>por algoritmos.</em>
      </>
    ),
    desc: (
      <>
        Construa um <strong>histórico de autoridade</strong> auditável.
        No IPYSY, não há apostas — apenas a busca pela verdade através da{' '}
        <strong>inteligência preditiva colaborativa</strong>.
      </>
    ),
  },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ComingSoonPage() {
  // Inicia com o índice 0 (SSR seguro), sorteia no cliente após hidratação.
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  // Sorteio acontece apenas no cliente, evitando hydration mismatch.
  useEffect(() => {
    setIndex(Math.floor(Math.random() * CONTENTS.length))
    setMounted(true)
  }, [])

  // Animação de partículas no canvas.
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
    <div
      style={{
        backgroundColor: '#0F1923',
        color: '#FFFFFF',
        fontFamily: 'var(--font-inter), sans-serif',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Canvas de fundo */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          opacity: 0.2,
        }}
      />

      {/* Conteúdo central */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '900px',
          textAlign: 'center',
          padding: '40px',
        }}
      >
        {/* Logo */}
        <span
          style={{
            fontWeight: 600,
            letterSpacing: '12px',
            color: '#9A7B2E',
            fontSize: '0.75rem',
            marginBottom: '20px',
            textTransform: 'uppercase',
            display: 'block',
          }}
        >
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
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              lineHeight: 1.15,
              marginBottom: '35px',
              fontWeight: 700,
              minHeight: '2.2em',
            }}
          >
            {/* Estilo para <em> dentro do h1 */}
            <style>{`
              h1 em {
                font-weight: 400;
                font-style: italic;
                color: #9A7B2E;
              }
            `}</style>
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
            style={{
              fontSize: '1.25rem',
              lineHeight: 1.8,
              color: '#A0AEC0',
              maxWidth: '720px',
              margin: '0 auto 50px',
              fontWeight: 300,
              minHeight: '5.4em',
            }}
          >
            {/* Estilo para <strong> dentro da descrição */}
            <style>{`
              p strong {
                color: #FFFFFF;
                font-weight: 600;
              }
            `}</style>
            {content.desc}
          </motion.p>
        </AnimatePresence>

        {/* CTA */}
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <InputWrapper />
          <p
            style={{
              marginTop: '20px',
              fontSize: '0.65rem',
              color: '#9A7B2E',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              opacity: 0.8,
            }}
          >
            Acesso Exclusivo • 2026
          </p>
        </div>
      </div>

      {/* Trust badges */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          display: 'flex',
          gap: '40px',
          opacity: 0.5,
        }}
        className="hidden md:flex"
      >
        {['Rigor Metodológico', 'Privacidade Garantida', 'Inteligência Coletiva'].map(
          (badge, i) => (
            <div
              key={badge}
              style={{
                fontSize: '0.7rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                borderLeft: i === 0 ? 'none' : '1px solid #9A7B2E',
                paddingLeft: i === 0 ? 0 : '40px',
              }}
            >
              {badge}
            </div>
          )
        )}
      </div>
    </div>
  )
}

// ─── Input + Botão ────────────────────────────────────────────────────────────

import { registerWaitlist, type WaitlistStatus } from '@/lib/api'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function InputWrapper() {
  const [focused, setFocused] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<WaitlistStatus>('idle')
  const [message, setMessage] = useState('')

  const isLocked = status === 'success'
  const isLoading = status === 'loading'
  const isError = status === 'error'

  // Cor da borda: vermelho no erro, ouro no foco, ouro tênue no padrão
  const borderColor = isError
    ? '#FC8181'
    : focused
      ? '#9A7B2E'
      : 'rgba(154,123,46,0.4)'

  // Cor do botão: cinza se bloqueado, vermelho se erro, ouro caso contrário
  const btnBg = isLocked ? '#555' : isError ? '#FC8181' : '#9A7B2E'

  const handleSubmit = async () => {
    if (!email.trim() || isLocked || isLoading) return

    // Validação client-side — evita round-trip e problemas de encoding
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
    if (result.status === 'already_registered') {
      setEmail('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  // ── Estado de sucesso: substitui o formulário por confirmação ──────────────
  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>✅</p>
        <p style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>
          Solicitação recebida!
        </p>
        <p style={{ color: '#A0AEC0', fontSize: '0.9rem' }}>{message}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Campo + botão */}
      <div
        style={{
          display: 'flex',
          background: focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${borderColor}`,
          padding: '6px',
          transition: 'border-color 0.3s, background 0.4s',
          opacity: isLocked ? 0.6 : 1,
        }}
      >
        <input
          type="email"
          placeholder="E-mail para convite prioritário"
          value={email}
          disabled={isLocked || isLoading}
          onChange={(e) => {
            setEmail(e.target.value)
            if (isError || status === 'already_registered') { setStatus('idle'); setMessage('') }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'white',
            padding: '18px 25px',
            fontSize: '1.1rem',
            outline: 'none',
            fontFamily: 'var(--font-inter), sans-serif',
            cursor: isLocked ? 'not-allowed' : 'text',
          }}
        />
        <button
          disabled={isLocked || isLoading}
          style={{
            background: btnBg,
            color: '#0F1923',
            border: 'none',
            padding: '0 35px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '0.85rem',
            cursor: isLocked || isLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s',
            fontFamily: 'var(--font-inter), sans-serif',
            minWidth: '160px',
          }}
          onMouseEnter={(e) => {
            if (!isLocked && !isLoading) e.currentTarget.style.background = '#FFFFFF'
          }}
          onMouseLeave={(e) => {
            if (!isLocked && !isLoading) e.currentTarget.style.background = btnBg
          }}
          onClick={handleSubmit}
        >
          {isLoading ? 'Enviando…' : 'Solicitar Acesso'}
        </button>
      </div>

      {/* Feedback: sempre renderizado para evitar layout shift */}
      <p
        style={{
          marginTop: '12px',
          fontSize: '0.85rem',
          color: status === 'already_registered' ? '#9A7B2E' : '#FC8181',
          textAlign: 'center',
          minHeight: '1.2em',
        }}
      >
        {message
          ? `${message}`
          : '\u00A0'}
      </p>
    </div>
  )
}
