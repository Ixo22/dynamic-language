'use client'

import { useState, useEffect, useRef } from 'react'
import { DialogueResponse, Token, VocabItem } from '@/lib/types'
import { WordPopup } from './WordPopup'
import { AudioPlayer } from './AudioPlayer'

interface Props {
  dialogue:  DialogueResponse
  showHints: boolean
  showText:  boolean
  showAudio: boolean
}

function shortMeaning(sig: string): string {
  return sig.split(/[/（(,，]/)[0].trim().split(' ').slice(0, 3).join(' ')
}

function speakWord(text: string, onStart: () => void, onEnd: () => void) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ja-JP'; u.rate = 0.8; u.pitch = 1.1
  const voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('ja'))
  if (voice) u.voice = voice
  u.onstart = onStart; u.onend = onEnd; u.onerror = onEnd
  window.speechSynthesis.speak(u)
}

function VocabAudioBtn({ forma, visible }: { forma: string; visible: boolean }) {
  const [playing, setPlaying] = useState(false)
  if (!visible) return null
  function handle(e: React.MouseEvent) {
    e.stopPropagation()
    if (playing) { window.speechSynthesis?.cancel(); setPlaying(false); return }
    speakWord(forma, () => setPlaying(true), () => setPlaying(false))
  }
  return (
    <button
      onClick={handle}
      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all"
      style={{
        border: '1px solid', borderColor: playing ? 'var(--amber)' : 'var(--border)',
        background: playing ? 'rgba(196,125,23,0.18)' : 'rgba(255,255,255,0.02)',
        color: playing ? 'var(--amber)' : 'var(--muted)',
      }}
    >
      {playing ? <span className="block w-[7px] h-[7px] rounded-sm" style={{ background: 'var(--amber)' }} /> : <span style={{ fontSize: 9, marginLeft: 2 }}>▶</span>}
    </button>
  )
}

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

