import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calcNextReview } from '@/lib/srs'

export async function POST(request: NextRequest) {
  try {
    const { phrase, understood } = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existing } = await supabase
      .from('srs_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('japanese_phrase', phrase)
      .single()

    const card = existing ?? { interval_days: 1, ease_factor: 2.5 }
    const updated = calcNextReview(card, understood)

    if (existing) {
      await supabase
        .from('srs_progress')
        .update(updated)
        .eq('id', existing.id)
    } else {
      await supabase.from('srs_progress').insert({
        user_id: user.id,
        japanese_phrase: phrase,
        ...updated,
      })
    }

    return NextResponse.json({ success: true, ...updated })
  } catch (err) {
    console.error('srs error:', err)
    return NextResponse.json({ error: 'SRS update failed' }, { status: 500 })
  }
}
