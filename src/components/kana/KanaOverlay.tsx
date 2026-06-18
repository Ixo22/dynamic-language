'use client'

import { useState, useEffect, useRef } from 'react'
import { HIRAGANA_ROWS, KATAKANA_ROWS, DAKUTEN_HIRAGANA, DAKUTEN_KATAKANA, KanaRow } from '@/lib/kana-data'

type Tab = 'hiragana' | 'katakana'

function KanaGrid({ rows }: { rows: KanaRow[] }) {
  return (
    <div className="space-y-1">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1 justify-center">
          {row.chars.map((char, ci) =>
            char ? (
              <div
                key={ci}
                className="w-10 h-10 flex flex-col items-center justify-center cursor-default transition-colors"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 3 }}
                title={char.romaji}
              >
                <span className="jp text-base leading-none" style={{ color: 'var(--text)' }}>
                  {char.kana}
                </span>
                <span className="text-[8px] leading-none mt-0.5" style={{ color: 'var(--muted)' }}>
                  {char.romaji}
                </span>
              </div>
            ) : (
              <div key={ci} className="w-10 h-10" />
            )
          )}
        </div>
      ))}
    </div>
  )
}

export function KanaOverlay() {
  const [open, setOpen] = useState(false)
  const [tab, setTab]   = useState<Tab>('hiragana')
  const containerRef    = useRef<HTMLDivElement>(null)

  /* Cierra al hacer clic fuera del panel o del botón */
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [open])

  const rows = tab === 'hiragana'
    ? [...HIRAGANA_ROWS, ...DAKUTEN_HIRAGANA]
    : [...KATAKANA_ROWS, ...DAKUTEN_KATAKANA]

  return (
    /* ref cubre el botón + el panel para que clicks internos no cierren */
    <div ref={containerRef} className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-2">

      {/* Panel */}
      {open && (
        <div
          className="w-72 overflow-hidden shadow-2xl slide-down"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4 }}
        >
          <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
            {(['hiragana', 'katakana'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-xs font-semibold capitalize transition-colors"
                style={{
                  color:      tab === t ? 'var(--amber)' : 'var(--muted)',
                  background: tab === t ? 'rgba(196,125,23,0.06)' : 'transparent',
                }}
              >
                {t === 'hiragana' ? 'Hiragana' : 'Katakana'}
              </button>
            ))}
          </div>
          <div className="p-3 overflow-y-auto max-h-[70vh]">
            <KanaGrid rows={rows} />
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setOpen(o => !o)}
        className="transition-all"
        style={{
          background:    'var(--surface)',
          border:        '1px solid var(--border)',
          borderRadius:  4,
          color:         open ? 'var(--text)' : 'var(--muted)',
          fontSize:      '11px',
          fontWeight:    600,
          letterSpacing: '0.12em',
          padding:       '8px 12px',
          textTransform: 'uppercase',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
        onMouseLeave={e => (e.currentTarget.style.color = open ? 'var(--text)' : 'var(--muted)')}
      >
        {open ? 'Cerrar' : 'あ Kana'}
      </button>

    </div>
  )
}
