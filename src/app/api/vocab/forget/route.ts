import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ forgotten: [] })

    const { data } = await supabase
      .from('forgotten_vocab')
      .select('forma')
      .eq('user_id', user.id)

    return NextResponse.json({ forgotten: (data ?? []).map((r: { forma: string }) => r.forma) })
  } catch {
    return NextResponse.json({ forgotten: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { forma } = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false }, { status: 401 })

    await supabase.from('forgotten_vocab').upsert({ user_id: user.id, forma })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { forma } = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false }, { status: 401 })

    await supabase
      .from('forgotten_vocab')
      .delete()
      .eq('user_id', user.id)
      .eq('forma', forma)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
