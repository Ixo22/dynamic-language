'use client'

import { useState, useEffect, useRef } from 'react'
import { getVocab, getVocabSRS, updateVocabSRS, removeVocab, StoredVocab, VocabSRS } from '@/lib/vocab-store'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* Due cards (o sin historial) primero, el resto ordenado por próxima revisión */
function sortBySRS(vocab: StoredVocab[], srs: Record<string, VocabSRS>): StoredVocab[] {
  const now   = new Date().toISOString()
  const due   = vocab.filter(v => !srs[v.forma] || srs[v.forma].next_review <= now)
  const later = vocab
    .filter(v => srs[v.forma] && srs[v.forma].next_review > now)
    .sort((a, b) => srs[a.forma].next_review.localeCompare(srs[b.forma].next_review))
  return [...shuffle(due), ...later]
}

type SlideDir = 'right' | 'left' | 'up'
const SLIDE_CLASS: Record<SlideDir, string> = {
  right: 'card-from-right',
  left:  'card-from-left',
  up:    'fade-up',
}

/* ── Tarjeta individual con flip 3D y tilt por ratón ── */
function FlashCard({ card, slideDir, onResult, onDelete }: {
  card:     StoredVocab
  slideDir: SlideDir
  onResult: (remembered: boolean) => void
  onDelete: () => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [tilt, setTilt]       = useState({ x: 0, y: 0 })
  const containerRef          = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (flipped || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setTilt({
      x:  ((e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2)) * 7,
      y: -((e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2)) * 7,
    })
  }

  const isTilting = tilt.x !== 0 || tilt.y !== 0

  const levelBadge = card.level ? (
    <span style={{
      position: 'absolute', top: 10, right: 10,
      fontSize: 7, letterSpacing: '0.2em', textTransform: 'uppercase',
      padding: '2px 6px', fontWeight: 700,
      background: 'rgba(196,125,23,0.12)', color: 'var(--amber)', borderRadius: 2,
    }}>{card.level}</span>
  ) : null

  return (
    <>
      {/* ── Carta 3D ── */}
      <div
        ref={containerRef}
        className={`w-full max-w-sm cursor-pointer select-none ${SLIDE_CLASS[slideDir]}`}
        style={{ perspective: '1000px', height: 240 }}
        onClick={() => { setFlipped(f => !f); setTilt({ x: 0, y: 0 }) }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          transition: isTilting ? 'transform 0.08s ease-out' : 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: flipped
            ? 'rotateY(180deg)'
            : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}>

          {/* Cara frontal — japonés */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: '3px solid var(--amber)', borderRadius: 4,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10, padding: '28px 24px',
          }}>
            {levelBadge}
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

          {/* Cara trasera — significado */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            background: 'var(--surface)', border: '1px solid var(--amber)',
            borderLeft: '3px solid var(--amber-l)', borderRadius: 4,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12, padding: '28px 24px',
            transform: 'rotateY(180deg)',
          }}>
            {card.level && (
              <span style={{
                position: 'absolute', top: 10, right: 10,
                fontSize: 7, letterSpacing: '0.2em', textTransform: 'uppercase',
                padding: '2px 6px', fontWeight: 700,
                background: 'rgba(196,125,23,0.12)', color: 'var(--amber)', borderRadius: 2,
              }}>{card.level}</span>
            )}
            <p className="text-[7px] tracking-[0.35em] uppercase" style={{ color: 'var(--amber)', opacity: 0.7 }}>Significado</p>
            <p className="jp font-bold" style={{ fontSize: 20, color: 'var(--amber)', opacity: 0.8 }}>{card.forma}</p>
            <p className="font-semibold text-center leading-snug"
              style={{ fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', color: 'var(--text)' }}>
              {card.significado}
            </p>
          </div>
        </div>
      </div>

      {/* ── Botones SRS — aparecen al revelar ── */}
      {flipped && (
        <div className="flex gap-3 w-full max-w-sm slide-up-in">
          <button
            onClick={() => onResult(false)}
            className="flex-1 py-3 text-sm font-semibold transition-all"
            style={{ border: '1px solid var(--border)', borderRadius: 3, color: 'var(--muted)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(158,50,34,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            No me acordaba
          </button>
          <button
            onClick={() => onResult(true)}
            className="flex-1 py-3 text-sm font-semibold transition-all"
            style={{ background: 'var(--amber)', color: '#0d0b08', borderRadius: 3, border: '1px solid transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--amber-l)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--amber)')}
          >
            Me acordaba
          </button>
        </div>
      )}

    </>
  )
}

/* ── Mazo principal ── */
export function FlashcardDeck() {
  const [deck, setDeck]         = useState<StoredVocab[]>([])
  const [idx, setIdx]           = useState(0)
  const [cardKey, setCardKey]   = useState(0)
  const [slideDir, setSlideDir] = useState<SlideDir>('up')
  const [lastResult, setLastResult] = useState<{ days: number } | null>(null)

  useEffect(() => {
    setDeck(sortBySRS(getVocab(), getVocabSRS()))
  }, [])

  function reshuffle() {
    setDeck(sortBySRS(getVocab(), getVocabSRS()))
    setIdx(0); setCardKey(k => k + 1); setSlideDir('up'); setLastResult(null)
  }

  function advance(dir: SlideDir) {
    setIdx(i => (i + 1) % deck.length)
    setCardKey(k => k + 1)
    setSlideDir(dir)
  }

  function handleResult(remembered: boolean) {
    const next = updateVocabSRS(deck[idx].forma, remembered)
    setLastResult({ days: next.interval_days })
    advance('right')
  }

  function handleDelete() {
    removeVocab(deck[idx].forma)
    const newDeck = deck.filter((_, i) => i !== idx)
    if (newDeck.length === 0) { setDeck([]); return }
    setDeck(newDeck)
    setIdx(i => Math.min(i, newDeck.length - 1))
    setCardKey(k => k + 1)
    setSlideDir('up')
    setLastResult(null)
  }

  function goNext() { setLastResult(null); advance('right') }
  function goPrev() {
    setLastResult(null)
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
    <div className="flex flex-col items-center gap-4 py-6 px-5">

      {/* Cabecera */}
      <div className="flex items-center justify-between w-full max-w-sm slide-right">
        <div>
          <p className="text-[8px] tracking-[0.3em] uppercase" style={{ color: 'var(--muted)' }}>Tarjeta</p>
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
        <div className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: 'var(--amber)', borderRadius: 1 }} />
      </div>

      {/* Feedback SRS breve */}
      {lastResult && (
        <div className="slide-down text-[9px] tracking-[0.25em] uppercase" style={{ color: 'var(--amber)', opacity: 0.7 }}>
          Próxima revisión en {lastResult.days} {lastResult.days === 1 ? 'día' : 'días'}
        </div>
      )}

      {/* Tarjeta — key fuerza remount al cambiar → flipped siempre empieza en false */}
      <FlashCard key={cardKey} card={deck[idx]} slideDir={slideDir} onResult={handleResult} onDelete={handleDelete} />

      {/* Navegación manual */}
      <div className="flex items-center justify-between w-full max-w-sm pt-1">
        <button onClick={goPrev}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all"
          style={{ border: '1px solid var(--border)', borderRadius: 3, color: 'var(--muted)', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--muted)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >← Anterior</button>
        <button onClick={goNext}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all"
          style={{ background: 'var(--amber)', color: '#0d0b08', borderRadius: 3 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--amber-l)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--amber)')}
        >Siguiente →</button>
      </div>

      {/* Eliminar tarjeta */}
      <button
        onClick={handleDelete}
        className="w-full max-w-sm py-2.5 text-xs font-semibold transition-all"
        style={{ border: '1px solid var(--border)', borderRadius: 3, color: 'var(--muted)', background: 'transparent' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(158,50,34,0.06)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}
      >
        × Quitar esta tarjeta
      </button>

    </div>
  )
}
