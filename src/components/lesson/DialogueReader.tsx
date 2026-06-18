'use client'

import { useState } from 'react'
import { DialogueResponse, Token, VocabItem } from '@/lib/types'
import { WordPopup } from './WordPopup'

interface Props {
  dialogue: DialogueResponse
  showHints: boolean
}

function tokenize(phrase: string, vocab: VocabItem[]): Token[] {
  const tokens: Token[] = []
  let remaining = phrase

  while (remaining.length > 0) {
    let matched = false
    for (const v of vocab) {
      if (remaining.startsWith(v.forma)) {
        tokens.push({ text: v.forma, vocab: v, isVocab: true })
        remaining = remaining.slice(v.forma.length)
        matched = true
        break
      }
    }
    if (!matched) {
      const last = tokens[tokens.length - 1]
      if (last && !last.isVocab) {
        last.text += remaining[0]
      } else {
        tokens.push({ text: remaining[0], vocab: null, isVocab: false })
      }
      remaining = remaining.slice(1)
    }
  }

  return tokens
}

export function DialogueReader({ dialogue, showHints }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const tokens = tokenize(dialogue.frase_completa_jp, dialogue.vocabulario_desglosado)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 justify-center items-end">
        {tokens.map((token, i) => (
          <div key={i} className="relative flex flex-col items-center">
            {showHints && token.vocab && (
              <span className="text-[#a78bfa] text-[10px] leading-none mb-0.5 whitespace-nowrap">
                {token.vocab.lectura}
              </span>
            )}
            <button
              onClick={() => {
                if (!token.isVocab) return
                setActiveIdx(activeIdx === i ? null : i)
              }}
              className={`text-3xl sm:text-4xl leading-none transition-colors ${
                token.isVocab
                  ? 'text-slate-100 hover:text-[#a78bfa] cursor-pointer'
                  : 'text-slate-300 cursor-default'
              } ${activeIdx === i ? 'text-[#a78bfa]' : ''}`}
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            >
              {token.text}
            </button>
            {activeIdx === i && token.vocab && (
              <WordPopup vocab={token.vocab} onClose={() => setActiveIdx(null)} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1">
        {dialogue.vocabulario_desglosado.map((v, i) => (
          <button
            key={i}
            onClick={() => {
              const idx = tokens.findIndex(t => t.vocab?.forma === v.forma)
              setActiveIdx(activeIdx === idx ? null : idx)
            }}
            className="w-full text-left px-3 py-2 rounded-lg border border-[#2d2d44] hover:border-[#7c3aed]/40 transition-colors group"
          >
            <span className="text-[#a78bfa] font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
              {v.forma}
            </span>
            <span className="text-slate-500 text-xs ml-2">{v.lectura}</span>
            <span className="text-slate-400 text-sm ml-2 group-hover:text-slate-200 transition-colors">
              — {v.significado}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
