'use client'

import { useState, useEffect, useCallback } from 'react'
import { DialogueResponse, UIToggles, JLPTLevel } from '@/lib/types'
import { ToggleBar } from './ToggleBar'
import { DialogueReader } from './DialogueReader'
import { SRSButtons } from './SRSButtons'
import { AudioPlayer } from './AudioPlayer'
import { InputPractice } from './InputPractice'
import { StrokeAnimator } from '@/components/stroke/StrokeAnimator'

const TOGGLES_KEY = 'dl_toggles'
const LEVEL_KEY = 'dl_level'

const DEFAULT_TOGGLES: UIToggles = {
  showAudio: true,
  showText: true,
  showInput: false,
  showHints: true,
}

type Tab = 'lesson' | 'stroke'

export function LessonPanel() {
  const [tab, setTab] = useState<Tab>('lesson')
  const [toggles, setToggles] = useState<UIToggles>(DEFAULT_TOGGLES)
  const [level, setLevel] = useState<JLPTLevel>('A1')
  const [dialogue, setDialogue] = useState<DialogueResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TOGGLES_KEY)
      if (saved) setToggles(JSON.parse(saved))
      const savedLevel = localStorage.getItem(LEVEL_KEY) as JLPTLevel | null
      if (savedLevel) setLevel(savedLevel)
    } catch {}
  }, [])

  const fetchDialogue = useCallback(async () => {
    setLoading(true)
    setError(null)
    setDialogue(null)
    try {
      const res = await fetch('/api/generate-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, exclude: dialogue?.frase_completa_jp }),
      })
      if (!res.ok) throw new Error('Error generando diálogo')
      const data = await res.json()
      setDialogue(data)
    } catch (e) {
      setError('No se pudo generar el diálogo. Comprueba tu API key.')
    } finally {
      setLoading(false)
    }
  }, [level])

  useEffect(() => { fetchDialogue() }, [])

  function handleToggle(key: keyof UIToggles) {
    setToggles(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem(TOGGLES_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function handleLevel(l: JLPTLevel) {
    setLevel(l)
    try { localStorage.setItem(LEVEL_KEY, l) } catch {}
  }

  return (
    <div className="min-h-screen bg-[#080810] text-slate-200 flex flex-col">
      <header className="border-b border-[#1e1e2e] px-4 py-3 flex items-center justify-between">
        <h1 className="text-[#a78bfa] font-bold text-lg tracking-tight">動的言語</h1>
        <div className="flex gap-1">
          {(['A1', 'A2'] as JLPTLevel[]).map(l => (
            <button
              key={l}
              onClick={() => handleLevel(l)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                level === l
                  ? 'bg-[#7c3aed] text-white'
                  : 'text-slate-500 hover:text-slate-300 border border-[#2d2d44]'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <div className="border-b border-[#1e1e2e] flex">
        {([['lesson', '📚 Lección'], ['stroke', '✍️ Trazos']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t
                ? 'text-[#a78bfa] border-b-2 border-[#7c3aed]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-6">
        {tab === 'lesson' && (
          <>
            <ToggleBar toggles={toggles} onChange={handleToggle} />

            {loading && (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Generando diálogo...</p>
              </div>
            )}

            {error && (
              <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 text-rose-400 text-sm text-center">
                {error}
              </div>
            )}

            {dialogue && !loading && (
              <div className="space-y-5">
                <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest">Escena</p>
                  <p className="text-slate-400 text-sm italic">{dialogue.contexto_escena}</p>
                </div>

                <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 space-y-4">
                  <DialogueReader dialogue={dialogue} showHints={toggles.showHints} />

                  {toggles.showText && (
                    <p className="text-slate-400 text-sm text-center border-t border-[#1e1e2e] pt-3 italic">
                      {dialogue.frase_es}
                    </p>
                  )}

                  {toggles.showAudio && (
                    <div className="flex justify-center pt-1">
                      <AudioPlayer text={dialogue.frase_completa_jp} />
                    </div>
                  )}
                </div>

                {toggles.showInput && (
                  <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4">
                    <InputPractice target={dialogue.frase_completa_jp} />
                  </div>
                )}

                <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4">
                  <p className="text-xs text-slate-600 text-center mb-3 uppercase tracking-widest">Repetición Espaciada</p>
                  <SRSButtons phrase={dialogue.frase_completa_jp} />
                </div>
              </div>
            )}

            <button
              onClick={fetchDialogue}
              disabled={loading}
              className="w-full py-3 rounded-xl border border-[#2d2d44] text-slate-400 text-sm hover:border-[#7c3aed]/50 hover:text-[#a78bfa] transition-all disabled:opacity-40 active:scale-[0.98]"
            >
              Nueva frase →
            </button>
          </>
        )}

        {tab === 'stroke' && (
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <StrokeAnimator />
          </div>
        )}
      </main>
    </div>
  )
}
