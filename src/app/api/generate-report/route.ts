import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import type { AuditFormData, AuditReport } from '@/types/audit'

const client = new Anthropic()
const CONSULTANT_EMAIL = 'mariumw784@gmail.com'
const BOOKING_LINK = `mailto:${CONSULTANT_EMAIL}?subject=AI%20Strategy%20Call%20Request`

function buildPrompt(data: AuditFormData): string {
  const tools = [...data.currentTools, data.customTools].filter(Boolean).join(', ')

  return `You are Marium, a senior AI strategy consultant with deep expertise in ${data.industry}. You are writing a personalised AI Readiness Audit for ${data.companyName}, a ${data.teamSize} team in ${data.industry}.

THEIR SPECIFIC SITUATION:
- Company: ${data.companyName}
- Industry: ${data.industry}
- Team: ${data.teamSize} people${data.annualRevenue ? `, revenue ${data.annualRevenue}` : ''}
- Contact: ${data.contactName}${data.jobTitle ? `, ${data.jobTitle}` : ''}
- Current tools: ${tools || 'Not specified'}
- Data setup: ${data.dataInfrastructure || 'Not specified'}
- AI usage today: ${data.currentAiUsage}
- Team AI experience: ${data.aiExperience || 'Not specified'}
- AI budget: ${data.budgetRange || 'Not allocated'}
- What they want from AI: ${data.primaryGoals.join(', ')}
- What's holding them back: ${data.biggestChallenges.join(', ')}
- Timeframe: ${data.timeframe || 'Not specified'}

CRITICAL RULES FOR THIS REPORT:
1. Every sentence must reference ${data.companyName}, their industry (${data.industry}), or their specific tools/situation. Zero generic statements.
2. The executiveSummary must feel like it was written specifically for ${data.contactName} at ${data.companyName} — mention their industry dynamics, their specific tools, and their stated goals.
3. Category scores must reflect their ACTUAL situation (e.g. if they use spreadsheets, data score is low; if they have no AI budget, strategy score is low).
4. Recommendations: show WHAT needs to be done and WHY it matters for ${data.companyName} specifically — but NOT the detailed HOW. The how is reserved for the strategy call. Each description should end with a teaser like "This alone could [specific business outcome relevant to their goals] — the exact approach depends on your specific workflow."
5. Quick wins: give 2-3 genuinely specific, immediately actionable wins using tools they ALREADY have (${tools}). These should feel like insider tips.
6. Roadmap phases: name the initiatives specifically for ${data.industry} and their goals, but keep them at the "what" level not the "how" level.
7. The nextSteps field must be a compelling, personalised paragraph that creates genuine urgency based on their specific situation and challenges.

Generate ONLY valid JSON, no other text:

{
  "overallScore": <integer 0-100, honestly reflecting their situation>,
  "readinessLevel": <"Emerging"|"Developing"|"Advancing"|"Leading">,
  "executiveSummary": "<3 paragraphs. Para 1: where ${data.companyName} stands today in ${data.industry} context. Para 2: the specific opportunity they are missing given their tools and goals. Para 3: what becomes possible — reference their specific goals of ${data.primaryGoals.slice(0,2).join(' and ')}>",
  "categoryScores": [
    {
      "name": "Data Infrastructure",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<one sentence specific to their data setup>",
      "details": ["<finding referencing their specific tools>", "<finding>", "<finding>"]
    },
    {
      "name": "Team & Culture",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<one sentence specific to their team size and experience>",
      "details": ["<finding>", "<finding>", "<finding>"]
    },
    {
      "name": "Process & Automation",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<one sentence specific to their industry processes>",
      "details": ["<finding>", "<finding>", "<finding>"]
    },
    {
      "name": "AI Strategy",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<one sentence specific to their budget and goals>",
      "details": ["<finding>", "<finding>", "<finding>"]
    }
  ],
  "topStrengths": [
    "<strength specific to their actual situation>",
    "<strength>",
    "<strength>"
  ],
  "criticalGaps": [
    "<gap specific to their situation — name the specific risk or cost of inaction>",
    "<gap>",
    "<gap>"
  ],
  "recommendations": [
    {
      "priority": "high",
      "category": "<specific category>",
      "title": "<specific title naming their industry or tools>",
      "description": "<2 sentences: what the problem is for ${data.companyName} specifically, and what outcome fixing it would unlock — but not how to fix it>",
      "estimatedImpact": "<High|Medium|Low>",
      "estimatedEffort": "<timeframe>"
    }
  ],
  "quickWins": [
    "<specific actionable win using one of their existing tools: ${tools.split(',')[0] || 'their current stack'}>",
    "<specific actionable win>",
    "<specific actionable win>"
  ],
  "roadmap": [
    {
      "phase": "Phase 1: ${data.industry}-Specific Foundation",
      "timeframe": "0-90 days",
      "initiatives": ["<initiative named for their industry/goals>", "<initiative>", "<initiative>"],
      "expectedOutcomes": ["<outcome tied to their stated goal>", "<outcome>"]
    },
    {
      "phase": "Phase 2: Build & Integrate",
      "timeframe": "90-180 days",
      "initiatives": ["<initiative>", "<initiative>", "<initiative>"],
      "expectedOutcomes": ["<outcome>", "<outcome>"]
    },
    {
      "phase": "Phase 3: Scale & Optimise",
      "timeframe": "180-365 days",
      "initiatives": ["<initiative>", "<initiative>", "<initiative>"],
      "expectedOutcomes": ["<outcome tied to their stated goal of ${data.primaryGoals[0] || 'growth'}>", "<outcome>"]
    }
  ],
  "nextSteps": "<2-3 sentences. Reference their specific score, their biggest challenge (${data.biggestChallenges[0] || 'adoption'}), and why a 30-minute call would unlock a tailored plan that no generic tool can provide. Create genuine urgency without being pushy.>"
}

Scoring guide (be honest, not generous):
- overallScore = sum of 4 category scores
- Emerging: 0-39, Developing: 40-59, Advancing: 60-79, Leading: 80-100
- Include 4-6 recommendations (mix of high/medium/low)
- If they have no AI budget, AI Strategy score should be 5-10/25 max
- If they use only spreadsheets, Data Infrastructure should be 3-8/25`
}

