import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { code } = await request.json()
  const valid = typeof code === 'string' && code.trim().toUpperCase() === process.env.INVITE_CODE
  return valid
    ? NextResponse.json({ valid: true })
    : NextResponse.json({ valid: false }, { status: 401 })
}
