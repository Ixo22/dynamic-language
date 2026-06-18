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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-48 pointer-events-none">
      <div
        className="overflow-hidden pointer-events-auto"
        style={{ background: 'var(--surface)', border: '1px solid var(--amber)', borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.65)' }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="min-w-0">
            <p className="jp font-bold text-2xl leading-none truncate" style={{ color: 'var(--amber)' }}>{vocab.forma}</p>
            <p className="jp text-[10px] mt-0.5 tracking-widest" style={{ color: 'var(--muted)' }}>{vocab.lectura}</p>
          </div>
          {showAudio && (
            <button
              onClick={handlePlay}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
              style={{
                border: '1px solid', borderColor: playing ? 'var(--amber)' : 'var(--border)',
                background: playing ? 'rgba(196,125,23,0.15)' : 'transparent',
                color: playing ? 'var(--amber)' : 'var(--muted)',
              }}
            >
              {playing ? <span className="w-2 h-2 rounded-sm" style={{ background: 'var(--amber)' }} /> : <span style={{ fontSize: 10, marginLeft: 1 }}>▶</span>}
            </button>
          )}
        </div>
        <div className="px-4 py-2.5">
          <p className="text-sm" style={{ color: 'var(--text)' }}>{vocab.significado}</p>
        </div>
      </div>
      <div className="flex justify-center mt-px pointer-events-none">
        <div className="w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--amber)' }} />
      </div>
    </div>
  )
}
