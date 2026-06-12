import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user ||
    !process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL
  ) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const game_id = searchParams.get('game_id')
  if (!game_id) return NextResponse.json({ error: 'game_id obrigatório' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('predictions')
    .select('*, profiles(nome)')
    .eq('game_id', game_id)
    .order('score_a', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
