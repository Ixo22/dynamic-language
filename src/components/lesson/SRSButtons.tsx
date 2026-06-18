'use client'

import { useState } from 'react'

interface Props {
  phrase: string
  onResult?: (understood: boolean, nextReview: string) => void
}

export function SRSButtons({ phrase, onResult }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<boolean | null>(null)
  const [nextReview, setNextReview] = useState<string | null>(null)

  async function handleSRS(understood: boolean) {
    setLoading(true)
    try {
      const res = await fetch('/api/srs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase, understood }),
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
      <div className={`text-center py-3 rounded-xl text-sm font-medium ${done ? 'text-emerald-400' : 'text-rose-400'}`}>
        {done ? '✓ Guardado — próxima revisión en ' : '✕ Agenado para mañana'}
        {nextReview && done && (
          <span className="ml-1 opacity-70">
            {new Date(nextReview).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={() => handleSRS(false)}
        disabled={loading}
        className="flex-1 max-w-[160px] py-3 rounded-xl border border-rose-500/50 text-rose-400 text-sm font-semibold hover:bg-rose-500/10 active:scale-95 transition-all disabled:opacity-40"
      >
        No lo entiendo
      </button>
      <button
        onClick={() => handleSRS(true)}
        disabled={loading}
        className="flex-1 max-w-[160px] py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 active:scale-95 transition-all shadow-lg shadow-emerald-900/40 disabled:opacity-40"
      >
        Lo entiendo
      </button>
    </div>
  )
}

function saveSRSLocal(phrase: string, understood: boolean) {
  try {
    const key = 'srs_local'
    const stored = JSON.parse(localStorage.getItem(key) ?? '{}')
    const existing = stored[phrase] ?? { interval_days: 1, ease_factor: 2.5 }
    const nextInterval = understood
      ? Math.ceil(existing.interval_days * existing.ease_factor)
      : 1
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + nextInterval)
    stored[phrase] = {
      interval_days: nextInterval,
      ease_factor: understood
        ? Math.min(2.5, existing.ease_factor + 0.05)
        : Math.max(1.3, existing.ease_factor - 0.2),
      next_review: nextDate.toISOString(),
    }
    localStorage.setItem(key, JSON.stringify(stored))
  } catch {}
}
