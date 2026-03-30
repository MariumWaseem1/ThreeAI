import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberByToken, updatePreferences } from '@/lib/supabase'
import type { SubscriberPreferences } from '@/types/newsletter'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const subscriber = await getSubscriberByToken(token, 'unsubscribeToken')
  if (!subscriber) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    firstName: subscriber.firstName,
    email: subscriber.email,
    preferences: subscriber.preferences,
  })
}

export async function PATCH(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const prefs = await req.json() as Partial<SubscriberPreferences>
  const ok = await updatePreferences(token, prefs)

  if (!ok) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  return NextResponse.json({ message: 'Preferences updated' })
}