function buildClientEmailHtml(data: AuditFormData, report: AuditReport): string {
  const scoreColor = report.overallScore >= 70 ? '#059669' : report.overallScore >= 45 ? '#d97706' : '#dc2626'
  const categoryRows = report.categoryScores
    .map((c) => {
      const pct = Math.round((c.score / c.maxScore) * 100)
      const color = pct >= 70 ? '#059669' : pct >= 45 ? '#d97706' : '#dc2626'
      return `<tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151">${c.name}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;color:${color}">${c.score}/${c.maxScore}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#6b7280">${c.summary}</td>
      </tr>`
    }).join('')

  return `<div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;color:#111">

  <div style="background:linear-gradient(135deg,#4338ca,#6366f1);padding:40px 32px;border-radius:12px 12px 0 0;text-align:center">
    <p style="color:#c7d2fe;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px">Your AI Readiness Audit</p>
    <h1 style="color:white;margin:0;font-size:24px;font-weight:800">${data.companyName}</h1>
    <p style="color:#c7d2fe;margin:8px 0 0;font-size:13px">${new Date(report.generatedAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</p>
  </div>

  <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none">

    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">Hi ${data.contactName},</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">Your AI Readiness Audit for <strong>${data.companyName}</strong> is ready. Here's what we found.</p>

    <div style="background:#f5f3ff;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px">
      <p style="color:#6b7280;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Overall AI Readiness Score</p>
      <div style="font-size:64px;font-weight:900;color:${scoreColor};line-height:1">${report.overallScore}</div>
      <div style="color:#9ca3af;font-size:13px;margin:4px 0 8px">out of 100</div>
      <div style="display:inline-block;background:${scoreColor};color:white;font-size:13px;font-weight:700;padding:4px 16px;border-radius:99px">${report.readinessLevel}</div>
    </div>

    <h2 style="font-size:16px;font-weight:700;color:#111;margin:0 0 12px">What We Found</h2>
    <p style="color:#374151;font-size:13px;line-height:1.8;margin:0 0 28px;white-space:pre-line">${report.executiveSummary}</p>

    <h2 style="font-size:16px;font-weight:700;color:#111;margin:0 0 12px">Scores by Category</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;border:1px solid #f3f4f6;border-radius:8px;overflow:hidden">
      <thead><tr style="background:#f9fafb"><th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase">Area</th><th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase">Score</th><th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase">Finding</th></tr></thead>
      <tbody>${categoryRows}</tbody>
    </table>

    <h2 style="font-size:16px;font-weight:700;color:#111;margin:0 0 12px">3 Things You Can Do This Week</h2>
    <ul style="margin:0 0 28px;padding-left:20px;color:#374151;font-size:13px;line-height:2.2">
      ${report.quickWins.slice(0, 3).map((w) => `<li>${w}</li>`).join('')}
    </ul>

    <h2 style="font-size:16px;font-weight:700;color:#111;margin:0 0 8px">Your Critical Gaps</h2>
    <p style="color:#6b7280;font-size:13px;margin:0 0 12px">These are holding ${data.companyName} back from your AI goals:</p>
    <ul style="margin:0 0 32px;padding-left:20px;color:#dc2626;font-size:13px;line-height:2.2">
      ${report.criticalGaps.map((g) => `<li><span style="color:#374151">${g}</span></li>`).join('')}
    </ul>

    <div style="background:linear-gradient(135deg,#4338ca,#6366f1);border-radius:12px;padding:32px;text-align:center;margin-bottom:0">
      <h2 style="color:white;font-size:20px;font-weight:800;margin:0 0 12px">Ready to build your AI roadmap?</h2>
      <p style="color:#c7d2fe;font-size:14px;line-height:1.7;margin:0 0 24px">${report.nextSteps}</p>
      <a href="${BOOKING_LINK}" style="display:inline-block;background:white;color:#4338ca;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none">Book a Free 30-Min Strategy Call</a>
      <p style="color:#a5b4fc;font-size:12px;margin:16px 0 0">Reply to this email or reach out to <a href="mailto:${CONSULTANT_EMAIL}" style="color:white">${CONSULTANT_EMAIL}</a></p>
    </div>

  </div>

  <div style="padding:20px;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">ThreeAI — AI Strategy for Growing Businesses</p>
  </div>
</div>`
}

