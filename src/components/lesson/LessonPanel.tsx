'use client'

import { useState, useEffect, useCallback } from 'react'
import { DialogueResponse, UIToggles, JLPTLevel } from '@/lib/types'
import { ToggleBar } from './ToggleBar'
import { DialogueReader } from './DialogueReader'
import { SRSButtons } from './SRSButtons'
import { InputPractice } from './InputPractice'
import { StrokeAnimator } from '@/components/stroke/StrokeAnimator'

const TOGGLES_KEY = 'dl_toggles'
const LEVEL_KEY   = 'dl_level'

const DEFAULT_TOGGLES: UIToggles = {
  showAudio: true,
  showText:  true,
  showInput: false,
  showHints: true,
}

const LEVEL_LABELS: Record<JLPTLevel, string> = {
  A1: 'Principiante',
  A2: 'Elemental',
}

type Tab = 'lesson' | 'stroke'

export function LessonPanel() {
  const [tab, setTab]           = useState<Tab>('lesson')
  const [toggles, setToggles]   = useState<UIToggles>(DEFAULT_TOGGLES)
  const [level, setLevel]       = useState<JLPTLevel>('A1')
  const [dialogue, setDialogue] = useState<DialogueResponse | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ level, exclude: dialogue?.frase_completa_jp }),
      })
      if (!res.ok) throw new Error()
      setDialogue(await res.json())
    } catch {
      setError('No se pudo generar el diálogo. Comprueba tu API key.')
    } finally {
      setLoading(false)
    }
  }, [level])

  useEffect(() => { fetchDialogue() }, [])

  const audioOnlyMode = toggles.showAudio && !toggles.showText && !toggles.showInput && !toggles.showHints
  useEffect(() => { setRevealed(false) }, [dialogue])

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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ─── Cabecera ─── */}
      <header className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center jp font-black text-[11px] shrink-0 select-none" style={{ background: 'var(--red)', color: '#f5ede0', borderRadius: 3 }}>語</div>
          <div>
            <h1 className="jp font-bold text-base leading-none" style={{ color: 'var(--text)' }}>動的言語</h1>
            <p className="text-[9px] tracking-[0.12em] uppercase mt-0.5" style={{ color: 'var(--muted)' }}>Japonés real</p>
          </div>
        </div>
        <div className="flex items-center gap-px">
          {(['A1', 'A2'] as JLPTLevel[]).map(l => (
            <button key={l} onClick={() => handleLevel(l)} className="px-3 py-1 text-xs font-semibold transition-all"
              style={level === l ? { background: 'var(--amber)', color: 'var(--bg)', borderRadius: 3 } : { color: 'var(--muted)' }}>
              {l}
            </button>
          ))}
        </div>
      </header>

      {/* ─── Pestañas ─── */}
      <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
        {([['lesson', 'Lección'], ['stroke', 'Trazos']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className="px-5 py-3 text-sm font-semibold relative transition-colors" style={{ color: tab === t ? 'var(--text)' : 'var(--muted)' }}>
            {label}
            {tab === t && <span className="absolute bottom-0 left-5 right-5 h-[2px]" style={{ background: 'var(--amber)', borderRadius: '2px 2px 0 0' }} />}
          </button>
        ))}
      </div>

      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {tab === 'lesson' && (
          <div className="flex flex-col flex-1">
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <ToggleBar toggles={toggles} onChange={handleToggle} />
            </div>
            <div className="flex-1">
              {loading && (
                <div className="flex flex-col items-center justify-center gap-5 py-32">
                  <span className="jp font-black kanji-pulse select-none" style={{ fontSize: '5rem', color: 'var(--text)', lineHeight: 1 }}>言</span>
                  <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--muted)' }}>Generando frase</p>
                </div>
              )}
              {error && !loading && <div className="px-5 pt-10"><p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p></div>}

              {dialogue && !loading && (
                <div className="fade-up">
                  <div className="px-5 pt-6 flex items-center gap-3">
                    <span className="shrink-0 text-[9px] tracking-[0.25em] uppercase font-semibold px-2 py-0.5" style={{ color: 'var(--bg)', background: 'var(--muted)', borderRadius: 2 }}>
                      {level} · {LEVEL_LABELS[level]}
                    </span>
                    <p className="text-xs italic leading-snug" style={{ color: 'var(--muted)' }}>{dialogue.contexto_escena}</p>
                  </div>

                  {/* Badge modo solo-audio */}
                  {audioOnlyMode && !revealed && (
                    <div className="px-5 pt-4 pb-2">
                      <span className="text-[9px] tracking-[0.25em] uppercase px-2 py-0.5" style={{ background: 'rgba(196,125,23,0.12)', color: 'var(--amber)', borderRadius: 2 }}>
                        Modo escucha — intenta entender
                      </span>
                    </div>
                  )}

                  <div className="px-5">
                    <DialogueReader
                      dialogue={dialogue}
                      showHints={toggles.showHints}
                      showText={audioOnlyMode ? revealed : toggles.showText}
                      showAudio={toggles.showAudio}
                    />
                  </div>

                  {/* Botón de revelación (solo en modo solo-audio) */}
                  {audioOnlyMode && !revealed && (
                    <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      <button
                        onClick={() => setRevealed(true)}
                        className="w-full py-3 text-sm font-semibold transition-colors"
                        style={{ border: '1px solid var(--amber)', borderRadius: 3, color: 'var(--amber)', background: 'rgba(196,125,23,0.06)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,125,23,0.12)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(196,125,23,0.06)')}
                      >
                        ¿Quieres ver la frase y la traducción?
                      </button>
                    </div>
                  )}

                  {toggles.showInput && (
                    <div className="px-5 py-5" style={{ borderTop: '1px solid var(--border)' }}>
                      <InputPractice target={dialogue.frase_completa_jp} />
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="px-5 pt-5 text-[10px] tracking-[0.25em] uppercase text-center mb-1" style={{ color: 'var(--muted)' }}>¿Entendiste la frase?</p>
                    <SRSButtons phrase={dialogue.frase_completa_jp} />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={fetchDialogue} disabled={loading}
              className="group flex items-center justify-between w-full px-5 py-4 transition-colors"
              style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              <span className="text-[11px] tracking-[0.2em] uppercase">{loading ? 'Cargando...' : 'Ver otra frase'}</span>
              <span className="text-base group-hover:translate-x-1 transition-transform inline-block">→</span>
            </button>
          </div>
        )}

        {tab === 'stroke' && (
          <div className="p-5">
            <div className="p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
              <StrokeAnimator />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
