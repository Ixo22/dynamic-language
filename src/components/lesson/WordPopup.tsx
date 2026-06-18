'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
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

function AudioBtn({ forma }: { forma: string }) {
  const [playing, setPlaying] = useState(false)
  return (
    <button
      onClick={e => {
        e.stopPropagation()
        if (playing) { window.speechSynthesis?.cancel(); setPlaying(false); return }
        speakWord(forma, () => setPlaying(true), () => setPlaying(false))
      }}
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
  )
}

export function WordPopup({ vocab, onClose, showAudio }: Props) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  /* ── MÓVIL: portal en document.body — escapa overflow-y:auto del shell ── */
  if (isMobile) {
    return createPortal(
      <>
        {/* Backdrop */}
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.55)',
          }}
          onClick={e => { e.stopPropagation(); onClose() }}
        />

        {/* Panel */}
        <div
          className="slide-up-in"
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
            background: 'var(--surface)',
            borderTop: '2px solid var(--amber)',
            borderRadius: '16px 16px 0 0',
            boxShadow: '0 -8px 48px rgba(0,0,0,0.7)',
            paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)' }} />
          </div>

          {/* Cabecera */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div>
              <p className="jp font-black" style={{ fontSize: '2.4rem', lineHeight: 1, color: 'var(--amber)' }}>
                {vocab.forma}
              </p>
              <p className="jp text-sm mt-1.5 tracking-widest" style={{ color: 'var(--muted)' }}>
                {vocab.lectura}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {showAudio && <AudioBtn forma={vocab.forma} />}
              <button
                onClick={e => { e.stopPropagation(); onClose() }}
                className="w-9 h-9 flex items-center justify-center rounded-full"
                style={{ border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 18 }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Significado */}
          <div className="px-5 py-4">
            <p className="text-base leading-relaxed" style={{ color: 'var(--text)' }}>
              {vocab.significado}
            </p>
          </div>
        </div>
      </>,
      document.body
    )
  }

  /* ── DESKTOP: tooltip absolute encima de la palabra ── */
  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-56 pointer-events-none"
      onClick={e => e.stopPropagation()}
    >
      <div
        className="overflow-hidden pointer-events-auto scale-in"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--amber)',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.65)',
        }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="min-w-0">
            <p className="jp font-bold text-2xl leading-none" style={{ color: 'var(--amber)' }}>{vocab.forma}</p>
            <p className="jp text-[11px] mt-1 tracking-widest" style={{ color: 'var(--muted)' }}>{vocab.lectura}</p>
          </div>
          {showAudio && <AudioBtn forma={vocab.forma} />}
        </div>
        <div className="px-4 py-2.5">
          <p className="text-sm leading-snug" style={{ color: 'var(--text)' }}>{vocab.significado}</p>
        </div>
      </div>
      <div className="flex justify-center mt-px pointer-events-none">
        <div className="w-0 h-0" style={{
          borderLeft:  '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop:   '5px solid var(--amber)',
        }} />
      </div>
    </div>
  )
}
