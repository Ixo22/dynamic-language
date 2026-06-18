'use client'

import { useState } from 'react'
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
                className="w-10 h-10 flex flex-col items-center justify-center rounded-lg bg-[#12121a] border border-[#2d2d44] hover:border-[#7c3aed]/50 cursor-default group transition-colors"
                title={char.romaji}
              >
                <span className="text-base text-slate-200 leading-none" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                  {char.kana}
                </span>
                <span className="text-[8px] text-slate-600 group-hover:text-[#a78bfa] leading-none mt-0.5 transition-colors">
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
  const [tab, setTab] = useState<Tab>('hiragana')

  const rows = tab === 'hiragana'
    ? [...HIRAGANA_ROWS, ...DAKUTEN_HIRAGANA]
    : [...KATAKANA_ROWS, ...DAKUTEN_KATAKANA]

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 bg-[#7c3aed] text-white text-xs font-medium px-3 py-2 rounded-full shadow-lg shadow-[#7c3aed]/40 hover:bg-[#6d28d9] active:scale-95 transition-all"
      >
        {open ? '✕ Cerrar' : '？ Kana'}
      </button>

      {open && (
        <div className="fixed bottom-16 right-6 z-40 w-72 bg-[#0d0d1a] border border-[#2d2d44] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="flex border-b border-[#2d2d44]">
            {(['hiragana', 'katakana'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                  tab === t ? 'text-[#a78bfa] bg-[#7c3aed]/10' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="p-3 overflow-y-auto max-h-[70vh]">
            <KanaGrid rows={rows} />
          </div>
        </div>
      )}
    </>
  )
}
