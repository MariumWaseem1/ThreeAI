import { NextRequest, NextResponse } from 'next/server'
import type { AuditFormData, AuditReport } from '@/types/audit'
const CONSULTANT_EMAIL = 'mariumw784@gmail.com'
const BOOKING_LINK = `mailto:${CONSULTANT_EMAIL}?subject=AI%20Strategy%20Call%20Request`

interface IndustryIntel {
  newsArticles: { title: string; source: string; snippet: string }[]
  redditInsights: { title: string; subreddit: string; score: number }[]
}

async function fetchIndustryIntelligence(industry: string, useCase: string): Promise<IndustryIntel> {
  const result: IndustryIntel = { newsArticles: [], redditInsights: [] }

  const industryKeywords: Record<string, string> = {
    'Financial Services & Banking': 'AI fintech banking automation',
    'Healthcare & Life Sciences': 'AI healthcare medical automation',
    'Retail & E-commerce': 'AI retail ecommerce personalization',
    'Manufacturing & Supply Chain': 'AI manufacturing supply chain automation',
    'Technology & Software': 'AI software development tools',
    'Professional Services': 'AI consulting professional services automation',
    'Real Estate': 'AI real estate property technology',
    'Education': 'AI education edtech learning',
    'Media & Entertainment': 'AI media content creation',
    'Logistics & Transportation': 'AI logistics transportation routing',
    'Energy & Utilities': 'AI energy utilities optimization',
    'Government & Public Sector': 'AI government public sector automation',
    'Non-profit': 'AI nonprofit organization efficiency',
  }
  const query = industryKeywords[industry] || `AI ${industry} automation`

  const newsPromise = (async () => {
    if (!process.env.NEWSAPI_KEY) return
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${weekAgo}&sortBy=relevancy&pageSize=5&language=en&apiKey=${process.env.NEWSAPI_KEY}`
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      const data = await res.json()
      if (data.articles) {
        result.newsArticles = data.articles.slice(0, 5).map((a: { title: string; source: { name: string }; description: string }) => ({
          title: a.title || '',
          source: a.source?.name || '',
          snippet: (a.description || '').slice(0, 120),
        }))
      }
    } catch { /* continue without news */ }
  })()

  const redditPromise = (async () => {
    try {
      const searchQuery = `AI ${industry} adoption`
      const redditRes = await fetch(
        `https://www.reddit.com/search.json?q=${encodeURIComponent(searchQuery)}&sort=relevance&t=month&limit=5`,
        {
          headers: { 'User-Agent': 'ThreeAI/1.0' },
          signal: AbortSignal.timeout(5000),
        }
      )
      const redditData = await redditRes.json()
      if (redditData.data?.children) {
        result.redditInsights = redditData.data.children.slice(0, 5).map((c: { data: { title: string; subreddit: string; score: number } }) => ({
          title: c.data.title || '',
          subreddit: c.data.subreddit || '',
          score: c.data.score || 0,
        }))
      }
    } catch { /* continue without reddit */ }
  })()

  await Promise.allSettled([newsPromise, redditPromise])
  return result
}

