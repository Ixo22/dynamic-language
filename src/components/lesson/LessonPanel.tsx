'use client'

import { useState, useEffect, useCallback } from 'react'
import { DialogueResponse, UIToggles, JLPTLevel } from '@/lib/types'
import { ToggleBar } from './ToggleBar'
import { DialogueReader } from './DialogueReader'
import { SRSButtons } from './SRSButtons'
import { InputPractice } from './InputPractice'
import { StrokeAnimator } from '@/components/stroke/StrokeAnimator'
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck'
import { SituacionSelector } from '@/components/situaciones/SituacionSelector'
import { addVocab } from '@/lib/vocab-store'

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

type Tab = 'lesson' | 'situaciones' | 'cards' | 'stroke'
const TABS: [Tab, string, string][] = [
  ['lesson',      'Lección',      '読'],
  ['situaciones', 'Situaciones',  '場'],
  ['cards',       'Tarjetas',     '語'],
  ['stroke',      'Trazos',       '書'],
]

export function LessonPanel() {
  const [tab, setTab]               = useState<Tab>('lesson')
  const [toggles, setToggles]       = useState<UIToggles>(DEFAULT_TOGGLES)
  const [level, setLevel]           = useState<JLPTLevel>('A1')
  const [dialogue, setDialogue]     = useState<DialogueResponse | null>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [revealed, setRevealed]     = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

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
      const data = await res.json()
      addVocab(data.vocabulario_desglosado)
      setDialogue(data)
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

  function switchTab(t: Tab) {
    setTab(t)
    setDrawerOpen(false)
  }

  const activeLabel = TABS.find(([t]) => t === tab)?.[1] ?? ''

  return (
    /*
     * Outer shell: position:fixed + inset:0 = covers the entire screen pixel-perfect.
     * The navbar is a plain flex item inside this shell — it never scrolls because
     * the shell itself doesn't scroll. The content area is the only thing that scrolls,
     * contained inside its own overflow-y:auto sibling. No z-index battles needed.
     */
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', color: 'var(--text)',
    }}>

      {/* ─── Overlay móvil (viewport-fixed, no ancestors with transform) ─── */}
      <div
        className="fixed inset-0 md:hidden transition-all duration-300"
        style={{
          zIndex: 200,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(3px)',
          pointerEvents: drawerOpen ? 'auto' : 'none',
          opacity: drawerOpen ? 1 : 0,
        }}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ─── Drawer móvil ─── */}
      <div
        className="fixed top-0 left-0 h-full md:hidden flex flex-col"
        style={{
          zIndex: 201,
          width: 280,
          background: '#0d0b08',
          borderRight: '1px solid var(--border)',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: drawerOpen ? '8px 0 40px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center jp font-black text-[13px] select-none sway"
              style={{ background: 'var(--red)', color: '#f5ede0', borderRadius: 4 }}>語</div>
            <div>
              <p className="jp font-bold text-base leading-none" style={{ color: 'var(--text)' }}>動的言語</p>
              <p className="text-[9px] tracking-[0.12em] uppercase mt-0.5" style={{ color: 'var(--muted)' }}>Japonés real</p>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center transition-colors text-lg"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >✕</button>
        </div>

        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-[8px] tracking-[0.3em] uppercase mb-2.5 font-semibold" style={{ color: 'var(--muted)' }}>Nivel</p>
          <div className="flex gap-2">
            {(['A1', 'A2'] as JLPTLevel[]).map(l => (
              <button key={l} onClick={() => handleLevel(l)}
                className="flex-1 py-2 text-sm font-bold transition-all"
                style={level === l
                  ? { background: 'var(--amber)', color: '#0d0b08', borderRadius: 3 }
                  : { border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 3 }
                }>{l} · {LEVEL_LABELS[l]}</button>
            ))}
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {TABS.map(([t, label, glyph], i) => (
            <button key={t} onClick={() => switchTab(t)}
              className="flex items-center gap-3 px-3 py-3.5 text-sm font-semibold transition-all pop-in"
              style={{
                animationDelay: `${i * 50}ms`,
                borderRadius: 3,
                color: tab === t ? 'var(--amber)' : 'var(--muted)',
                background: tab === t ? 'rgba(196,125,23,0.08)' : 'transparent',
                borderLeft: `2px solid ${tab === t ? 'var(--amber)' : 'transparent'}`,
              }}
              onMouseEnter={e => { if (tab !== t) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              onMouseLeave={e => { if (tab !== t) e.currentTarget.style.background = 'transparent' }}
            >
              <span className="jp w-5 text-center shrink-0 opacity-60" style={{ fontSize: 15 }}>{glyph}</span>
              <span className="flex-1">{label}</span>
              {tab === t && <span className="text-[8px] tracking-widest uppercase opacity-60">Activo</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* ─── Navbar — plain flex item, never scrolls ─── */}
      <div style={{ flexShrink: 0, background: '#0d0b08', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex flex-col justify-center gap-1.5 w-8 h-8 md:hidden shrink-0"
              onClick={() => setDrawerOpen(o => !o)} aria-label="Menú">
              <span className="block h-px w-5" style={{ background: 'var(--muted)' }} />
              <span className="block h-px w-3.5 ml-0.5" style={{ background: 'var(--muted)', opacity: 0.6 }} />
              <span className="block h-px w-5" style={{ background: 'var(--muted)' }} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 flex items-center justify-center jp font-black text-[11px] shrink-0 select-none sway"
                style={{ background: 'var(--red)', color: '#f5ede0', borderRadius: 3 }}>語</div>
              <div className="hidden sm:block">
                <h1 className="jp font-bold text-base leading-none" style={{ color: 'var(--text)' }}>動的言語</h1>
                <p className="text-[8px] tracking-[0.15em] uppercase" style={{ color: 'var(--muted)' }}>Japonés real</p>
              </div>
            </div>
          </div>

          {/* Tabs — desktop centrado */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {TABS.map(([t, label]) => (
              <button key={t} onClick={() => switchTab(t)}
                className="relative px-4 py-1.5 text-sm font-semibold transition-all"
                style={{
                  borderRadius: 3,
                  color: tab === t ? 'var(--amber)' : 'var(--muted)',
                  background: tab === t ? 'rgba(196,125,23,0.08)' : 'transparent',
                }}
                onMouseEnter={e => { if (tab !== t) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { if (tab !== t) e.currentTarget.style.background = 'transparent' }}
              >
                {label}
                {tab === t && (
                  <span className="absolute -bottom-[14px] left-2 right-2 h-[2px]"
                    style={{ background: 'var(--amber)', borderRadius: '2px 2px 0 0' }} />
                )}
              </button>
            ))}
          </nav>

          {/* Nivel (desktop) / tab activo (móvil) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-1 p-1"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 3 }}>
              {(['A1', 'A2'] as JLPTLevel[]).map(l => (
                <button key={l} onClick={() => handleLevel(l)}
                  className="px-2.5 py-0.5 text-xs font-bold transition-all"
                  style={level === l
                    ? { background: 'var(--amber)', color: '#0d0b08', borderRadius: 2 }
                    : { color: 'var(--muted)' }
                  }>{l}</button>
              ))}
            </div>
            <span className="md:hidden text-[10px] tracking-[0.2em] uppercase font-semibold"
              style={{ color: 'var(--amber)' }}>{activeLabel}</span>
          </div>
        </div>
      </div>

      {/* ─── ToggleBar sticky móvil — fuera del scroll, oculto en desktop ─── */}
      {tab === 'lesson' && (
        <div className="md:hidden" style={{ flexShrink: 0, background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <ToggleBar toggles={toggles} onChange={handleToggle} />
        </div>
      )}

      {/* ─── Área de scroll — todo el contenido aquí abajo ─── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <main className="max-w-lg md:max-w-2xl mx-auto w-full pb-6">

          {tab === 'lesson' && (
            <div key="lesson" className="flex flex-col fade-up">
              {/* ToggleBar en desktop — dentro del scroll, comportamiento original */}
              <div className="hidden md:block" style={{ borderBottom: '1px solid var(--border)' }}>
                <ToggleBar toggles={toggles} onChange={handleToggle} />
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center gap-5 py-32">
                  <span className="jp font-black kanji-pulse select-none" style={{ fontSize: '5rem', color: 'var(--text)', lineHeight: 1 }}>言</span>
                  <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--muted)' }}>Generando frase</p>
                </div>
              )}
              {error && !loading && (
                <div className="px-5 pt-10"><p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p></div>
              )}
              {dialogue && !loading && (
                <div className="fade-up">
                  <div className="px-5 pt-6 flex items-center gap-3 slide-right">
                    <span className="shrink-0 text-[9px] tracking-[0.25em] uppercase font-semibold px-2 py-0.5"
                      style={{ color: '#0d0b08', background: 'var(--muted)', borderRadius: 2 }}>
                      {level} · {LEVEL_LABELS[level]}
                    </span>
                    <p className="text-xs italic leading-snug" style={{ color: 'var(--muted)' }}>{dialogue.contexto_escena}</p>
                  </div>
                  {audioOnlyMode && !revealed && (
                    <div className="px-5 pt-4 pb-2">
                      <span className="text-[9px] tracking-[0.25em] uppercase px-2 py-0.5"
                        style={{ background: 'rgba(196,125,23,0.12)', color: 'var(--amber)', borderRadius: 2 }}>
                        Modo escucha — intenta entender
                      </span>
                    </div>
                  )}
                  <div className="px-5">
                    <DialogueReader dialogue={dialogue} showHints={toggles.showHints}
                      showText={audioOnlyMode ? revealed : toggles.showText} showAudio={toggles.showAudio} />
                  </div>
                  {audioOnlyMode && !revealed && (
                    <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      <button onClick={() => setRevealed(true)}
                        className="w-full py-3 text-sm font-semibold transition-colors"
                        style={{ border: '1px solid var(--amber)', borderRadius: 3, color: 'var(--amber)', background: 'rgba(196,125,23,0.06)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,125,23,0.12)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(196,125,23,0.06)')}
                      >¿Quieres ver la frase y la traducción?</button>
                    </div>
                  )}
                  {toggles.showInput && (
                    <div className="px-5 py-5" style={{ borderTop: '1px solid var(--border)' }}>
                      <InputPractice target={dialogue.frase_completa_jp} vocab={dialogue.vocabulario_desglosado} />
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="px-5 pt-5 text-[10px] tracking-[0.25em] uppercase text-center mb-1" style={{ color: 'var(--muted)' }}>¿Entendiste la frase?</p>
                    <SRSButtons phrase={dialogue.frase_completa_jp} />
                  </div>
                </div>
              )}

              <button onClick={fetchDialogue} disabled={loading}
                className="group flex items-center justify-between w-full px-5 py-4 transition-colors border-pulse"
                style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
              >
                <span className="text-[11px] tracking-[0.2em] uppercase">{loading ? 'Cargando...' : 'Ver otra frase'}</span>
                <span className="text-base group-hover:translate-x-1 transition-transform inline-block">→</span>
              </button>
            </div>
          )}

          {tab === 'situaciones' && (
            <div key="situaciones" className="fade-up">
              <SituacionSelector />
            </div>
          )}

          {tab === 'cards' && (
            <div key="cards" className="fade-up">
              <FlashcardDeck />
            </div>
          )}

          {tab === 'stroke' && (
            <div key="stroke" className="p-5 fade-up">
              <div className="p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
                <StrokeAnimator />
              </div>
            </div>
          )}

        </main>

        {/* ─── Footer ─── */}
        <footer className="max-w-lg md:max-w-2xl mx-auto w-full px-5 py-10 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 flex items-center justify-center jp font-black text-[10px] select-none"
                style={{ background: 'var(--red)', color: '#f5ede0', borderRadius: 3, opacity: 0.7 }}>語</div>
              <div>
                <p className="jp font-bold text-sm leading-none" style={{ color: 'var(--muted)' }}>動的言語</p>
                <p className="text-[9px] tracking-[0.15em] uppercase mt-0.5" style={{ color: 'var(--muted)', opacity: 0.5 }}>Dynamic Language</p>
              </div>
            </div>
            <p className="text-[9px] tracking-[0.15em] text-right" style={{ color: 'var(--muted)', opacity: 0.4 }}>
              Japonés real<br />para hispanohablantes
            </p>
          </div>
          <p className="text-[8px] tracking-[0.2em] uppercase mt-6 text-center" style={{ color: 'var(--muted)', opacity: 0.25 }}>
            © {new Date().getFullYear()} Dynamic Language
          </p>
        </footer>

      </div>
    </div>
  )
}
