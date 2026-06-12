import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PalpitesClient from './PalpitesClient'
import type { Game, Prediction, Result } from '@/lib/types'
import { isGameLocked } from '@/lib/utils'

export default async function PalpitesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: games }, { data: predictions }, { data: results }] = await Promise.all([
    supabase.from('games').select('*').eq('stage', 'group').order('match_date'),
    supabase.from('predictions').select('*').eq('user_id', user.id),
    supabase.from('results').select('*'),
  ])

  const predMap = new Map((predictions as Prediction[] ?? []).map((p) => [p.game_id, p]))
  const resMap = new Map((results as Result[] ?? []).map((r) => [r.game_id, r]))

  const gamesWithData = (games as Game[] ?? []).map((g) => ({
    ...g,
    prediction: predMap.get(g.id) ?? null,
    result: resMap.get(g.id) ?? null,
    isLocked: isGameLocked(g.match_date),
  }))

  return <PalpitesClient games={gamesWithData} />
}
