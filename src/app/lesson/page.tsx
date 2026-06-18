import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LessonPanel } from '@/components/lesson/LessonPanel'
import { KanaOverlay } from '@/components/kana/KanaOverlay'

export default async function LessonPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <>
      <LessonPanel />
      <KanaOverlay />
    </>
  )
}
