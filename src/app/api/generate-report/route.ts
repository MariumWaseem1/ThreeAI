import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import type { AuditFormData, AuditReport } from '@/types/audit'

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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

export async function POST(req: NextRequest) {
  try {
    const data: AuditFormData = await req.json()

    if (!data.companyName || !data.industry || !data.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
    const result = await model.generateContent(buildPrompt(data))
    const response = await result.response

    // Strip markdown code fences if present
    let jsonText = response.text().trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const reportData = JSON.parse(jsonText)

    const report: AuditReport = {
      companyName: data.companyName,
      generatedAt: new Date().toISOString(),
      ...reportData,
    }

    return NextResponse.json(report)
  } catch (err) {
    console.error('Report generation error:', err)
    const message = err instanceof Error ? err.message : 'Failed to generate report'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
