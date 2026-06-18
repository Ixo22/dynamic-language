'use client'

import { useState, useEffect, useRef } from 'react'
import A1 from '@/lib/dialogues/A1.json'
import A2 from '@/lib/dialogues/A2.json'

/* ── Índice de vocabulario conocido ── */
type Entry = { vocabulario_desglosado: { forma: string; lectura: string; significado: string }[] }

const VOCAB_INDEX = ([...A1, ...A2] as Entry[])
  .flatMap(d => d.vocabulario_desglosado)
  .filter((v, i, arr) => arr.findIndex(x => x.forma === v.forma) === i)

function searchBySpanish(q: string) {
  if (q.trim().length < 2) return []
  const lower = q.toLowerCase()
  return VOCAB_INDEX.filter(v =>
    v.significado.toLowerCase().includes(lower) ||
    v.lectura.toLowerCase().includes(lower)
  ).slice(0, 6)
}

function isLatinInput(text: string): boolean {
  return text.trim().length >= 2 && !/[぀-ゟ゠-ヿ一-鿿]/.test(text)
}

function getKanjiVGUrl(char: string): string | null {
  const cp = char.codePointAt(0)
  if (!cp) return null
  const hex = cp.toString(16).padStart(5, '0')
  return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`
}

function isKanji(char: string): boolean {
  const cp = char.codePointAt(0) ?? 0
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
}

function isKana(char: string): boolean {
  const cp = char.codePointAt(0) ?? 0
  return (cp >= 0x3040 && cp <= 0x309f) || (cp >= 0x30a0 && cp <= 0x30ff)
}

type Speed = 'normal' | 'slow'

interface CharState {
  char:       string
  svgContent: string | null
  loading:    boolean
  error:      boolean
  replayKey:  number
}

/* ── Trazo animado ── */
function AnimatedStroke({ svgContent, char, speed, replayKey }: {
  svgContent: string
  char:       string
  speed:      Speed
  replayKey:  number
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')
    const svg = doc.querySelector('svg')
    if (!svg) return

    svg.setAttribute('width', '120')
    svg.setAttribute('height', '120')
    svg.setAttribute('viewBox', '0 0 109 109')

    const paths = Array.from(svg.querySelectorAll('path'))
    paths.forEach(path => {
      const len = (path as SVGPathElement).getTotalLength?.() ?? 200
      path.style.strokeDasharray  = `${len}`
      path.style.strokeDashoffset = `${len}`
      path.style.fill             = 'none'
      path.style.stroke           = '#c47d17'
      path.style.strokeLinecap    = 'round'
      path.style.strokeLinejoin   = 'round'
      path.style.strokeWidth      = '4'
    })

    container.innerHTML = ''
    container.appendChild(svg)

    const mult = speed === 'slow' ? 10 : 4
    let delay = 0
    paths.forEach(path => {
      const len      = (path as SVGPathElement).getTotalLength?.() ?? 200
      const duration = Math.max(500, len * mult)
      setTimeout(() => {
        path.style.transition       = `stroke-dashoffset ${duration}ms ease-in-out`
        path.style.strokeDashoffset = '0'
      }, delay)
      delay += duration + 120
    })
  }, [svgContent, speed, replayKey])

  return <div ref={containerRef} className="w-[120px] h-[120px] flex items-center justify-center" title={char} />
}

/* ── Componente principal ── */
export function StrokeAnimator() {
  const [input, setInput]       = useState('')
  const [submitted, setSubmitted] = useState('')
  const [chars, setChars]       = useState<CharState[]>([])
  const [speed, setSpeed]       = useState<Speed>('normal')

  const suggestions = isLatinInput(input) ? searchBySpanish(input) : []
  const showButton  = input.trim().length > 0 && !isLatinInput(input)

  async function animate(text: string) {
    const clean = text.trim()
    if (!clean) return
    setInput(clean)
    setSubmitted(clean)

    const charList: CharState[] = [...clean].map(c => ({
      char: c, svgContent: null, loading: isKanji(c), error: false, replayKey: 0,
    }))
    setChars(charList)

    for (let i = 0; i < charList.length; i++) {
      const c = charList[i].char
      if (!isKanji(c)) continue
      const url = getKanjiVGUrl(c)
      if (!url) {
        setChars(prev => prev.map((x, idx) => idx === i ? { ...x, loading: false, error: true } : x))
        continue
      }
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error()
        const svg = await res.text()
        setChars(prev => prev.map((x, idx) => idx === i ? { ...x, svgContent: svg, loading: false } : x))
      } catch {
        setChars(prev => prev.map((x, idx) => idx === i ? { ...x, loading: false, error: true } : x))
      }
    }
  }

  function replayChar(i: number) {
    setChars(prev => prev.map((c, idx) => idx === i ? { ...c, replayKey: c.replayKey + 1 } : c))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    animate(input)
  }

  return (
    <div className="space-y-5">

      {/* ── Input ── */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); if (chars.length) setChars([]) }}
          placeholder="日本語 o escribe en español para buscar..."
          className="jp flex-1 px-4 py-2.5 text-sm transition-colors"
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 3, color: 'var(--text)', outline: 'none',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
          onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        {showButton && (
          <button
            type="submit"
            className="px-4 py-2 text-sm font-bold transition-all"
            style={{ background: 'var(--amber)', color: '#0d0b08', borderRadius: 3, letterSpacing: '0.05em' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--amber-l)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--amber)')}
          >
            Animar →
          </button>
        )}
      </form>

      {/* ── Sugerencias por español ── */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-[8px] tracking-[0.3em] uppercase mb-2.5" style={{ color: 'var(--muted)' }}>
            Vocabulario que has visto
          </p>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((v, i) => (
              <button
                key={i}
                onClick={() => animate(v.forma)}
                className="vocab-card text-left px-3 py-3 transition-all"
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderLeft: '2px solid var(--amber)', borderRadius: 3,
                }}
              >
                <p className="text-[8px] tracking-widest mb-0.5" style={{ color: 'var(--muted)' }}>{v.lectura}</p>
                <p className="jp font-bold text-xl leading-none mb-1.5" style={{ color: 'var(--amber)' }}>{v.forma}</p>
                <p className="text-[10px] leading-snug" style={{ color: 'var(--text)', opacity: 0.7 }}>{v.significado}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Sin resultados ── */}
      {isLatinInput(input) && suggestions.length === 0 && (
        <p className="text-xs text-center py-4" style={{ color: 'var(--muted)' }}>
          No hay vocabulario coincidente en tu historial de estudio.
        </p>
      )}

      {/* ── Animación de trazos ── */}
      {chars.length > 0 && (
        <div>
          {/* Cabecera: texto + control de velocidad */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[8px] tracking-[0.3em] uppercase" style={{ color: 'var(--muted)' }}>{submitted}</p>
            <div className="flex items-center gap-px" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 3, padding: 2 }}>
              {(['normal', 'slow'] as Speed[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className="px-3 py-1 text-[10px] font-semibold transition-all"
                  style={speed === s
                    ? { background: 'var(--amber)', color: '#0d0b08', borderRadius: 2 }
                    : { color: 'var(--muted)' }
                  }
                >
                  {s === 'normal' ? 'Normal' : 'Lento'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {chars.map((cs, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className="w-[120px] h-[120px] flex items-center justify-center overflow-hidden transition-all"
                  style={{
                    background: 'var(--surface)',
                    border: `1px solid ${cs.svgContent ? 'var(--amber)' : 'var(--border)'}`,
                    borderRadius: 3,
                    cursor: cs.svgContent ? 'pointer' : 'default',
                  }}
                  onClick={() => cs.svgContent && replayChar(i)}
                  title={cs.svgContent ? 'Pulsa para repetir' : undefined}
                >
                  {isKanji(cs.char) ? (
                    <>
                      {cs.loading && (
                        <div className="w-5 h-5 rounded-full border-2 animate-spin"
                          style={{ borderColor: 'var(--amber)', borderTopColor: 'transparent' }} />
                      )}
                      {cs.error && (
                        <span className="text-xs text-center px-3 leading-snug" style={{ color: 'var(--muted)' }}>
                          Sin datos
                        </span>
                      )}
                      {cs.svgContent && (
                        <AnimatedStroke
                          svgContent={cs.svgContent}
                          char={cs.char}
                          speed={speed}
                          replayKey={cs.replayKey}
                        />
                      )}
                    </>
                  ) : (
                    <span className="jp text-5xl" style={{ color: isKana(cs.char) ? 'var(--amber)' : 'var(--text)' }}>
                      {cs.char}
                    </span>
                  )}
                </div>
                <span className="jp text-xs" style={{ color: 'var(--muted)' }}>{cs.char}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-[9px] mt-3 tracking-widest" style={{ color: 'var(--muted)', opacity: 0.5 }}>
            Pulsa un kanji para repetir su animación
          </p>
        </div>
      )}

      {/* ── Placeholder vacío ── */}
      {!submitted && chars.length === 0 && suggestions.length === 0 && !isLatinInput(input) && (
        <p className="text-center text-sm py-8" style={{ color: 'var(--muted)' }}>
          Escribe en japonés para ver los trazos animados,<br />
          o en español para buscar vocabulario conocido.
        </p>
      )}

    </div>
  )
}
