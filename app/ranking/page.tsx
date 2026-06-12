import { createClient } from '@/lib/supabase/server'
import RankingTable from '@/components/RankingTable'
import type { Score } from '@/lib/types'

export const revalidate = 60

export default async function RankingPage() {
  let user = null
  let scores = null
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    const { data: s } = await supabase.from('scores').select('*')
    scores = s
  } catch {
    // Supabase não configurado ainda
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">🏆 Classificação Geral</h1>
      <RankingTable scores={(scores as Score[]) ?? []} highlightUserId={user?.id} />
      <p className="text-xs text-gray-400 text-center pt-2">
        Atualizado a cada minuto · Desempate: placares exatos → resultados corretos
      </p>
    </div>
  )
}
