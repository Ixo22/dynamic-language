export interface VocabItem {
  forma: string
  lectura: string
  significado: string
}

export interface DialogueResponse {
  contexto_escena: string
  frase_completa_jp: string
  frase_es: string
  vocabulario_desglosado: VocabItem[]
}

export interface UIToggles {
  showAudio: boolean
  showText: boolean
  showInput: boolean
  showHints: boolean
}

export type JLPTLevel = 'A1' | 'A2'

export interface SRSProgress {
  id: string
  user_id: string
  japanese_phrase: string
  interval_days: number
  next_review: string
  ease_factor: number
}

export interface Token {
  text: string
  vocab: VocabItem | null
  isVocab: boolean
}
