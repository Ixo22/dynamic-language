'use client'

import { useState, useEffect } from 'react'
import { DialogueResponse, Token, VocabItem } from '@/lib/types'
import { WordPopup } from './WordPopup'

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
      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors ml-auto"
      style={{
        border: '1px solid', borderColor: playing ? 'var(--amber)' : 'var(--border)',
        background: playing ? 'rgba(196,125,23,0.15)' : 'transparent',
        color: playing ? 'var(--amber)' : 'var(--muted)',
      }}
    >
      {playing ? <span className="w-1.5 h-1.5 rounded-sm" style={{ background: 'var(--amber)' }} /> : <span style={{ fontSize: 9, marginLeft: 1 }}>▶</span>}
    </button>
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
      const last = tokens[tokens.length - 1]
      if (last && !last.isVocab) last.text += remaining[0]
      else tokens.push({ text: remaining[0], vocab: null, isVocab: false })
      remaining = remaining.slice(1)
    }
  }
  return tokens
}

export function DialogueReader({ dialogue, showHints, showText, showAudio }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const tokens      = tokenize(dialogue.frase_completa_jp, dialogue.vocabulario_desglosado)
  const ambientChar = dialogue.frase_completa_jp[0] ?? '語'

  useEffect(() => {
    if (activeIdx === null) return
    const close = () => setActiveIdx(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [activeIdx])

  return (
    <div>
      {/* ── Frase ── */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none breathe" aria-hidden>
          <span className="jp font-black leading-none" style={{ fontSize: 'clamp(14rem, 55vw, 22rem)', color: 'var(--text)' }}>{ambientChar}</span>
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at center, rgba(196,125,23,0.04) 0%, transparent 70%)' }} />
        <div className="relative flex flex-wrap gap-x-1 gap-y-4 justify-center items-end py-12">
          {tokens.map((token, i) => (
            <div key={i} className="relative flex flex-col items-center gap-0.5">
              {showHints && token.vocab && (
                <span className="jp text-[11px] leading-none tracking-wide" style={{ color: 'var(--amber)', opacity: 0.65 }}>
                  {token.vocab.lectura}
                </span>
              )}
              <button
                onClick={(e) => { if (!token.isVocab) return; e.stopPropagation(); setActiveIdx(activeIdx === i ? null : i) }}
                className="jp leading-none transition-all duration-100"
                style={{
                  fontSize: 'clamp(2.8rem, 10vw, 5rem)',
                  color: activeIdx === i ? 'var(--amber)' : 'var(--text)',
                  opacity: token.isVocab ? 1 : 0.55,
                  cursor: token.isVocab ? 'pointer' : 'default',
                  fontWeight: token.isVocab ? 700 : 400,
                  textDecorationLine: token.isVocab && activeIdx !== i ? 'underline' : 'none',
                  textDecorationColor: 'var(--border)',
                  textUnderlineOffset: '6px',
                }}
              >
                {token.text}
              </button>
              {/* Interlineal — novedad de este commit */}
              {showText && token.vocab && (
                <span className="text-[10px] leading-none text-center max-w-[5rem] truncate" style={{ color: 'var(--amber)', opacity: 0.75 }}>
                  {shortMeaning(token.vocab.significado)}
                </span>
              )}
              {activeIdx === i && token.vocab && (
                <WordPopup vocab={token.vocab} onClose={() => setActiveIdx(null)} showAudio={showAudio} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Traducción completa ── */}
      {showText && (
        <div className="mx-0 mb-4 px-4 py-3" style={{ borderLeft: '3px solid var(--amber)', background: 'rgba(196,125,23,0.05)' }}>
          <p className="text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: 'var(--amber)', opacity: 0.7 }}>Traducción</p>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text)' }}>{dialogue.frase_es}</p>
        </div>
      )}

      {/* ── Vocabulario — siempre visible ── */}
      {dialogue.vocabulario_desglosado.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <p className="pt-4 pb-2 text-[9px] tracking-[0.3em] uppercase" style={{ color: 'var(--muted)' }}>Vocabulario</p>
          {dialogue.vocabulario_desglosado.map((v, i) => {
            const idx = tokens.findIndex(t => t.vocab?.forma === v.forma)
            return (
              <div key={i} className="flex items-center gap-3 py-3 transition-all" style={{ borderBottom: '1px solid var(--border)' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveIdx(activeIdx === idx ? null : idx) }}
                  className="flex items-start gap-3 text-left flex-1 min-w-0"
                  onMouseEnter={e => (e.currentTarget.style.paddingLeft = '6px')}
                  onMouseLeave={e => (e.currentTarget.style.paddingLeft = '0')}
                >
                  <span className="shrink-0 w-6 text-right text-[10px] tracking-widest mt-0.5" style={{ color: 'var(--muted)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="jp font-bold text-lg shrink-0" style={{ color: 'var(--amber-l)' }}>{v.forma}</span>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>{v.lectura}</span>
                    </div>
                    <p className="text-sm mt-0.5 leading-snug" style={{ color: 'var(--text)', opacity: 0.85 }}>{v.significado}</p>
                  </div>
                </button>
                <VocabAudioBtn forma={v.forma} visible={showAudio} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
