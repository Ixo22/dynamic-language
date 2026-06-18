'use client'

import { useState, useEffect, useRef } from 'react'
import { DEMO_DIALOGUES } from '@/lib/demo-data'
import { DialogueResponse, UIToggles } from '@/lib/types'
import { addVocab } from '@/lib/vocab-store'
import { ToggleBar } from '@/components/lesson/ToggleBar'
import { DialogueReader } from '@/components/lesson/DialogueReader'
import { InputPractice } from '@/components/lesson/InputPractice'
import { StrokeAnimator } from '@/components/stroke/StrokeAnimator'
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck'
import { SituacionSelector } from '@/components/situaciones/SituacionSelector'

const DEFAULT_TOGGLES: UIToggles = {
  showAudio: true,
  showText:  true,
  showInput: false,
  showHints: true,
}

type Tab = 'lesson' | 'situaciones' | 'cards' | 'stroke'
const TABS: [Tab, string, string][] = [
  ['lesson',      'Lección',      '読'],
  ['situaciones', 'Situaciones',  '場'],
  ['cards',       'Tarjetas',     '語'],
  ['stroke',      'Trazos',       '書'],
]

export function DemoPanel() {
  const [tab, setTab]         = useState<Tab>('lesson')
  const [toggles, setToggles] = useState<UIToggles>(DEFAULT_TOGGLES)
  const [idx, setIdx]         = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const dialogue: DialogueResponse = DEMO_DIALOGUES[idx]
  const seeded = useRef(false)

  /* Precarga todo el vocabulario demo en localStorage para las Tarjetas */
  useEffect(() => {
    if (seeded.current) return
    seeded.current = true
    addVocab(DEMO_DIALOGUES.flatMap(d => d.vocabulario_desglosado))
  }, [])

  function next() { setIdx(i => (i + 1) % DEMO_DIALOGUES.length) }
  function switchTab(t: Tab) { setTab(t); setDrawerOpen(false) }

  const activeLabel = TABS.find(([t]) => t === tab)?.[1] ?? ''

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', color: 'var(--text)',
    }}>

      {/* ── Overlay móvil ── */}
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

      {/* ── Drawer móvil ── */}
      <div
        className="fixed top-0 left-0 h-full md:hidden flex flex-col"
        style={{
          zIndex: 201, width: 280,
          background: '#0d0b08',
          borderRight: '1px solid var(--border)',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.32s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: drawerOpen ? '8px 0 40px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center jp font-black text-[13px] select-none sway"
              style={{ background: 'var(--red)', color: '#f5ede0', borderRadius: 4 }}>語</div>
            <div>
              <p className="jp font-bold text-base leading-none" style={{ color: 'var(--text)' }}>動的言語</p>
              <span className="text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 font-bold"
                style={{ background: 'rgba(196,125,23,0.15)', color: 'var(--amber)', borderRadius: 2 }}>DEMO</span>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-lg"
            style={{ color: 'var(--muted)' }}>✕</button>
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
            >
              <span className="jp w-5 text-center shrink-0 opacity-60" style={{ fontSize: 15 }}>{glyph}</span>
              <span className="flex-1">{label}</span>
              {tab === t && <span className="text-[8px] tracking-widest uppercase opacity-60">Activo</span>}
            </button>
          ))}
        </nav>

        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--muted)', opacity: 0.5 }}>
            Modo demo · sin cuenta
          </p>
        </div>
      </div>

      {/* ── Navbar ── */}
      <div style={{ flexShrink: 0, background: '#0d0b08', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

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
                <div className="flex items-center gap-2">
                  <h1 className="jp font-bold text-base leading-none" style={{ color: 'var(--text)' }}>動的言語</h1>
                  <span className="text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 font-bold"
                    style={{ background: 'rgba(196,125,23,0.15)', color: 'var(--amber)', borderRadius: 2 }}>DEMO</span>
                </div>
                <p className="text-[8px] tracking-[0.15em] uppercase" style={{ color: 'var(--muted)' }}>Japonés real</p>
              </div>
            </div>
          </div>

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

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-[9px] tracking-[0.2em] uppercase px-2 py-1 font-bold"
              style={{ background: 'rgba(196,125,23,0.1)', color: 'var(--amber)', border: '1px solid rgba(196,125,23,0.25)', borderRadius: 3 }}>
              DEMO
            </span>
            <span className="md:hidden text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: 'var(--amber)' }}>
              {activeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── ToggleBar sticky en móvil ── */}
      {tab === 'lesson' && (
        <div className="togglebar-sticky" style={{ borderBottom: '1px solid var(--border)' }}>
          <ToggleBar toggles={toggles} onChange={key => setToggles(p => ({ ...p, [key]: !p[key] }))} />
        </div>
      )}

      {/* ── Scroll ── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <main className="max-w-lg md:max-w-2xl mx-auto w-full pb-6">

          {tab === 'lesson' && (
            <div key="lesson" className="flex flex-col fade-up">
              <div className="hidden md:block" style={{ borderBottom: '1px solid var(--border)' }}>
                <ToggleBar toggles={toggles} onChange={key => setToggles(p => ({ ...p, [key]: !p[key] }))} />
              </div>

              <div className="fade-up">
                <div className="px-5 pt-6 flex items-center gap-3 slide-right">
                  <span className="shrink-0 text-[9px] tracking-[0.25em] uppercase font-semibold px-2 py-0.5"
                    style={{ color: '#0d0b08', background: 'var(--muted)', borderRadius: 2 }}>
                    {idx + 1} / {DEMO_DIALOGUES.length}
                  </span>
                  <p className="text-xs italic leading-snug" style={{ color: 'var(--muted)' }}>{dialogue.contexto_escena}</p>
                </div>
                <div className="px-5">
                  <DialogueReader
                    dialogue={dialogue}
                    showHints={toggles.showHints}
                    showText={toggles.showText}
                    showAudio={toggles.showAudio}
                  />
                </div>
                {toggles.showInput && (
                  <div className="px-5 py-5" style={{ borderTop: '1px solid var(--border)' }}>
                    <InputPractice target={dialogue.frase_completa_jp} vocab={dialogue.vocabulario_desglosado} />
                  </div>
                )}
                {/* Demo stub SRS — no guarda en BDD */}
                <div className="px-5 py-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--muted)' }}>
                    El progreso SRS se guarda con cuenta
                  </p>
                  <a href="/login"
                    className="inline-block mt-2 text-xs font-semibold transition-colors"
                    style={{ color: 'var(--amber)' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Crear cuenta gratis →
                  </a>
                </div>
              </div>

              <button onClick={next}
                className="group flex items-center justify-between w-full px-5 py-4 transition-colors border-pulse"
                style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
              >
                <span className="text-[11px] tracking-[0.2em] uppercase">Ver siguiente frase</span>
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

        {/* Footer */}
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
            <a href="/login"
              className="text-xs font-semibold transition-colors px-3 py-2"
              style={{ border: '1px solid var(--amber)', color: 'var(--amber)', borderRadius: 3 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,125,23,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Crear cuenta →
            </a>
          </div>
          <p className="text-[8px] tracking-[0.2em] uppercase mt-6 text-center" style={{ color: 'var(--muted)', opacity: 0.25 }}>
            © {new Date().getFullYear()} Dynamic Language · Modo demo
          </p>
        </footer>
      </div>
    </div>
  )
}
