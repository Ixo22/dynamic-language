'use client'

import { useState } from 'react'
import { VocabItem } from '@/lib/types'

interface Props {
  vocab:     VocabItem
  onClose:   () => void
  showAudio: boolean
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

export function WordPopup({ vocab, onClose, showAudio }: Props) {
  const [playing, setPlaying] = useState(false)

  function handlePlay(e: React.MouseEvent) {
    e.stopPropagation()
    if (playing) { window.speechSynthesis?.cancel(); setPlaying(false); return }
    speakWord(vocab.forma, () => setPlaying(true), () => setPlaying(false))
  }

  return (
    /* word-popup-wrap: en desktop = absolute sobre la palabra
       en móvil (CSS) = fixed bottom sheet a pantalla completa      */
    <div
      className="word-popup-wrap absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-56 pointer-events-none"
      onClick={e => e.stopPropagation()}
    >
      <div
        className="word-popup-card overflow-hidden pointer-events-auto scale-in"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--amber)',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.65)',
        }}
      >
        {/* Cabecera */}
        <div className="px-4 py-3 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="min-w-0">
            <p className="jp font-bold text-2xl leading-none" style={{ color: 'var(--amber)' }}>{vocab.forma}</p>
            <p className="jp text-[11px] mt-1 tracking-widest" style={{ color: 'var(--muted)' }}>{vocab.lectura}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showAudio && (
              <button
                onClick={handlePlay}
                className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
                style={{
                  border: '1px solid',
                  borderColor: playing ? 'var(--amber)' : 'var(--border)',
                  background:  playing ? 'rgba(196,125,23,0.15)' : 'transparent',
                  color:       playing ? 'var(--amber)' : 'var(--muted)',
                }}
              >
                {playing
                  ? <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--amber)' }} />
                  : <span style={{ fontSize: 11, marginLeft: 2 }}>▶</span>
                }
              </button>
            )}
            {/* Botón cerrar — visible en móvil bottom sheet */}
            <button
              onClick={e => { e.stopPropagation(); onClose() }}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14 }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >✕</button>
          </div>
        </div>

        {/* Significado */}
        <div className="px-4 py-3">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{vocab.significado}</p>
        </div>

      </div>

      {/* Flecha — solo desktop */}
      <div className="word-popup-arrow flex justify-center mt-px pointer-events-none">
        <div className="w-0 h-0" style={{
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '5px solid var(--amber)',
        }} />
      </div>
    </div>
  )
}
