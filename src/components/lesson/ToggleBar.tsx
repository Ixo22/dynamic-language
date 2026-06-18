'use client'

import { UIToggles } from '@/lib/types'

interface Props {
  toggles: UIToggles
  onChange: (key: keyof UIToggles) => void
}

const ITEMS: { key: keyof UIToggles; label: string; icon: string }[] = [
  { key: 'showAudio', label: 'Audio', icon: '🔊' },
  { key: 'showText', label: 'Texto', icon: '📖' },
  { key: 'showInput', label: 'Input', icon: '✏️' },
  { key: 'showHints', label: 'Pistas', icon: '💡' },
]

export function ToggleBar({ toggles, onChange }: Props) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {ITEMS.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
            toggles[key]
              ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/30'
              : 'bg-transparent border-[#2d2d44] text-slate-400 hover:border-[#7c3aed]/50 hover:text-slate-200'
          }`}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
