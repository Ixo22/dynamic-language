'use client'

import { UIToggles } from '@/lib/types'

interface Props {
  toggles:  UIToggles
  onChange: (key: keyof UIToggles) => void
}

const ITEMS: { key: keyof UIToggles; label: string }[] = [
  { key: 'showAudio',  label: 'Audio'      },
  { key: 'showText',   label: 'Traducción' },
  { key: 'showInput',  label: 'Práctica'   },
  { key: 'showHints',  label: 'Furigana'   },
]

export function ToggleBar({ toggles, onChange }: Props) {
  return (
    <div className="flex">
      {ITEMS.map(({ key, label }, i) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="flex-1 py-3 text-[11px] font-semibold tracking-wider uppercase transition-colors relative"
          style={{
            borderRight: i < ITEMS.length - 1 ? '1px solid var(--border)' : undefined,
            color:       toggles[key] ? 'var(--text)' : 'var(--muted)',
          }}
        >
          {label}
          {toggles[key] && (
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full"
              style={{ background: 'var(--amber)' }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
