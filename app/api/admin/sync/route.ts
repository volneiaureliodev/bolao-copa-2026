import { createClient } from '@/lib/supabase/server'
import { syncResults } from '@/lib/sync-results'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

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

export async function POST() {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const result = await syncResults()
  const status = result.error ? 500 : 200
  return NextResponse.json(result, { status })
}
