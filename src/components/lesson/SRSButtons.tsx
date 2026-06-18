'use client'

import { useState } from 'react'

interface Props {
  phrase:    string
  onResult?: (understood: boolean, nextReview: string) => void
}

export function SRSButtons({ phrase, onResult }: Props) {
  const [loading, setLoading]       = useState(false)
  const [done, setDone]             = useState<boolean | null>(null)
  const [nextReview, setNextReview] = useState<string | null>(null)

  async function handleSRS(understood: boolean) {
    setLoading(true)
    try {
      const res = await fetch('/api/srs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phrase, understood }),
      })
      if (res.ok) {
        const data = await res.json()
        setDone(understood)
        setNextReview(data.next_review)
        onResult?.(understood, data.next_review)
      } else {
        saveSRSLocal(phrase, understood)
        setDone(understood)
      }
    } catch {
      saveSRSLocal(phrase, understood)
      setDone(understood)
    } finally {
      setLoading(false)
    }
  }

  if (done !== null) {
    return (
      <div
        className="flex flex-col items-center justify-center py-10 gap-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="jp font-bold text-2xl" style={{ color: done ? 'var(--amber)' : 'var(--muted)' }}>
          {done ? '記録済み' : 'また明日'}
        </span>
        <span className="text-xs tracking-widest" style={{ color: 'var(--muted)' }}>
          {done && nextReview
            ? `próxima revisión · ${new Date(nextReview).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
            : 'agendado para mañana'
          }
        </span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2" style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => handleSRS(false)}
        disabled={loading}
        className="flex flex-col items-center justify-center py-10 gap-2 transition-colors"
        style={{ borderRight: '1px solid var(--border)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(158,50,34,0.06)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span className="jp font-bold text-2xl" style={{ color: 'var(--muted)' }}>まだ</span>
        <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--muted)', opacity: 0.6 }}>
          no lo sé
        </span>
      </button>

      <button
        onClick={() => handleSRS(true)}
        disabled={loading}
        className="flex flex-col items-center justify-center py-10 gap-2 transition-colors"
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,125,23,0.06)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span className="jp font-bold text-2xl" style={{ color: 'var(--muted)' }}>わかった</span>
        <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--muted)', opacity: 0.6 }}>
          lo entiendo
        </span>
      </button>
    </div>
  )
}

function saveSRSLocal(phrase: string, understood: boolean) {
  try {
    const key    = 'srs_local'
    const stored = JSON.parse(localStorage.getItem(key) ?? '{}')
    const ex     = stored[phrase] ?? { interval_days: 1, ease_factor: 2.5 }
    const next   = understood ? Math.ceil(ex.interval_days * ex.ease_factor) : 1
    const d      = new Date()
    d.setDate(d.getDate() + next)
    stored[phrase] = {
      interval_days: next,
      ease_factor:   understood ? Math.min(2.5, ex.ease_factor + 0.05) : Math.max(1.3, ex.ease_factor - 0.2),
      next_review:   d.toISOString(),
    }
    localStorage.setItem(key, JSON.stringify(stored))
  } catch {}
}
