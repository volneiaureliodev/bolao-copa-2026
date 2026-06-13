import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ALLOWED_FIELDS = ['team_a', 'team_b', 'group', 'match_date', 'venue', 'status'] as const

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await request.json()
  const updates: Record<string, unknown> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in body && body[field] !== undefined) {
      updates[field] = body[field]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('games')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  console.log('[admin] game patched', params.id, updates)
  return NextResponse.json(data)
}
