import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { LOCK_BUFFER_MS } from '@/lib/utils'

export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()
  const { game_id, score_a, score_b } = body

  if (
    typeof score_a !== 'number' ||
    typeof score_b !== 'number' ||
    score_a < 0 ||
    score_b < 0 ||
    !Number.isInteger(score_a) ||
    !Number.isInteger(score_b)
  ) {
    return NextResponse.json({ error: 'Placar inválido' }, { status: 400 })
  }

  // Verifica bloqueio (1h antes do jogo)
  const { data: game } = await supabase
    .from('games')
    .select('match_date')
    .eq('id', game_id)
    .single()

  if (!game) return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 })

  const lockTime = new Date(game.match_date).getTime() - LOCK_BUFFER_MS
  if (Date.now() >= lockTime) {
    return NextResponse.json(
      { error: 'Palpites encerrados para este jogo (1h antes do início)' },
      { status: 403 }
    )
  }

  const { data, error } = await supabase
    .from('predictions')
    .upsert(
      { user_id: user.id, game_id, score_a, score_b },
      { onConflict: 'user_id,game_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
