'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  text: string
  autoPlay?: boolean
}

export function AudioPlayer({ text, autoPlay = false }: Props) {
  const [playing, setPlaying] = useState(false)
  const [supported, setSupported] = useState(true)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupported(false)
      return
    }
    if (autoPlay) speak()
    return () => window.speechSynthesis?.cancel()
  }, [text])

  function speak() {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    u.rate = 0.85
    u.pitch = 1.1

    const voices = window.speechSynthesis.getVoices()
    const jpVoice = voices.find(v => v.lang.startsWith('ja'))
    if (jpVoice) u.voice = jpVoice

    u.onstart = () => setPlaying(true)
    u.onend = () => setPlaying(false)
    u.onerror = () => setPlaying(false)
    utteranceRef.current = u
    window.speechSynthesis.speak(u)
  }

  function stop() {
    window.speechSynthesis?.cancel()
    setPlaying(false)
  }

  if (!supported) return null

  return (
    <button
      onClick={playing ? stop : speak}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
        playing
          ? 'bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/50'
          : 'bg-[#1a1a2e] text-slate-400 border border-[#2d2d44] hover:border-[#7c3aed]/40 hover:text-[#a78bfa]'
      }`}
    >
      <span className={playing ? 'animate-pulse' : ''}>{playing ? '⏹' : '▶'}</span>
      <span>{playing ? 'Detener' : 'Escuchar'}</span>
    </button>
  )
}
