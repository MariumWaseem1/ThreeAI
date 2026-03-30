import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import type { AuditFormData, AuditReport } from '@/types/audit'

const client = new Anthropic()
const NOTIFY_EMAIL = 'mariumw784@gmail.com'

function buildPrompt(data: AuditFormData): string {
  return `You are an expert AI strategy consultant. Generate a comprehensive, actionable AI Readiness Audit Report for the following business.

BUSINESS PROFILE:
- Company: ${data.companyName}
- Industry: ${data.industry}
- Team Size: ${data.teamSize}
- Annual Revenue: ${data.annualRevenue}
- Contact: ${data.contactName} (${data.jobTitle})

CURRENT TECHNOLOGY:
- Tools in use: ${[...data.currentTools, data.customTools].filter(Boolean).join(', ')}
- Data Infrastructure: ${data.dataInfrastructure || 'Not specified'}

AI MATURITY:
- Current AI Usage: ${data.currentAiUsage}
- Team AI Experience: ${data.aiExperience || 'Not specified'}
- AI Budget Range: ${data.budgetRange}

GOALS & CHALLENGES:
- Primary Goals: ${data.primaryGoals.join(', ')}
- Biggest Challenges: ${data.biggestChallenges.join(', ')}
- Implementation Timeframe: ${data.timeframe}

Generate a detailed JSON report following this EXACT structure (no extra text, only valid JSON):

{
  "overallScore": <integer 0-100>,
  "readinessLevel": <"Emerging"|"Developing"|"Advancing"|"Leading">,
  "executiveSummary": "<2-3 paragraph executive summary tailored to this company>",
  "categoryScores": [
    {
      "name": "Data Infrastructure",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<one sentence>",
      "details": ["<finding 1>", "<finding 2>", "<finding 3>"]
    },
    {
      "name": "Team & Culture",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<one sentence>",
      "details": ["<finding 1>", "<finding 2>", "<finding 3>"]
    },
    {
      "name": "Process & Automation",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<one sentence>",
      "details": ["<finding 1>", "<finding 2>", "<finding 3>"]
    },
    {
      "name": "AI Strategy",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<one sentence>",
      "details": ["<finding 1>", "<finding 2>", "<finding 3>"]
    }
  ],
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "criticalGaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "recommendations": [
    {
      "priority": "high",
      "category": "<category>",
      "title": "<concise title>",
      "description": "<2-3 sentence description with specifics for this company>",
      "estimatedImpact": "<High|Medium|Low>",
      "estimatedEffort": "<1-2 weeks|1-3 months|3-6 months|6-12 months>"
    }
  ],
  "quickWins": ["<quick win 1>", "<quick win 2>", "<quick win 3>", "<quick win 4>"],
  "roadmap": [
    {
      "phase": "Phase 1: Foundation",
      "timeframe": "0-90 days",
      "initiatives": ["<initiative 1>", "<initiative 2>", "<initiative 3>"],
      "expectedOutcomes": ["<outcome 1>", "<outcome 2>"]
    },
    {
      "phase": "Phase 2: Build",
      "timeframe": "90-180 days",
      "initiatives": ["<initiative 1>", "<initiative 2>", "<initiative 3>"],
      "expectedOutcomes": ["<outcome 1>", "<outcome 2>"]
    },
    {
      "phase": "Phase 3: Scale",
      "timeframe": "180-365 days",
      "initiatives": ["<initiative 1>", "<initiative 2>", "<initiative 3>"],
      "expectedOutcomes": ["<outcome 1>", "<outcome 2>"]
    }
  ],
  "nextSteps": "<personalized call to action paragraph — 2-3 sentences mentioning specific value of working with an AI consultant>"
}

Rules:
- Overall score = sum of 4 category scores
- Readiness: 0-39 = Emerging, 40-59 = Developing, 60-79 = Advancing, 80-100 = Leading
- Include at least 5 recommendations (mix of high/medium/low priority)
- Be specific and actionable — reference the company's industry, tools, and goals
- The nextSteps should feel warm, consultative, and create urgency`
}