export function DialogueReader({ dialogue, showHints, showText, showAudio }: Props) {
  const [activeIdx, setActiveIdx]     = useState<number | null>(null)
  const [revealedSet, setRevealedSet] = useState<Set<string>>(new Set())
  const tokens      = tokenize(dialogue.frase_completa_jp, dialogue.vocabulario_desglosado)
  const ambientChar = dialogue.frase_completa_jp[0] ?? '語'

  const shuffleRef = useRef<{ key: typeof dialogue; arr: typeof dialogue.vocabulario_desglosado } | null>(null)
  if (!shuffleRef.current || shuffleRef.current.key !== dialogue) {
    const arr = [...dialogue.vocabulario_desglosado]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    shuffleRef.current = { key: dialogue, arr }
  }
  const shuffledVocab = shuffleRef.current.arr

  useEffect(() => {
    if (activeIdx === null) return
    const close = () => setActiveIdx(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [activeIdx])

  useEffect(() => { setRevealedSet(new Set()) }, [dialogue])

  function toggleReveal(forma: string) {
    setRevealedSet(prev => {
      const next = new Set(prev)
      next.has(forma) ? next.delete(forma) : next.add(forma)
      return next
    })
  }

  return (
    <div>
      {/* ── Frase ── */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none breathe" aria-hidden>
          <span className="jp font-black leading-none" style={{ fontSize: 'clamp(14rem, 55vw, 22rem)', color: 'var(--text)' }}>{ambientChar}</span>
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at center, rgba(196,125,23,0.05) 0%, transparent 68%)' }} />
        <div key={dialogue.frase_completa_jp} className="relative flex flex-wrap gap-x-1 gap-y-6 justify-center items-end py-14">
          {tokens.map((token, i) => {
            const isClickable = token.isVocab || isJapaneseChar(token.text[0])
            return (
              <div key={i} className="relative flex flex-col items-center pop-in" style={{ gap: token.isVocab ? 4 : 0, animationDelay: `${i * 35}ms` }}>
                {showHints && token.vocab && (
                  <span className="jp text-[11px] leading-none tracking-wide" style={{ color: 'var(--amber)', opacity: 0.65 }}>{token.vocab.lectura}</span>
                )}
                <button
                  onClick={(e) => { if (!isClickable) return; e.stopPropagation(); setActiveIdx(activeIdx === i ? null : i) }}
                  className={`jp leading-none ${isClickable ? 'token-btn' : ''}`}
                  style={{
                    fontSize: 'clamp(2.8rem, 10vw, 5rem)',
                    color: activeIdx === i ? 'var(--amber)' : 'var(--text)',
                    opacity: isClickable ? 1 : 0.3,
                    cursor: isClickable ? 'pointer' : 'default',
                    fontWeight: token.isVocab ? 700 : (isClickable ? 500 : 400),
                    textDecorationLine: token.isVocab && activeIdx !== i ? 'underline' : 'none',
                    textDecorationColor: 'rgba(196,125,23,0.3)',
                    textUnderlineOffset: '8px',
                  }}
                >
                  {token.text}
                </button>
                {showText && token.vocab && (
                  <span className="text-[10px] leading-none text-center truncate max-w-[5rem]" style={{ color: 'var(--amber)', opacity: 0.7 }}>
                    {shortMeaning(token.vocab.significado)}
                  </span>
                )}
                {activeIdx === i && isClickable && (
                  <WordPopup vocab={token.vocab} text={token.text} onClose={() => setActiveIdx(null)} showAudio={showAudio} />
                )}
              </div>
            )
          })}
        </div>
        {/* ── Audio pegado a la frase ── */}
        {showAudio && (
          <div className="relative flex justify-center pb-4">
            <AudioPlayer text={dialogue.frase_completa_jp} />
          </div>
        )}
      </div>

      {/* ── Traducción ── */}
      {showText && (
        <div className="mx-0 mb-5 px-4 py-3" style={{ borderLeft: '3px solid var(--amber)', background: 'rgba(196,125,23,0.05)' }}>
          <p className="text-[8px] tracking-[0.3em] uppercase mb-1.5" style={{ color: 'var(--amber)', opacity: 0.7 }}>Traducción</p>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text)' }}>{dialogue.frase_es}</p>
        </div>
      )}

      {/* ── Vocabulario — flashcards con recall activo ── */}
      {dialogue.vocabulario_desglosado.length > 0 && (
        <div className="mb-1">
          <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-[8px] tracking-[0.35em] uppercase font-bold" style={{ color: 'var(--muted)' }}>Vocabulario</span>
            <span className="jp text-[10px]" style={{ color: 'var(--muted)', opacity: 0.35 }}>語彙</span>
          </div>
          {shuffledVocab.map((v, i) => {
            const isShown = revealedSet.has(v.forma)

            return (
              <div key={v.forma} className="vocab-card pop-in mb-2" style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--amber)',
                borderRadius: 3,
                animationDelay: `${i * 55}ms`,
              }}>
                {/* Zona superior — solo lectura */}
                <div
                  className="w-full flex items-center gap-3 px-4 pt-3 pb-3"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>{v.lectura}</p>
                    <p className="jp font-bold text-xl leading-none" style={{ color: 'var(--amber)' }}>{v.forma}</p>
                  </div>
                  <span aria-hidden className="shrink-0 select-none" style={{
                    fontSize: '2.8rem', fontWeight: 900, lineHeight: 1,
                    color: 'var(--amber)', opacity: 0.08, letterSpacing: '-0.04em',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="shrink-0">
                    <VocabAudioBtn forma={v.lectura} visible={showAudio} />
                  </div>
                </div>

                {/* Zona inferior — reveal del significado */}
                {isShown ? (
                  <div className="px-4 py-3 slide-down">
                    <p className="text-sm leading-snug" style={{ color: 'var(--text)', opacity: 0.9 }}>{v.significado}</p>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleReveal(v.forma) }}
                    className="w-full flex items-center justify-between px-4 py-3 transition-all group"
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,125,23,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="text-[10px] tracking-widest" style={{ color: 'var(--muted)', opacity: 0.55 }}>¿Lo recuerdas?</span>
                    <span className="text-[10px] tracking-widest transition-colors group-hover:text-[#c47d17]" style={{ color: 'var(--muted)', opacity: 0.55 }}>Ver significado →</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
