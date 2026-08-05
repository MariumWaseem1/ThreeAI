import { NextRequest, NextResponse } from 'next/server'
import { getAllConfirmedSubscribers } from '@/lib/supabase'
import { fetchAllNews, categorizeArticles } from '@/lib/news-fetcher'
import { scoreAndFilterArticles, buildNewsletterIssue } from '@/lib/ai-curator'
import { buildEmailHtml } from '@/lib/email-template'
import type { Subscriber } from '@/types/newsletter'

// Vercel Cron calls this at 9am UTC daily
// vercel.json: { "crons": [{ "path": "/api/send-newsletter", "schedule": "0 9 * * *" }] }

const BATCH_SIZE = 10 // send N emails at a time to avoid rate limits

async function sendNewsletterToSubscriber(
  subscriber: Subscriber,
  html: string,
  subject: string
) {
  if (!process.env.RESEND_API_KEY) return
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://signal-newsletter.vercel.app'
  const unsubUrl = `${baseUrl}/api/unsubscribe?token=${subscriber.unsubscribeToken}`
  const prefsUrl = `${baseUrl}/preferences?token=${subscriber.unsubscribeToken}`

  // Inject personalised footer links into html
  const finalHtml = html
    .replace('{{UNSUBSCRIBE_URL}}', unsubUrl)
    .replace('{{PREFERENCES_URL}}', prefsUrl)

  await resend.emails.send({
    from: 'Signal by Marium <newsletter@resend.dev>',
    to: subscriber.email,
    subject,
    html: finalHtml,
    headers: {
      'List-Unsubscribe': `<${unsubUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })
}

function shouldSendToday(subscriber: Subscriber): boolean {
  const day = new Date().getDay() // 0=Sun, 1=Mon...6=Sat
  const freq = subscriber.preferences.frequency
  if (freq === 'daily') return true
  if (freq === 'weekdays') return day >= 1 && day <= 5
  if (freq === 'weekly') return day === 1 // Monday only
  return false
}

export async function GET(req: NextRequest) {
  // Protect the endpoint — only Vercel Cron or requests with the secret can call it
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const subscribers = await getAllConfirmedSubscribers()
    const toSend = subscribers.filter(shouldSendToday)

    if (toSend.length === 0) {
      return NextResponse.json({ message: 'No subscribers to send to today', sent: 0 })
    }

    // Fetch news once — use a representative preferences set (first subscriber or defaults)
    const repPrefs = toSend[0].preferences
    const rawArticles = await fetchAllNews(repPrefs)
    const categorized = categorizeArticles(rawArticles)

    let sent = 0
    let failed = 0

    // Process in batches to avoid overwhelming Resend
    for (let i = 0; i < toSend.length; i += BATCH_SIZE) {
      const batch = toSend.slice(i, i + BATCH_SIZE)
      await Promise.allSettled(
        batch.map(async (subscriber) => {
          try {
            // Score and filter per-subscriber based on their topics
            const filtered = await scoreAndFilterArticles(categorized, subscriber.preferences)
            const issue = await buildNewsletterIssue(filtered, subscriber.preferences, subscriber.firstName)
            const html = buildEmailHtml(issue, subscriber)
            const subject = issue.headline || `Your AI briefing — ${issue.date}`
            await sendNewsletterToSubscriber(subscriber, html, subject)
            sent++
          } catch (err) {
            console.error(`Failed to send to ${subscriber.email}:`, err)
            failed++
          }
        })
      )
      // Small delay between batches
      if (i + BATCH_SIZE < toSend.length) {
        await new Promise((r) => setTimeout(r, 500))
      }
    }

    return NextResponse.json({ message: 'Newsletter sent', sent, failed, total: toSend.length })
  } catch (err) {
    console.error('Send newsletter error:', err)
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 })
  }
}