function buildEmailHtml(data: AuditFormData, report: AuditReport): string {
  const categoryRows = report.categoryScores
    .map((c) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0">${c.name}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-weight:600">${c.score}/${c.maxScore}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;color:#6b7280">${c.summary}</td></tr>`)
    .join('')

  const recRows = report.recommendations
    .map((r) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-transform:capitalize;font-weight:600;color:${r.priority === 'high' ? '#dc2626' : r.priority === 'medium' ? '#d97706' : '#6b7280'}">${r.priority}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0">${r.title}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;color:#6b7280">${r.estimatedEffort}</td></tr>`)
    .join('')

  return `
  <div style="font-family:Inter,system-ui,sans-serif;max-width:700px;margin:0 auto;color:#111">
    <div style="background:linear-gradient(135deg,#4338ca,#6366f1);padding:32px;border-radius:12px 12px 0 0">
      <h1 style="color:white;margin:0;font-size:22px">New AI Readiness Audit Submission</h1>
      <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px">Generated ${new Date(report.generatedAt).toLocaleString()}</p>
    </div>

    <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none">

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px">Company</td><td style="padding:6px 0;font-weight:600">${data.companyName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Contact</td><td style="padding:6px 0">${data.contactName}${data.jobTitle ? ` — ${data.jobTitle}` : ''}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:6px 0"><a href="mailto:${data.email}" style="color:#4f46e5">${data.email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Industry</td><td style="padding:6px 0">${data.industry}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Team Size</td><td style="padding:6px 0">${data.teamSize}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">AI Budget</td><td style="padding:6px 0">${data.budgetRange || 'Not specified'}</td></tr>
      </table>

      <div style="background:#f5f3ff;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px">
        <div style="font-size:48px;font-weight:900;color:#4f46e5">${report.overallScore}</div>
        <div style="color:#6b7280;font-size:13px">out of 100</div>
        <div style="font-size:16px;font-weight:700;color:#4338ca;margin-top:4px">${report.readinessLevel}</div>
      </div>

      <h2 style="font-size:16px;margin:0 0 12px;color:#111">Category Scores</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
        <thead><tr style="background:#f9fafb"><th style="padding:8px 12px;text-align:left;font-weight:600;color:#374151">Category</th><th style="padding:8px 12px;text-align:left;font-weight:600;color:#374151">Score</th><th style="padding:8px 12px;text-align:left;font-weight:600;color:#374151">Summary</th></tr></thead>
        <tbody>${categoryRows}</tbody>
      </table>

      <h2 style="font-size:16px;margin:0 0 8px;color:#111">Executive Summary</h2>
      <p style="color:#374151;font-size:13px;line-height:1.7;margin:0 0 24px">${report.executiveSummary.replace(/\n/g, '<br>')}</p>

      <h2 style="font-size:16px;margin:0 0 12px;color:#111">Recommendations</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
        <thead><tr style="background:#f9fafb"><th style="padding:8px 12px;text-align:left;font-weight:600;color:#374151">Priority</th><th style="padding:8px 12px;text-align:left;font-weight:600;color:#374151">Title</th><th style="padding:8px 12px;text-align:left;font-weight:600;color:#374151">Effort</th></tr></thead>
        <tbody>${recRows}</tbody>
      </table>

      <h2 style="font-size:16px;margin:0 0 8px;color:#111">Quick Wins</h2>
      <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:13px;line-height:2">
        ${report.quickWins.map((w) => `<li>${w}</li>`).join('')}
      </ul>

      <h2 style="font-size:16px;margin:0 0 8px;color:#111">Goals & Challenges</h2>
      <p style="color:#6b7280;font-size:13px;margin:0 0 4px"><strong>Goals:</strong> ${data.primaryGoals.join(', ')}</p>
      <p style="color:#6b7280;font-size:13px;margin:0 0 24px"><strong>Challenges:</strong> ${data.biggestChallenges.join(', ')}</p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px">
        <p style="margin:0;font-size:13px;color:#166534"><strong>Next step:</strong> Reply to this email or reach out to ${data.contactName} at <a href="mailto:${data.email}" style="color:#15803d">${data.email}</a> to follow up.</p>
      </div>
    </div>
  </div>`
}

async function sendNotificationEmail(data: AuditFormData, report: AuditReport) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: 'AI Readiness Audit <onboarding@resend.dev>',
      to: NOTIFY_EMAIL,
      subject: `New Audit: ${data.companyName} — Score ${report.overallScore}/100 (${report.readinessLevel})`,
      html: buildEmailHtml(data, report),
    })
  } catch (err) {
    // Email failure should not break the report response
    console.error('Email send failed:', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const data: AuditFormData = await req.json()

    if (!data.companyName || !data.industry || !data.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildPrompt(data) }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    // Extract JSON robustly — find first { and last }
    let jsonText = content.text.trim()
    const start = jsonText.indexOf('{')
    const end = jsonText.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('No JSON found in response')
    jsonText = jsonText.slice(start, end + 1)

    const reportData = JSON.parse(jsonText)

    const report: AuditReport = {
      companyName: data.companyName,
      generatedAt: new Date().toISOString(),
      ...reportData,
    }

    // Send notification email (non-blocking)
    sendNotificationEmail(data, report)

    return NextResponse.json(report)
  } catch (err) {
    console.error('Report generation error:', err)
    const message = err instanceof Error ? err.message : 'Failed to generate report'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
