import { createAdminClient } from '@/lib/supabase/admin'
import { fetchFinishedFixtures, matchFixturesToGames } from '@/lib/football-api'
import type { SyncResult } from '@/lib/types'

// Games are checked only after 100 min past match_date — enough for 90 min + stoppages
const MATCH_GRACE_MINUTES = 100

export async function syncResults(): Promise<SyncResult> {
  const log: string[] = []
  const admin = createAdminClient()

  try {
    const cutoff = new Date(Date.now() - MATCH_GRACE_MINUTES * 60 * 1000).toISOString()

    const { data: pendingGames, error: gamesError } = await admin
      .from('games')
      .select('id, team_a, team_b, match_date, status')
      .neq('status', 'finished')
      .lt('match_date', cutoff)

    if (gamesError) throw new Error(`Supabase: ${gamesError.message}`)

    if (!pendingGames || pendingGames.length === 0) {
      log.push('Nenhum jogo pendente de verificação.')
      return { updated: 0, log, timestamp: new Date().toISOString() }
    }

    log.push(`${pendingGames.length} jogo(s) aguardando resultado.`)

    const fixtures = await fetchFinishedFixtures(pendingGames)
    log.push(`API-Football: ${fixtures.length} jogo(s) encerrado(s) no período.`)

    const matched = matchFixturesToGames(fixtures, pendingGames)

    if (matched.length === 0) {
      log.push('Nenhuma correspondência encontrada — jogos ainda em andamento ou sem dados.')
      return { updated: 0, log, timestamp: new Date().toISOString() }
    }

    log.push(`${matched.length} jogo(s) para atualizar:`)

    let updated = 0
    for (const m of matched) {
      const { error: resError } = await admin
        .from('results')
        .upsert(
          { game_id: m.gameId, score_a: m.scoreA, score_b: m.scoreB },
          { onConflict: 'game_id' }
        )

      if (resError) {
        log.push(`  ✗ ${m.teamA} × ${m.teamB}: ${resError.message}`)
        continue
      }

      await admin.from('games').update({ status: 'finished' }).eq('id', m.gameId)
      log.push(`  ✓ ${m.teamA} ${m.scoreA}–${m.scoreB} ${m.teamB}`)
      updated++
    }

    return { updated, log, timestamp: new Date().toISOString() }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    log.push(`✗ ERRO: ${message}`)
    return { updated: 0, log, timestamp: new Date().toISOString(), error: message }
  }
}
