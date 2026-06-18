'use client'

import { useState, useEffect, useRef } from 'react'
import { getVocab, StoredVocab } from '@/lib/vocab-store'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type SlideDir = 'right' | 'left' | 'up'

const SLIDE_CLASS: Record<SlideDir, string> = {
  right: 'card-from-right',
  left:  'card-from-left',
  up:    'fade-up',
}

function FlashCard({ card, slideDir, cardKey }: {
  card:     StoredVocab
  slideDir: SlideDir
  cardKey:  number
}) {
  const [flipped, setFlipped] = useState(false)
  const [tilt, setTilt]       = useState({ x: 0, y: 0 })
  const containerRef          = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (flipped || !containerRef.current) return
    const rect   = containerRef.current.getBoundingClientRect()
    const cx     = rect.left + rect.width / 2
    const cy     = rect.top  + rect.height / 2
    setTilt({
      x:  ((e.clientY - cy) / (rect.height / 2)) * 7,
      y: -((e.clientX - cx) / (rect.width  / 2)) * 7,
    })
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 })
  }

  const isTilting = tilt.x !== 0 || tilt.y !== 0

  return (
    <div
      ref={containerRef}
      key={cardKey}
      className={`w-full max-w-sm cursor-pointer select-none ${SLIDE_CLASS[slideDir]}`}
      style={{ perspective: '1000px', height: 240 }}
      onClick={() => { setFlipped(f => !f); setTilt({ x: 0, y: 0 }) }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{
        position: 'relative',
        width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transition: isTilting
          ? 'transform 0.08s ease-out'
          : 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: flipped
          ? 'rotateY(180deg)'
          : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}>

        {/* ── Cara frontal — japonés ── */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderLeft: '3px solid var(--amber)', borderRadius: 4,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10, padding: '28px 24px',
        }}>
          <p className="text-[7px] tracking-[0.35em] uppercase" style={{ color: 'var(--muted)' }}>日本語</p>
          <p className="jp font-black leading-none text-center"
            style={{ fontSize: 'clamp(3rem, 14vw, 4.5rem)', color: 'var(--amber)' }}>
            {card.forma}
          </p>
          <p className="jp tracking-widest" style={{ fontSize: 13, color: 'var(--muted)' }}>{card.lectura}</p>
          <p className="text-[8px] tracking-[0.25em] uppercase absolute bottom-4"
            style={{ color: 'var(--muted)', opacity: 0.4 }}>
            Pulsa para revelar
          </p>
        </div>

        {/* ── Cara trasera — significado ── */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          background: 'var(--surface)',
          border: '1px solid var(--amber)',
          borderLeft: '3px solid var(--amber-l)', borderRadius: 4,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12, padding: '28px 24px',
          transform: 'rotateY(180deg)',
        }}>
          <p className="text-[7px] tracking-[0.35em] uppercase" style={{ color: 'var(--amber)', opacity: 0.7 }}>Significado</p>
          <p className="jp font-bold" style={{ fontSize: 20, color: 'var(--amber)', opacity: 0.8 }}>{card.forma}</p>
          <p className="font-semibold text-center leading-snug"
            style={{ fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', color: 'var(--text)' }}>
            {card.significado}
          </p>
          <p className="text-[8px] tracking-[0.25em] uppercase absolute bottom-4"
            style={{ color: 'var(--muted)', opacity: 0.4 }}>
            Pulsa para volver
          </p>
        </div>
      </div>
    </div>
  )
}

export function FlashcardDeck() {
  const [deck, setDeck]       = useState<StoredVocab[]>([])
  const [idx, setIdx]         = useState(0)
  const [cardKey, setCardKey] = useState(0)
  const [slideDir, setSlideDir] = useState<SlideDir>('up')

  useEffect(() => {
    setDeck(shuffle(getVocab()))
  }, [])

  function reshuffle() {
    setDeck(prev => shuffle(prev))
    setIdx(0)
    setCardKey(k => k + 1)
    setSlideDir('up')
  }

  function goNext() {
    setIdx(i => (i + 1) % deck.length)
    setCardKey(k => k + 1)
    setSlideDir('right')
  }

  function goPrev() {
    setIdx(i => (i - 1 + deck.length) % deck.length)
    setCardKey(k => k + 1)
    setSlideDir('left')
  }

  if (deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 fade-up">
        <span className="jp font-black kanji-pulse select-none"
          style={{ fontSize: '5rem', color: 'var(--text)', lineHeight: 1 }}>？</span>
        <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--muted)' }}>
          Aún no has estudiado ningún vocabulario.<br />
          Completa algunas frases en la sección Lección.
        </p>
      </div>
    )
  }

  const progress = ((idx + 1) / deck.length) * 100

  return (
    <div className="flex flex-col items-center gap-5 py-6 px-5">

      {/* Cabecera */}
      <div className="flex items-center justify-between w-full max-w-sm slide-right">
        <div>
          <p className="text-[8px] tracking-[0.3em] uppercase" style={{ color: 'var(--muted)' }}>
            Tarjeta
          </p>
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
            {idx + 1} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>/ {deck.length}</span>
          </p>
        </div>
        <button
          onClick={reshuffle}
          className="text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 transition-all"
          style={{ border: '1px solid var(--border)', borderRadius: 3, color: 'var(--muted)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
        >
          Mezclar
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="w-full max-w-sm" style={{ height: 2, background: 'var(--border)', borderRadius: 1 }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: 'var(--amber)', borderRadius: 1 }}
        />
      </div>

      {/* Tarjeta 3D */}
      <FlashCard card={deck[idx]} slideDir={slideDir} cardKey={cardKey} />

      {/* Navegación */}
      <div className="flex items-center justify-between w-full max-w-sm pt-2">
        <button
          onClick={goPrev}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all"
          style={{ border: '1px solid var(--border)', borderRadius: 3, color: 'var(--muted)', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--muted)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          ← Anterior
        </button>
        <button
          onClick={goNext}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all"
          style={{ background: 'var(--amber)', color: '#0d0b08', borderRadius: 3 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--amber-l)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--amber)')}
        >
          Siguiente →
        </button>
      </div>

    </div>
  )
}
