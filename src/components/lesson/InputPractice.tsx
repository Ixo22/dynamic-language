'use client'

import { useState, useMemo } from 'react'
import { toHiragana } from 'wanakana'
import { VocabItem } from '@/lib/types'

interface Props {
  target: string
  vocab:  VocabItem[]
}

/* Reemplaza cada forma kanji por su lectura kana para obtener el target en kana puro */
function buildKanaTarget(target: string, vocab: VocabItem[]): string {
  let result = ''
  let remaining = target
  while (remaining.length > 0) {
    let matched = false
    for (const v of vocab) {
      if (remaining.startsWith(v.forma)) {
        result += v.lectura
        remaining = remaining.slice(v.forma.length)
        matched = true
        break
      }
    }
    if (!matched) {
      result += remaining[0]
      remaining = remaining.slice(1)
    }
  }
  return result
}

/* Normaliza a hiragana puro para la comparación (ignora puntuación) */
function normalize(s: string): string {
  return toHiragana(s, { passRomaji: false })
    .replace(/[^぀-ゟ゠-ヿ]/g, '')
}

export function InputPractice({ target, vocab }: Props) {
  const [romaji, setRomaji]   = useState('')
  const [checked, setChecked] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const kanaTarget = useMemo(() => buildKanaTarget(target, vocab), [target, vocab])
  const kanaInput  = toHiragana(romaji, { IMEMode: true })
  const isCorrect  = checked && normalize(kanaInput) === normalize(kanaTarget)

  function handleCheck() {
    if (romaji.trim()) setChecked(true)
  }

  function handleReset() {
    setRomaji('')
    setChecked(false)
  }

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: 'var(--muted)' }}>
            Práctica — escribe en romaji
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)', opacity: 0.6 }}>
            Tu teclado en español funciona: escribe "konnichiwa" → こんにちは
          </p>
        </div>
        <button
          onClick={() => setShowHint(h => !h)}
          className="text-[9px] tracking-[0.2em] uppercase px-2 py-1 transition-all shrink-0"
          style={{
            border: '1px solid var(--border)',
            borderRadius: 2,
            color: showHint ? 'var(--amber)' : 'var(--muted)',
          }}
        >
          {showHint ? 'Ocultar' : 'Ver pista'}
        </button>
      </div>

      {/* Pista: target en kana */}
      {showHint && (
        <div className="px-3 py-2.5 slide-down" style={{ background: 'rgba(196,125,23,0.06)', border: '1px solid rgba(196,125,23,0.2)', borderRadius: 3 }}>
          <p className="text-[8px] tracking-[0.3em] uppercase mb-1" style={{ color: 'var(--amber)', opacity: 0.7 }}>Objetivo en kana</p>
          <p className="jp text-xl font-bold" style={{ color: 'var(--amber)' }}>{kanaTarget}</p>
        </div>
      )}

      {/* Campo romaji */}
      <div>
        <input
          type="text"
          value={romaji}
          onChange={e => { setRomaji(e.target.value); setChecked(false) }}
          onKeyDown={e => e.key === 'Enter' && handleCheck()}
          placeholder="konnichiwa, ohayou..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            color: 'var(--text)',
            fontFamily: 'var(--font-ui)',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
          onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Preview kana en tiempo real */}
      {romaji && (
        <div className="flex items-center gap-2 slide-down">
          <span className="text-[8px] tracking-[0.25em] uppercase shrink-0" style={{ color: 'var(--muted)' }}>→</span>
          <p className="jp text-2xl font-bold leading-none" style={{ color: checked ? (isCorrect ? 'var(--amber)' : 'var(--red)') : 'var(--text)' }}>
            {kanaInput || romaji}
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-2">
        <button
          onClick={handleCheck}
          disabled={!romaji.trim()}
          className="flex-1 py-2.5 text-sm font-bold transition-all"
          style={{
            background: 'var(--amber)',
            color: '#0d0b08',
            borderRadius: 3,
            opacity: romaji.trim() ? 1 : 0.4,
          }}
          onMouseEnter={e => { if (romaji.trim()) e.currentTarget.style.background = 'var(--amber-l)' }}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--amber)')}
        >
          Comprobar
        </button>
        {(romaji || checked) && (
          <button
            onClick={handleReset}
            className="px-4 py-2.5 text-sm font-semibold transition-all"
            style={{ border: '1px solid var(--border)', borderRadius: 3, color: 'var(--muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            Reset
          </button>
        )}
      </div>

      {/* Resultado */}
      {checked && (
        <div className="slide-down px-3 py-3" style={{
          background: isCorrect ? 'rgba(196,125,23,0.08)' : 'rgba(158,50,34,0.08)',
          border: `1px solid ${isCorrect ? 'rgba(196,125,23,0.3)' : 'rgba(158,50,34,0.3)'}`,
          borderRadius: 3,
        }}>
          {isCorrect ? (
            <div className="flex items-center gap-2">
              <span className="jp font-black text-2xl" style={{ color: 'var(--amber)' }}>正解</span>
              <span className="text-sm" style={{ color: 'var(--amber)' }}>¡Correcto!</span>
            </div>
          ) : (
            <div>
              <p className="text-xs mb-1.5 font-semibold" style={{ color: 'var(--red)' }}>No es exacto. La respuesta correcta:</p>
              <p className="jp text-xl font-bold" style={{ color: 'var(--text)' }}>{kanaTarget}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