function buildPrompt(data: AuditFormData, intel: IndustryIntel): string {
  const tools = [...data.currentTools, data.customTools].filter(Boolean).join(', ')

  return `You are Marium, a senior AI strategy consultant. Write a concise, personalised AI Readiness Audit for ${data.companyName}.

THEIR SITUATION:
- Company: ${data.companyName} (${data.industry}, ${data.teamSize} people${data.annualRevenue ? `, revenue ${data.annualRevenue}` : ''})
- Contact: ${data.contactName}${data.jobTitle ? `, ${data.jobTitle}` : ''}
- What they do: "${data.businessDescription}"
- AI use case: "${data.specificAiUseCase}"
- Pain point: "${data.biggestPainPoint}"
- Success metric: "${data.successMetric || 'Not specified'}"
- Tools: ${tools || 'Not specified'}
- Data setup: ${data.dataInfrastructure || 'Not specified'}
- AI usage: ${data.currentAiUsage}
- AI experience: ${data.aiExperience || 'Not specified'}
- Budget: ${data.budgetRange || 'Not allocated'}
- Goals: ${data.primaryGoals.join(', ')}
- Blockers: ${data.biggestChallenges.join(', ')}
- Timeframe: ${data.timeframe || 'Not specified'}

ANALYSIS FRAMEWORKS (use to guide your thinking, NEVER mention by name in output):
- TRAIL: Translate pain into AI tasks, Risk-check for ${data.industry}, Attempt one pilot, Instrument with metrics, Land permanently.
- DIAGNOSE: Real blockers are psychological not technical. Peer demos beat training. Start tiny.
- PRIORITISE: Score on Impact, Scale, Security risk, Adoption likelihood.
- MEASURE: Baseline before changing anything. Translate time saved into cost.
- ETHICS: Check data permissions, flag bias risks for ${data.industry}, offer safe alternatives.

LIVE INDUSTRY INTELLIGENCE (reference these in your analysis to show up-to-date awareness):
${intel.newsArticles.length > 0 ? `Recent ${data.industry} AI news:\n${intel.newsArticles.map(a => `- "${a.title}" (${a.source}): ${a.snippet}`).join('\n')}` : `No recent news available for ${data.industry}.`}
${intel.redditInsights.length > 0 ? `What ${data.industry} teams are discussing on Reddit:\n${intel.redditInsights.map(r => `- "${r.title}" (r/${r.subreddit}, ${r.score} upvotes)`).join('\n')}` : ''}

Use this intelligence to:
- Reference specific trends or tools that competitors in ${data.industry} are adopting right now
- Ground recommendations in what is actually happening in their market this week
- Make the report feel current and informed, not templated

WRITING RULES:
1. NEVER use em dashes. Use colons, commas, or periods instead.
2. Every single field must reference ${data.companyName}, their specific tools, their pain point, or their use case. Zero generic statements allowed.
3. Be concise. Short punchy sentences. No filler words. No corporate jargon.
4. Build everything around their business description, AI use case, and pain point.
5. Show WHAT needs to change and WHY. Never reveal the step-by-step HOW (that is what the strategy call unlocks).
6. Reference at least one specific industry trend from the live intelligence above.

Generate ONLY valid JSON, no other text:

{
  "overallScore": <integer 0-100, sum of 4 category scores>,
  "readinessLevel": <"Emerging"|"Developing"|"Advancing"|"Leading">,
  "executiveSummary": "<2 to 3 SHORT sentences total. Sentence 1: where ${data.companyName} stands now, referencing their actual workflow. Sentence 2: the specific opportunity and cost of inaction. Sentence 3 (optional): what becomes possible. No paragraphs. No filler.>",
  "categoryScores": [
    {
      "name": "Data Infrastructure",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<max 8 words about their actual data setup>",
      "details": ["<max 10 words about their specific tools>", "<max 10 words about data readiness>", "<max 10 words about measurement capability>"]
    },
    {
      "name": "Team & Culture",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<max 8 words about their team's actual AI readiness>",
      "details": ["<max 10 words about adoption readiness>", "<max 10 words about internal champions>", "<max 10 words about training needs>"]
    },
    {
      "name": "Process & Automation",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<max 8 words about their specific workflows>",
      "details": ["<max 10 words about AI-ready workflows>", "<max 10 words about current automation>", "<max 10 words about process documentation>"]
    },
    {
      "name": "AI Strategy",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<max 8 words about their planning state>",
      "details": ["<max 10 words about budget vs goals>", "<max 10 words about pilot scoping>", "<max 10 words about success criteria>"]
    }
  ],
  "topStrengths": [
    "<max 12 words, specific to ${data.companyName}>",
    "<max 12 words>",
    "<max 12 words>"
  ],
  "criticalGaps": [
    "<max 12 words, name the specific risk or cost>",
    "<max 12 words>",
    "<max 12 words>"
  ],
  "recommendations": [
    {
      "priority": "<high|medium|low>",
      "category": "<specific category>",
      "title": "<short title naming their tools or process>",
      "description": "<1 sentence max. What needs to change for ${data.companyName} and the outcome it unlocks.>",
      "estimatedImpact": "<High|Medium|Low>",
      "estimatedEffort": "<timeframe>"
    }
  ],
  "quickWins": [
    "<max 15 words, using their existing tool ${tools.split(',')[0] || 'stack'}>",
    "<max 15 words, a peer-demonstrable result>",
    "<max 15 words, creates a measurable baseline>"
  ],
  "roadmap": [
    {
      "phase": "Phase 1: Foundation",
      "timeframe": "0 to 90 days",
      "initiatives": ["<max 8 words>", "<max 8 words>", "<max 8 words>"],
      "expectedOutcomes": ["<max 8 words>", "<max 8 words>"]
    },
    {
      "phase": "Phase 2: Pilot",
      "timeframe": "90 to 180 days",
      "initiatives": ["<max 8 words>", "<max 8 words>", "<max 8 words>"],
      "expectedOutcomes": ["<max 8 words>", "<max 8 words>"]
    },
    {
      "phase": "Phase 3: Scale",
      "timeframe": "180 to 365 days",
      "initiatives": ["<max 8 words>", "<max 8 words>", "<max 8 words>"],
      "expectedOutcomes": ["<max 8 words>", "<max 8 words>"]
    }
  ],
  "nextSteps": "<1 to 2 short sentences. Reference their score and biggest challenge. The strategy call covers the full implementation plan specific to ${data.industry}.>"
}

Scoring guide:
- overallScore = sum of 4 category scores
- Emerging: 0 to 39, Developing: 40 to 59, Advancing: 60 to 79, Leading: 80 to 100
- Include 3 to 4 recommendations (mix of high, medium, low priority)
- No AI budget: AI Strategy 5 to 10 out of 25 max
- Spreadsheets only: Data Infrastructure 3 to 8 out of 25
- No AI experience: Team & Culture scores low even if enthusiastic
- Make the reader think "this consultant truly understands my business."`
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
    <p style="color:#9ca3af;font-size:12px;margin:0">ThreeAI | AI Strategy for Growing Businesses</p>
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

    <h2 style="font-size:15px;margin:0 0 8px">What They Told Us</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px">
      <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;width:160px">What they do</td><td style="padding:8px 0;color:#374151;line-height:1.6">${data.businessDescription}</td></tr>
      <tr style="border-top:1px solid #f3f4f6"><td style="padding:8px 0;color:#6b7280;vertical-align:top">Specific AI use case</td><td style="padding:8px 0;color:#374151;line-height:1.6">${data.specificAiUseCase}</td></tr>
      <tr style="border-top:1px solid #f3f4f6"><td style="padding:8px 0;color:#6b7280;vertical-align:top">Biggest pain point</td><td style="padding:8px 0;color:#374151;line-height:1.6">${data.biggestPainPoint}</td></tr>
      ${data.successMetric ? `<tr style="border-top:1px solid #f3f4f6"><td style="padding:8px 0;color:#6b7280;vertical-align:top">Success metric</td><td style="padding:8px 0;color:#374151;line-height:1.6">${data.successMetric}</td></tr>` : ''}
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
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  // Send both emails - client copy and internal lead notification
  await Promise.allSettled([
    resend.emails.send({
      from: 'Marium at ThreeAI <onboarding@resend.dev>',
      to: data.email,
      subject: `Your AI Readiness Score: ${report.overallScore}/100 | ${data.companyName}`,
      html: buildClientEmailHtml(data, report),
    }),
    resend.emails.send({
      from: 'AI Readiness Audit <onboarding@resend.dev>',
      to: CONSULTANT_EMAIL,
      subject: `New Lead: ${data.companyName} | ${report.overallScore}/100 (${report.readinessLevel}) | ${data.contactName}`,
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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 })
    }

    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const intel = await fetchIndustryIntelligence(data.industry, data.specificAiUseCase)
    const prompt = buildPrompt(data, intel)
    let reportData: Record<string, unknown> | null = null

    for (let attempt = 0; attempt < 2; attempt++) {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8192,
        messages: [
          { role: 'user', content: prompt },
          { role: 'assistant', content: '{' },
        ],
      })

      const content = message.content[0]
      if (content.type !== 'text') continue

      let jsonText = '{' + content.text.trim()
      const end = jsonText.lastIndexOf('}')
      if (end === -1) continue
      jsonText = jsonText.slice(0, end + 1)

      jsonText = jsonText
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/[\x00-\x1f]/g, (ch) => ch === '\n' || ch === '\t' ? ch : '')
        .replace(/:\s*"([^"]*?)(?:"\s*")+/g, ': "$1')

      try {
        reportData = JSON.parse(jsonText)
        break
      } catch {
        console.error(`[Audit] JSON parse failed on attempt ${attempt + 1}, retrying...`)
      }
    }

    if (!reportData) throw new Error('Failed to generate valid report after retries')

    const report = {
      companyName: data.companyName,
      generatedAt: new Date().toISOString(),
      ...reportData,
    } as AuditReport

    // Send emails non-blocking
    sendEmails(data, report).catch((err) => console.error('Email error:', err))

    return NextResponse.json(report)
  } catch (err) {
    console.error('Report generation error:', err)
    const message = err instanceof Error ? err.message : 'Failed to generate report'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
