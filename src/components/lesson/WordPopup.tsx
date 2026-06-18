'use client'

import { useState, useRef } from 'react'
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

function CardContent({ vocab, onClose, showAudio }: Props) {
  return (
    <div
      className="scale-in"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--amber)',
        borderRadius: 6,
        boxShadow: '0 12px 48px rgba(0,0,0,0.75)',
        width: 260,
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="min-w-0">
          <p className="jp font-bold leading-none" style={{ fontSize: '2rem', color: 'var(--amber)' }}>{vocab.forma}</p>
          <p className="jp text-sm mt-1 tracking-widest" style={{ color: 'var(--muted)' }}>{vocab.lectura}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {showAudio && <AudioBtn forma={vocab.forma} />}
          <button
            onClick={e => { e.stopPropagation(); onClose() }}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >✕</button>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{vocab.significado}</p>
      </div>
    </div>
  )
}

export function WordPopup({ vocab, onClose, showAudio }: Props) {
  const isMobile    = typeof window !== 'undefined' && window.innerWidth < 768
  const touchStartY = useRef(0)
  const [dragY, setDragY]         = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  function onTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
    setIsDragging(true)
  }
  function onTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientY - touchStartY.current
    if (delta > 0) setDragY(delta)
  }
  function onTouchEnd() {
    setIsDragging(false)
    if (dragY > 72) onClose()
    else setDragY(0)
  }

  /* ── MÓVIL: portal centrado con swipe-down para cerrar ── */
  if (isMobile) {
    return createPortal(
      <>
        {/* Backdrop */}
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.6)' }}
          onClick={e => { e.stopPropagation(); onClose() }}
        />
        {/* Card con drag */}
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, calc(-50% + ${dragY}px))`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
            opacity: Math.max(0, 1 - dragY / 180),
            zIndex: 9999,
            touchAction: 'none',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <CardContent vocab={vocab} onClose={onClose} showAudio={showAudio} />
        </div>
      </>,
      document.body
    )
  }

  /* ── DESKTOP: tooltip absolute encima de la palabra ── */
  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none"
      onClick={e => e.stopPropagation()}
    >
      <div className="pointer-events-auto">
        <CardContent vocab={vocab} onClose={onClose} showAudio={showAudio} />
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
