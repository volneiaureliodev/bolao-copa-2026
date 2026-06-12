import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function assertAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (
    !user ||
    !process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL
  )
    return null
  return user
}

export async function POST(request: Request) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { game_id, score_a, score_b } = await request.json()

  if (
    typeof score_a !== 'number' ||
    typeof score_b !== 'number' ||
    score_a < 0 ||
    score_b < 0
  ) {
    return NextResponse.json({ error: 'Placar inválido' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Upsert result
  const { data, error } = await admin
    .from('results')
    .upsert({ game_id, score_a, score_b }, { onConflict: 'game_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Marca jogo como encerrado
  await admin.from('games').update({ status: 'finished' }).eq('id', game_id)

  return NextResponse.json(data)
}
