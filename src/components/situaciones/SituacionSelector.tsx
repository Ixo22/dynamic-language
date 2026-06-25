'use client'

import { useState, useEffect } from 'react'
import { SITUACIONES, Situacion } from '@/lib/situaciones'
import { DialogueResponse, VocabItem } from '@/lib/types'
import { addVocab } from '@/lib/vocab-store'
import { WordPopup } from '@/components/lesson/WordPopup'
import { AudioPlayer } from '@/components/lesson/AudioPlayer'

/* ── Utils ── */
function shortMeaning(sig: string): string {
  return sig.split(/[/（(,，]/)[0].trim().split(' ').slice(0, 3).join(' ')
}

interface Token { text: string; vocab: VocabItem | null; isVocab: boolean }

function isJapaneseChar(ch: string): boolean {
  const code = ch.charCodeAt(0)
  return (
    (code >= 0x3040 && code <= 0x309F) ||
    (code >= 0x30A0 && code <= 0x30FF) ||
    (code >= 0x4E00 && code <= 0x9FFF) ||
    (code >= 0x3400 && code <= 0x4DBF)
  )
}

function tokenize(phrase: string, vocab: VocabItem[]): Token[] {
  const tokens: Token[] = []
  let remaining = phrase
  while (remaining.length > 0) {
    let matched = false
    for (const v of vocab) {
      if (remaining.startsWith(v.forma)) {
        tokens.push({ text: v.forma, vocab: v, isVocab: true })
        remaining = remaining.slice(v.forma.length); matched = true; break
      }
    }
    if (!matched) {
      const ch = remaining[0]
      if (isJapaneseChar(ch)) {
        tokens.push({ text: ch, vocab: null, isVocab: false })
      } else {
        const last = tokens[tokens.length - 1]
        if (last && !last.isVocab && !isJapaneseChar(last.text[0])) {
          last.text += ch
        } else {
          tokens.push({ text: ch, vocab: null, isVocab: false })
        }
      }
      remaining = remaining.slice(1)
    }
  }
  return tokens
}

/* ── Tarjeta de frase dentro de una situación ── */
function PhraseCard({ dialogue, index, showHints }: {
  dialogue:   DialogueResponse
  index:      number
  showHints:  boolean
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [revealed, setRevealed]   = useState(false)
  const tokens = tokenize(dialogue.frase_completa_jp, dialogue.vocabulario_desglosado)

  return (
    <div
      className="pop-in"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 4,
        marginBottom: 12,
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Contexto */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <span className="shrink-0 text-[8px] tracking-[0.3em] uppercase px-2 py-0.5 font-semibold"
          style={{ background: 'rgba(196,125,23,0.1)', color: 'var(--amber)', borderRadius: 2 }}>
          {index + 1}
        </span>
        <p className="text-xs italic leading-snug" style={{ color: 'var(--muted)' }}>
          {dialogue.contexto_escena}
        </p>
      </div>

      {/* Frase */}
      <div className="px-4 py-3 relative" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex flex-wrap gap-x-1 gap-y-4 items-end">
          {tokens.map((token, i) => {
            const isClickable = token.isVocab || isJapaneseChar(token.text[0])
            return (
              <div key={i} className="relative flex flex-col items-center" style={{ gap: token.isVocab ? 3 : 0 }}>
                {showHints && token.vocab && (
                  <span className="jp text-[9px] leading-none" style={{ color: 'var(--amber)', opacity: 0.65 }}>
                    {token.vocab.lectura}
                  </span>
                )}
                <button
                  onClick={e => { if (!isClickable) return; e.stopPropagation(); setActiveIdx(activeIdx === i ? null : i) }}
                  className={`jp leading-none ${isClickable ? 'token-btn' : ''}`}
                  style={{
                    fontSize: 'clamp(1.6rem, 7vw, 2.4rem)',
                    color: activeIdx === i ? 'var(--amber)' : 'var(--text)',
                    opacity: isClickable ? 1 : 0.3,
                    cursor: isClickable ? 'pointer' : 'default',
                    fontWeight: token.isVocab ? 700 : (isClickable ? 500 : 400),
                    textDecorationLine: token.isVocab && activeIdx !== i ? 'underline' : 'none',
                    textDecorationColor: 'rgba(196,125,23,0.3)',
                    textUnderlineOffset: '5px',
                  }}
                >{token.text}</button>
                {activeIdx === i && isClickable && (
                  <WordPopup vocab={token.vocab} text={token.text} onClose={() => setActiveIdx(null)} showAudio />
                )}
              </div>
            )
          })}
        </div>
        {/* Audio */}
        <div className="mt-3 flex items-center gap-3">
          <AudioPlayer text={dialogue.frase_completa_jp} />
          <button
            onClick={() => setRevealed(r => !r)}
            className="text-[9px] tracking-[0.2em] uppercase transition-colors"
            style={{ color: revealed ? 'var(--amber)' : 'var(--muted)' }}
          >
            {revealed ? 'Ocultar' : 'Traducción'}
          </button>
        </div>
        {revealed && (
          <p className="mt-2 text-sm leading-relaxed slide-down" style={{ color: 'var(--text)', opacity: 0.85 }}>
            {dialogue.frase_es}
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Panel de situación seleccionada ── */
function SituacionPanel({ sit, onBack }: { sit: Situacion; onBack: () => void }) {
  const [showHints, setShowHints] = useState(true)

  useEffect(() => {
    addVocab(sit.dialogues.flatMap(d => d.vocabulario_desglosado))
  }, [sit])

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          ← Volver
        </button>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span className="text-2xl">{sit.emoji}</span>
        <div>
          <h2 className="font-bold text-sm leading-none" style={{ color: 'var(--text)' }}>{sit.label}</h2>
          <p className="jp text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>{sit.jp}</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowHints(h => !h)}
            className="text-[9px] tracking-[0.2em] uppercase px-2.5 py-1.5 transition-all"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 3,
              color: showHints ? 'var(--amber)' : 'var(--muted)',
              background: showHints ? 'rgba(196,125,23,0.08)' : 'transparent',
            }}
          >
            {showHints ? 'Furigana ✓' : 'Furigana'}
          </button>
        </div>
      </div>

      {/* Frases */}
      <div className="px-5 py-5">
        <p className="text-[8px] tracking-[0.35em] uppercase mb-4" style={{ color: 'var(--muted)' }}>
          {sit.dialogues.length} frases útiles · Pulsa una palabra para ver su significado
        </p>
        {sit.dialogues.map((d, i) => (
          <PhraseCard key={i} dialogue={d} index={i} showHints={showHints} />
        ))}
      </div>
    </div>
  )
}

/* ── Grid de selección ── */
export function SituacionSelector() {
  const [selected, setSelected] = useState<Situacion | null>(null)

  if (selected) {
    return <SituacionPanel sit={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="px-5 py-6 fade-up">
      <div className="mb-6 slide-right">
        <h2 className="font-bold text-base leading-none mb-1" style={{ color: 'var(--text)' }}>Situaciones reales</h2>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
          Elige una situación del día a día y aprende las frases que realmente necesitas.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SITUACIONES.map((sit, i) => (
          <button
            key={sit.id}
            onClick={() => setSelected(sit)}
            className="vocab-card pop-in text-left flex flex-col gap-2 p-4 transition-all"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderTop: `3px solid ${sit.accent}`,
              borderRadius: 4,
              animationDelay: `${i * 55}ms`,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = sit.accent)}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--border)'
              el.style.borderTopColor = sit.accent
            }}
          >
            <span style={{ fontSize: 28, lineHeight: 1 }}>{sit.emoji}</span>
            <div>
              <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--text)' }}>{sit.label}</p>
              <p className="jp text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{sit.jp}</p>
            </div>
            <p className="text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--muted)', opacity: 0.6 }}>
              {sit.dialogues.length} frases →
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
