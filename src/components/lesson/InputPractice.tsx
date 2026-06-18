'use client'

import { useState } from 'react'

interface Props {
  target: string
}

export function InputPractice({ target }: Props) {
  const [value, setValue]     = useState('')
  const [checked, setChecked] = useState(false)
  const isCorrect = value.trim() === target.trim()

  function check() { if (value.trim()) setChecked(true) }
  function reset()  { setValue(''); setChecked(false) }

  return (
    <div className="space-y-3">
      <p className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--muted)' }}>
        Escribe la frase
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); setChecked(false) }}
          onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="日本語で…"
          className="flex-1 bg-transparent px-0 py-1 text-sm jp outline-none border-b"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--amber)')}
          onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
        />
        <button
          onClick={checked ? reset : check}
          className="text-xs tracking-widest uppercase px-3 py-1 transition-colors"
          style={{
            color: 'var(--amber)',
            border: '1px solid var(--amber)',
            borderRadius: 2,
          }}
        >
          {checked ? 'reset' : 'ok'}
        </button>
      </div>
      {checked && (
        <p className="text-sm" style={{ color: isCorrect ? 'var(--amber)' : 'var(--red)' }}>
          {isCorrect ? '正解' : `→ ${target}`}
        </p>
      )}
    </div>
  )
}
