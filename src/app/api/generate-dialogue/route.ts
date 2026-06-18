import { NextRequest, NextResponse } from 'next/server'
import { DialogueResponse } from '@/lib/types'
import a1 from '@/lib/dialogues/A1.json'
import a2 from '@/lib/dialogues/A2.json'

const BANKS: Record<string, DialogueResponse[]> = {
  A1: a1 as DialogueResponse[],
  A2: a2 as DialogueResponse[],
}

export async function POST(request: NextRequest) {
  try {
    const { level = 'A1', exclude } = await request.json()
    const bank = BANKS[level] ?? BANKS['A1']

    const available = exclude
      ? bank.filter(d => d.frase_completa_jp !== exclude)
      : bank
    const pool = available.length > 0 ? available : bank

    const dialogue = pool[Math.floor(Math.random() * pool.length)]
    return NextResponse.json(dialogue)
  } catch {
    return NextResponse.json({ error: 'Failed to load dialogue' }, { status: 500 })
  }
}
