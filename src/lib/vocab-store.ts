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

const VOCAB_KEY = 'dl_vocab_seen'
const SRS_KEY   = 'dl_vocab_srs'

export function addVocab(items: { forma: string; lectura: string; significado: string }[], level?: string): void {
  if (typeof window === 'undefined') return
  try {
    const map = new Map(getVocab().map(v => [v.forma, v]))
    items.forEach(v => map.set(v.forma, { ...v, ...(level ? { level } : {}) }))
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
  } catch {}
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
