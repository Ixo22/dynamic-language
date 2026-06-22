export interface StoredVocab {
  forma:       string
  lectura:     string
  significado: string
  level?:      string
}

export interface VocabSRS {
  interval_days: number
  ease_factor:   number
  next_review:   string
}

const VOCAB_KEY     = 'dl_vocab_seen'
const SRS_KEY       = 'dl_vocab_srs'
const FORGOTTEN_KEY = 'dl_vocab_forgotten'

function getForgottenFormas(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(FORGOTTEN_KEY) ?? '[]'))
  } catch { return new Set() }
}

export function syncForgottenFromDB(): void {
  fetch('/api/vocab/forget')
    .then(r => r.json())
    .then(({ forgotten }: { forgotten: string[] }) => {
      if (!Array.isArray(forgotten)) return
      const existing = getForgottenFormas()
      forgotten.forEach(f => existing.add(f))
      localStorage.setItem(FORGOTTEN_KEY, JSON.stringify([...existing]))
    })
    .catch(() => {})
}

export function addVocab(
  items: { forma: string; lectura: string; significado: string }[],
  level?: string,
  fromLesson = false
): void {
  if (typeof window === 'undefined') return
  try {
    const forgotten = getForgottenFormas()
    const toUnforget: string[] = []
    const map = new Map(getVocab().map(v => [v.forma, v]))
    items.forEach(v => {
      if (fromLesson || !forgotten.has(v.forma)) {
        map.set(v.forma, { ...v, ...(level ? { level } : {}) })
        if (fromLesson && forgotten.has(v.forma)) {
          forgotten.delete(v.forma)
          toUnforget.push(v.forma)
        }
      }
    })
    if (toUnforget.length > 0) {
      localStorage.setItem(FORGOTTEN_KEY, JSON.stringify([...forgotten]))
      toUnforget.forEach(forma => {
        fetch('/api/vocab/forget', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ forma }),
        }).catch(() => {})
      })
    }
    localStorage.setItem(VOCAB_KEY, JSON.stringify([...map.values()]))
  } catch {}
}

export function removeVocab(forma: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(VOCAB_KEY, JSON.stringify(getVocab().filter(v => v.forma !== forma)))
    const srs = getVocabSRS()
    delete srs[forma]
    localStorage.setItem(SRS_KEY, JSON.stringify(srs))
    const forgotten = getForgottenFormas()
    forgotten.add(forma)
    localStorage.setItem(FORGOTTEN_KEY, JSON.stringify([...forgotten]))
  } catch {}
  fetch('/api/vocab/forget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ forma }),
  }).catch(() => {})
}

export function getVocab(): StoredVocab[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(VOCAB_KEY) ?? '[]')
  } catch { return [] }
}

export function getVocabSRS(): Record<string, VocabSRS> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(SRS_KEY) ?? '{}') } catch { return {} }
}

export function updateVocabSRS(forma: string, remembered: boolean): VocabSRS {
  const all  = getVocabSRS()
  const prev = all[forma] ?? { interval_days: 1, ease_factor: 2.5 }
  const next: VocabSRS = remembered
    ? {
        interval_days: Math.ceil(prev.interval_days * prev.ease_factor),
        ease_factor:   Math.min(2.5, prev.ease_factor + 0.05),
        next_review:   isoAfterDays(Math.ceil(prev.interval_days * prev.ease_factor)),
      }
    : {
        interval_days: 1,
        ease_factor:   Math.max(1.3, prev.ease_factor - 0.2),
        next_review:   isoAfterDays(1),
      }
  all[forma] = next
  try { localStorage.setItem(SRS_KEY, JSON.stringify(all)) } catch {}
  return next
}

function isoAfterDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}
