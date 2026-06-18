export interface StoredVocab {
  forma:      string
  lectura:    string
  significado: string
}

const KEY = 'dl_vocab_seen'

export function addVocab(items: StoredVocab[]): void {
  if (typeof window === 'undefined') return
  try {
    const map = new Map(getVocab().map(v => [v.forma, v]))
    items.forEach(v => map.set(v.forma, v))
    localStorage.setItem(KEY, JSON.stringify([...map.values()]))
  } catch {}
}

export function getVocab(): StoredVocab[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch { return [] }
}
