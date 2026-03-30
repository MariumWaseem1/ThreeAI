import { NextRequest, NextResponse } from 'next/server'
import { confirmSubscriber, getSubscriberByToken } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/confirm?error=missing', req.url))
  }

  const subscriber = await getSubscriberByToken(token, 'confirmToken')
  if (!subscriber) {
    return NextResponse.redirect(new URL('/confirm?error=invalid', req.url))
  }

  if (subscriber.confirmed) {
    return NextResponse.redirect(new URL('/confirm?status=already', req.url))
  }

  const ok = await confirmSubscriber(token)
  if (!ok) {
    return NextResponse.redirect(new URL('/confirm?error=failed', req.url))
  }

  return NextResponse.redirect(new URL('/confirm?status=success', req.url))
}