function buildInternalEmailHtml(data: AuditFormData, report: AuditReport): string {
  const categoryRows = report.categoryScores
    .map((c) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-size:13px">${c.name}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:13px">${c.score}/${c.maxScore}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;color:#6b7280;font-size:12px">${c.summary}</td></tr>`)
    .join('')

  const recRows = report.recommendations
    .map((r) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:12px;color:${r.priority === 'high' ? '#dc2626' : r.priority === 'medium' ? '#d97706' : '#6b7280'}">${r.priority.toUpperCase()}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-size:13px">${r.title}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#6b7280">${r.description}</td></tr>`)
    .join('')

  return `<div style="font-family:system-ui,sans-serif;max-width:700px;margin:0 auto;color:#111">
  <div style="background:#111;padding:24px 32px;border-radius:12px 12px 0 0">
    <h1 style="color:white;margin:0;font-size:18px">New Lead: ${data.companyName}</h1>
    <p style="color:#9ca3af;margin:6px 0 0;font-size:13px">Score: ${report.overallScore}/100 (${report.readinessLevel}) · ${new Date(report.generatedAt).toLocaleString()}</p>
  </div>
  <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none">

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px">
      <p style="margin:0;font-size:14px;color:#166534"><strong>Follow up with:</strong> ${data.contactName}${data.jobTitle ? ` (${data.jobTitle})` : ''} at <a href="mailto:${data.email}" style="color:#15803d">${data.email}</a></p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px">
      <tr><td style="padding:5px 0;color:#6b7280;width:130px">Company</td><td style="padding:5px 0;font-weight:600">${data.companyName}</td></tr>
      <tr><td style="padding:5px 0;color:#6b7280">Industry</td><td style="padding:5px 0">${data.industry}</td></tr>
      <tr><td style="padding:5px 0;color:#6b7280">Team Size</td><td style="padding:5px 0">${data.teamSize}</td></tr>
      <tr><td style="padding:5px 0;color:#6b7280">Revenue</td><td style="padding:5px 0">${data.annualRevenue || 'Not specified'}</td></tr>
      <tr><td style="padding:5px 0;color:#6b7280">AI Budget</td><td style="padding:5px 0">${data.budgetRange || 'Not allocated'}</td></tr>
      <tr><td style="padding:5px 0;color:#6b7280">Timeframe</td><td style="padding:5px 0">${data.timeframe || 'Not specified'}</td></tr>
      <tr><td style="padding:5px 0;color:#6b7280">Tools</td><td style="padding:5px 0">${[...data.currentTools, data.customTools].filter(Boolean).join(', ') || 'Not specified'}</td></tr>
      <tr><td style="padding:5px 0;color:#6b7280">Goals</td><td style="padding:5px 0">${data.primaryGoals.join(', ')}</td></tr>
      <tr><td style="padding:5px 0;color:#6b7280">Challenges</td><td style="padding:5px 0">${data.biggestChallenges.join(', ')}</td></tr>
    </table>

    <h2 style="font-size:15px;margin:0 0 12px">Category Scores</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead><tr style="background:#f9fafb"><th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280">Category</th><th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280">Score</th><th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280">Summary</th></tr></thead>
      <tbody>${categoryRows}</tbody>
    </table>

    <h2 style="font-size:15px;margin:0 0 8px">Executive Summary</h2>
    <p style="color:#374151;font-size:13px;line-height:1.7;margin:0 0 24px">${report.executiveSummary.replace(/\n/g, '<br>')}</p>

    <h2 style="font-size:15px;margin:0 0 12px">All Recommendations</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead><tr style="background:#f9fafb"><th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280">Priority</th><th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280">Title</th><th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280">Description</th></tr></thead>
      <tbody>${recRows}</tbody>
    </table>

    <h2 style="font-size:15px;margin:0 0 8px">Quick Wins</h2>
    <ul style="margin:0;padding-left:20px;color:#374151;font-size:13px;line-height:2">
      ${report.quickWins.map((w) => `<li>${w}</li>`).join('')}
    </ul>
  </div>
</div>`
}

async function sendEmails(data: AuditFormData, report: AuditReport) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  // Send both emails — client copy and internal lead notification
  await Promise.allSettled([
    resend.emails.send({
      from: 'Marium at ThreeAI <onboarding@resend.dev>',
      to: data.email,
      subject: `Your AI Readiness Score: ${report.overallScore}/100 — ${data.companyName}`,
      html: buildClientEmailHtml(data, report),
    }),
    resend.emails.send({
      from: 'AI Readiness Audit <onboarding@resend.dev>',
      to: CONSULTANT_EMAIL,
      subject: `New Lead: ${data.companyName} — ${report.overallScore}/100 (${report.readinessLevel}) — ${data.contactName}`,
      html: buildInternalEmailHtml(data, report),
    }),
  ])
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

    // Send emails non-blocking
    sendEmails(data, report).catch((err) => console.error('Email error:', err))

    return NextResponse.json(report)
  } catch (err) {
    console.error('Report generation error:', err)
    const message = err instanceof Error ? err.message : 'Failed to generate report'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
