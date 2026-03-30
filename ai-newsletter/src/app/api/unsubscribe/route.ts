import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeByToken } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/unsubscribe?error=missing', req.url))
  }

  const ok = await unsubscribeByToken(token)
  if (!ok) {
    return NextResponse.redirect(new URL('/unsubscribe?error=invalid', req.url))
  }

  return NextResponse.redirect(new URL('/unsubscribe?status=success', req.url))
}

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const ok = await unsubscribeByToken(token)
  if (!ok) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  }

  return NextResponse.json({ message: 'Unsubscribed successfully' })
}
