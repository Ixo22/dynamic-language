'use client'

import { useState } from 'react'

interface Props {
  target: string
}

export function InputPractice({ target }: Props) {
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState(false)

  const isCorrect = value.trim() === target.trim()

  function check() {
    if (value.trim()) setChecked(true)
  }

  function reset() {
    setValue('')
    setChecked(false)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 text-center">Escribe la frase en japonés</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); setChecked(false) }}
          onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="日本語で書いてください..."
          className="flex-1 bg-[#12121a] border border-[#2d2d44] rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-[#7c3aed]/60 transition-colors"
          style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
        />
        <button
          onClick={checked ? reset : check}
          className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] active:scale-95 transition-all"
        >
          {checked ? 'Reset' : 'Comprobar'}
        </button>
      </div>
      {checked && (
        <p className={`text-sm text-center font-medium ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isCorrect ? '✓ ¡Correcto!' : `✕ Era: ${target}`}
        </p>
      )}
    </div>
  )
}
