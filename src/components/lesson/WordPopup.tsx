'use client'

import { VocabItem } from '@/lib/types'

interface Props {
  vocab: VocabItem
  onClose: () => void
}

export function WordPopup({ vocab, onClose }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 pointer-events-none">
        <div className="bg-[#1a1a2e] border border-[#7c3aed]/50 rounded-xl p-3 shadow-2xl shadow-[#7c3aed]/20">
          <p className="text-[#a78bfa] text-lg font-bold text-center leading-tight">{vocab.forma}</p>
          <p className="text-slate-400 text-xs text-center mt-0.5">{vocab.lectura}</p>
          <div className="border-t border-[#7c3aed]/20 mt-2 pt-2">
            <p className="text-slate-200 text-sm text-center">{vocab.significado}</p>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#7c3aed]/50" />
        </div>
      </div>
    </>
  )
}
