'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  character: string
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

interface CharState {
  char: string
  svgContent: string | null
  loading: boolean
  error: boolean
}

function AnimatedStroke({ svgContent, char }: { svgContent: string; char: string }) {
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

    const strokeGroup = svg.querySelector('[id^="kvg:StrokePaths"]')
    if (strokeGroup) {
      (strokeGroup as SVGElement).style.stroke = '#a78bfa'
      ;(strokeGroup as SVGElement).style.strokeWidth = '4'
    }

    const paths = Array.from(svg.querySelectorAll('path'))
    paths.forEach(path => {
      const len = (path as SVGPathElement).getTotalLength?.() ?? 200
      path.style.strokeDasharray = `${len}`
      path.style.strokeDashoffset = `${len}`
      path.style.fill = 'none'
      path.style.stroke = '#a78bfa'
      path.style.strokeLinecap = 'round'
      path.style.strokeLinejoin = 'round'
      path.style.strokeWidth = '4'
    })

    container.innerHTML = ''
    container.appendChild(svg)

    let delay = 0
    paths.forEach(path => {
      const len = (path as SVGPathElement).getTotalLength?.() ?? 200
      const duration = Math.max(400, len * 4)
      setTimeout(() => {
        path.style.transition = `stroke-dashoffset ${duration}ms ease-in-out`
        path.style.strokeDashoffset = '0'
      }, delay)
      delay += duration + 100
    })
  }, [svgContent])

  return (
    <div
      ref={containerRef}
      className="w-[120px] h-[120px] flex items-center justify-center"
      title={char}
    />
  )
}

export function StrokeAnimator() {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [chars, setChars] = useState<CharState[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setSubmitted(text)

    const charList: CharState[] = [...text].map(c => ({
      char: c,
      svgContent: null,
      loading: isKanji(c),
      error: false,
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
        if (!res.ok) throw new Error('Not found')
        const svg = await res.text()
        setChars(prev => prev.map((x, idx) => idx === i ? { ...x, svgContent: svg, loading: false } : x))
      } catch {
        setChars(prev => prev.map((x, idx) => idx === i ? { ...x, loading: false, error: true } : x))
      }
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="日本語を入力... (p.ej: 漢字, 日本語)"
          className="flex-1 bg-[#12121a] border border-[#2d2d44] rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-[#7c3aed]/60 transition-colors"
          style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] active:scale-95 transition-all"
        >
          Animar
        </button>
      </form>

      {chars.length > 0 && (
        <div className="flex flex-wrap gap-4 justify-center">
          {chars.map((cs, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              {isKanji(cs.char) ? (
                <div className="w-[120px] h-[120px] bg-[#12121a] border border-[#2d2d44] rounded-xl flex items-center justify-center overflow-hidden">
                  {cs.loading && (
                    <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
                  )}
                  {cs.error && (
                    <span className="text-slate-500 text-xs text-center px-2">Sin datos para este kanji</span>
                  )}
                  {cs.svgContent && <AnimatedStroke svgContent={cs.svgContent} char={cs.char} />}
                </div>
              ) : (
                <div className="w-[120px] h-[120px] bg-[#12121a] border border-[#2d2d44]/50 rounded-xl flex items-center justify-center">
                  <span
                    className={`text-5xl ${isKana(cs.char) ? 'text-[#a78bfa]' : 'text-slate-400'}`}
                    style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                  >
                    {cs.char}
                  </span>
                </div>
              )}
              <span className="text-xs text-slate-500" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                {cs.char}
              </span>
            </div>
          ))}
        </div>
      )}

      {!submitted && (
        <p className="text-center text-slate-600 text-sm">
          Introduce un kanji, palabra o frase para ver el orden de trazos animado
        </p>
      )}
    </div>
  )
}
