'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  text: string
  autoPlay?: boolean
}

export function AudioPlayer({ text, autoPlay = false }: Props) {
  const [playing, setPlaying] = useState(false)
  const [supported, setSupported] = useState(true)
  const utRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!window.speechSynthesis) { setSupported(false); return }
    if (autoPlay) speak()
    return () => window.speechSynthesis?.cancel()
  }, [text])

  function speak() {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'; u.rate = 0.85; u.pitch = 1.1
    const v = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('ja'))
    if (v) u.voice = v
    u.onstart = () => setPlaying(true)
    u.onend   = () => setPlaying(false)
    u.onerror = () => setPlaying(false)
    utRef.current = u
    window.speechSynthesis.speak(u)
  }

  function stop() { window.speechSynthesis?.cancel(); setPlaying(false) }

  if (!supported) return null

  return (
    <button
      onClick={playing ? stop : speak}
      className="flex items-center gap-3 transition-opacity hover:opacity-100"
      style={{ opacity: playing ? 1 : 0.5 }}
    >
      {/* Play/stop icon */}
      <div
        className="w-8 h-8 flex items-center justify-center rounded-full border transition-colors"
        style={{
          borderColor: playing ? 'var(--amber)' : 'var(--border)',
          background: playing ? 'rgba(196,125,23,0.1)' : 'transparent',
        }}
      >
        {playing
          ? <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--amber)' }} />
          : <span className="ml-0.5 text-xs" style={{ color: 'var(--muted)' }}>▶</span>
        }
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--muted)' }}>
          {playing ? 'detener' : 'escuchar'}
        </span>
        {playing && (
          <div className="flex gap-[2px] items-end" style={{ height: 12 }}>
            {[50, 100, 35, 80, 55].map((h, i) => (
              <div
                key={i}
                className="w-[2px] rounded-full origin-bottom"
                style={{
                  height: `${h}%`,
                  background: 'var(--amber)',
                  animation: 'wave 0.7s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
