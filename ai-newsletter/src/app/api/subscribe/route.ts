import { NextRequest, NextResponse } from 'next/server'
import { createSubscriber, getSubscriberByEmail } from '@/lib/supabase'
import type { Subscriber, SubscriberPreferences } from '@/types/newsletter'

async function sendConfirmationEmail(subscriber: Subscriber) {
  if (!process.env.RESEND_API_KEY) return
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { buildConfirmationEmail } = await import('@/lib/email-template')
  const html = buildConfirmationEmail(subscriber)

  await resend.emails.send({
    from: 'Signal Newsletter <newsletter@resend.dev>',
    to: subscriber.email,
    subject: `${subscriber.firstName}, confirm your Signal subscription`,
    html,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, firstName, preferences, referredBy } = body as {
      email: string
      firstName: string
      preferences?: Partial<SubscriberPreferences>
      referredBy?: string
    }

    if (!email || !firstName) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Check if already subscribed
    const existing = await getSubscriberByEmail(email)
    if (existing) {
      if (existing.confirmed) {
        return NextResponse.json({ error: 'This email is already subscribed' }, { status: 409 })
      }
      // Resend confirmation email
      await sendConfirmationEmail(existing)
      return NextResponse.json({ message: 'Confirmation email resent. Please check your inbox.' })
    }

    const subscriber = await createSubscriber(email, firstName, preferences || {}, referredBy)
    await sendConfirmationEmail(subscriber)

    return NextResponse.json({
      message: 'Almost there! Check your inbox to confirm your subscription.',
      referralCode: subscriber.referralCode,
    })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
