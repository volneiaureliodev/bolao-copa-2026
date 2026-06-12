import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'
import type { Game, Result, Score } from '@/lib/types'

export default async function AdminPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!process.env.NEXT_PUBLIC_ADMIN_EMAIL || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL)
    redirect('/')

  const [{ data: games }, { data: results }, { data: scores }] = await Promise.all([
    supabase.from('games').select('*').order('match_date'),
    supabase.from('results').select('*'),
    supabase.from('scores').select('*'),
  ])

  const resMap = new Map((results as Result[] ?? []).map((r) => [r.game_id, r]))

  const gamesWithResults = (games as Game[] ?? []).map((g) => ({
    ...g,
    result: resMap.get(g.id) ?? null,
  }))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">⚙️ Painel Admin</h1>
      <AdminClient games={gamesWithResults} scores={(scores as Score[]) ?? []} />
    </div>
  )
}
