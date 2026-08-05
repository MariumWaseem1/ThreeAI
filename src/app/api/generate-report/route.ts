import { NextRequest, NextResponse } from 'next/server'
import type { AuditFormData, AuditReport } from '@/types/audit'
const CONSULTANT_EMAIL = 'mariumw784@gmail.com'
const BOOKING_LINK = `mailto:${CONSULTANT_EMAIL}?subject=AI%20Strategy%20Call%20Request`

function buildPrompt(data: AuditFormData): string {
  const tools = [...data.currentTools, data.customTools].filter(Boolean).join(', ')

  return `You are Marium, a senior AI strategy consultant who has led AI rollouts across financial services, media, legal, and enterprise teams. You use battle-tested frameworks from real engagements — not generic advice. You are writing a personalised AI Readiness Audit for ${data.companyName}, a ${data.teamSize} team in ${data.industry}.

THEIR SPECIFIC SITUATION:
- Company: ${data.companyName}
- Industry: ${data.industry}
- Team: ${data.teamSize} people${data.annualRevenue ? `, revenue ${data.annualRevenue}` : ''}
- Contact: ${data.contactName}${data.jobTitle ? `, ${data.jobTitle}` : ''}

WHAT THEY ACTUALLY DO (use this to make the report ultra-specific):
"${data.businessDescription}"

WHAT THEY WANT AI TO DO FOR THEM SPECIFICALLY:
"${data.specificAiUseCase}"

THEIR BIGGEST OPERATIONAL PAIN POINT RIGHT NOW:
"${data.biggestPainPoint}"

HOW THEY MEASURE SUCCESS:
"${data.successMetric || 'Not specified'}"

TECHNOLOGY & MATURITY:
- Current tools: ${tools || 'Not specified'}
- Data setup: ${data.dataInfrastructure || 'Not specified'}
- AI usage today: ${data.currentAiUsage}
- Team AI experience: ${data.aiExperience || 'Not specified'}
- AI budget: ${data.budgetRange || 'Not allocated'}
- High-level goals: ${data.primaryGoals.join(', ')}
- What's holding them back: ${data.biggestChallenges.join(', ')}
- Timeframe: ${data.timeframe || 'Not specified'}

YOUR PROPRIETARY FRAMEWORKS (use these to shape the report — they are what make your consultancy unique):

TRAIL FRAMEWORK — Use this to structure the roadmap phases:
- Translate: Map their business pain point into specific AI-addressable tasks. Never start with the technology — start with the workflow they described. Ask "what does this person actually do 50 times a day?" and build from there.
- Risk-check: Before recommending any AI tool, identify data jurisdiction issues, compliance requirements for their industry, and what happens if the AI is wrong. For ${data.industry}, flag industry-specific risks.
- Attempt: Start with ONE use case (their specific one: "${data.specificAiUseCase}"), run a controlled pilot with a small group, measure before and after. Never recommend a big-bang rollout.
- Instrument: Build feedback loops — track adoption rates, time saved, error rates. The baseline must be measured BEFORE touching anything.
- Land: Make AI part of onboarding, build a prompt library, ensure the tool survives when the champion leaves. Define success criteria upfront so everyone knows what "done" looks like.

DIAGNOSE FRAMEWORK — Use this to assess Team & Culture score:
- Talk to BOTH groups: enthusiasts AND sceptics. The real blockers are usually psychological, not technical.
- Distinguish data quality problems from adoption resistance — they need different solutions.
- A peer demo from someone at their level beats any formal training session.
- The first ask should be tiny — "try this one task for one week" not "transform your workflow."
- Attendance at training is a vanity metric. Measure whether people are still using the tool 30 days later.
- Specificity drives engagement: "Save 2 hours on weekly reporting" beats "AI will transform your productivity."

PRIORITISE FRAMEWORK — Use this to rank recommendations:
Score each recommendation on 4 criteria (each 1-5):
1. Impact: How much time/money does this save or how much revenue does it unlock?
2. Scale: How many people or processes does this affect?
3. Security risk: What's the worst case if it goes wrong? (Higher risk = lower priority unless mitigated)
4. Adoption likelihood: Will the team actually use this given their current culture and skills?
Communicate priority across ALL teams, not just leadership. Listen for 30 days before locking in priorities. Use the first successful rollout to fund the next one.

MEASURE FRAMEWORK — Use this for the Data Infrastructure assessment and ROI projections:
- Baseline DURING the Translate phase, not after. If you cannot measure the current state, you cannot prove AI helped.
- Translate time savings into cost: "4 hours/week x 12 people x average hourly rate = real money."
- Produce a one-page impact summary every time — executives need a single page, not a dashboard.
- Validate metrics with team leads, not just management. If the team says the numbers are wrong, they are.

ETHICS & RISK — Use this for compliance and risk assessment:
- If sensitive data is involved, stop first — do not assume existing permissions cover AI use cases.
- AI bias is real, especially in hiring, lending, and customer-facing decisions. Flag this for ${data.industry} if relevant.
- Find a safe way to use AI rather than abandoning the use case entirely.
- Log and share governance guidance — one team's lesson should protect the whole company.

CRISIS AWARENESS — Reference this in critical gaps if relevant:
- If AI produces errors in client-facing work, the fix must happen the same day. System fix, not blame.
- Unapproved tools spreading through the team is a security risk, not just a policy issue. Offer a sanctioned alternative.

LANGUAGE PRINCIPLES (follow these in ALL report text):
- Never say "you need to adopt AI" — say "here is the specific workflow where AI removes your bottleneck"
- Never say "your team needs training" — say "your team needs to see a peer use this on a real task"
- Never say "you should invest in data infrastructure" — say "your [specific system] needs [specific change] before AI can read it"
- Never say "AI will transform your business" — say "AI can cut [specific task] from [current time] to [target time]"
- Use phrases like: "The technology is almost never the problem", "Diagnose before prescribing", "Peer stories beat any training you can run"

REAL CASE STUDY PATTERNS (draw on these for recommendations — do not copy verbatim but use the insights):
- When teams resist AI tools, the issue is usually that leadership mandated without demonstrating value. Fix: find one enthusiastic user, get them results, let them evangelise.
- When AI adoption drops after initial excitement, it usually means the tool does not fit the actual workflow. Fix: shadow users, find where the friction is, adjust.
- When a lunch-and-learn about AI gets low attendance, it is because the topic was too generic. Fix: title it around a specific pain point the audience has.
- When multiple teams want AI but the budget is limited, score opportunities on Impact x Scale x Security x Adoption likelihood. Start with the highest scorer, use its ROI to fund the next.
- A sceptical executive needs a one-page cost-impact summary with before/after numbers — not a demo.
- Never recommend a tool without a plan for what happens when the person who set it up leaves.

CRITICAL RULES FOR THIS REPORT:
1. The business description, specific AI use case, and pain point fields above are your most important inputs. Build the ENTIRE report around what they told you — not around the industry in general.
2. The executiveSummary must directly reference what they said they do ("${data.businessDescription.slice(0, 80)}..."), their specific pain point, and their specific AI use case. Weave in a TRAIL-informed perspective — show you understand their workflow before prescribing solutions. No generic statements.
3. Category scores must reflect their ACTUAL situation. Use the DIAGNOSE framework for Team & Culture, MEASURE framework for Data Infrastructure, and PRIORITISE framework for AI Strategy scoring.
4. Recommendations must address their specific pain point and use case directly. Name the actual process or problem they described. Score each using the PRIORITISE 4-criteria method internally. Show WHAT needs to change and WHY — but NOT the step-by-step HOW (that is what the strategy call unlocks). End each high-priority recommendation with a specific business outcome they would get (e.g. "cutting quote time from 3 hours to 10 minutes").
5. Quick wins: give 2-3 things they can do THIS WEEK using tools they already mentioned (${tools || 'their existing stack'}), directly addressing their stated pain point. Frame each as "try this one thing" — keep the first ask tiny.
6. Roadmap: structure the 3 phases using TRAIL methodology (Phase 1 = Translate + Risk-check, Phase 2 = Attempt + Instrument, Phase 3 = Land + Scale). Name each phase around their specific use case and pain point.
7. nextSteps: reference their specific score, their specific use case, and hint that the strategy call covers the full TRAIL implementation plan, proprietary prompt libraries, and hands-on rollout support that this audit can only diagnose.

Generate ONLY valid JSON, no other text:

{
  "overallScore": <integer 0-100, honestly reflecting their situation>,
  "readinessLevel": <"Emerging"|"Developing"|"Advancing"|"Leading">,
  "executiveSummary": "<3 paragraphs. Para 1: where ${data.companyName} stands today — reference their specific workflow and what you diagnosed using the TRAIL lens. Para 2: the specific opportunity they are missing and the cost of inaction (translate time to money using MEASURE principles). Para 3: what becomes possible with the right approach — reference their goals of ${data.primaryGoals.slice(0,2).join(' and ')} and hint at the TRAIL methodology without giving away the full implementation.>",
  "categoryScores": [
    {
      "name": "Data Infrastructure",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<one sentence using MEASURE framework — can they baseline their current state?>",
      "details": ["<finding referencing their specific tools and data readiness>", "<finding on whether current data can feed AI workflows>", "<finding on measurement capability>"]
    },
    {
      "name": "Team & Culture",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<one sentence using DIAGNOSE framework — what is the real adoption blocker?>",
      "details": ["<finding on team readiness and likely resistance patterns>", "<finding on whether they have internal champions>", "<finding on training approach needed>"]
    },
    {
      "name": "Process & Automation",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<one sentence specific to their industry processes and TRAIL Translate potential>",
      "details": ["<finding on which workflows are AI-addressable>", "<finding on current automation level>", "<finding on process documentation state>"]
    },
    {
      "name": "AI Strategy",
      "score": <0-25>,
      "maxScore": 25,
      "summary": "<one sentence using PRIORITISE framework — do they have a scored, sequenced plan?>",
      "details": ["<finding on budget alignment to goals>", "<finding on whether use case is scoped for a pilot>", "<finding on success criteria definition>"]
    }
  ],
  "topStrengths": [
    "<strength specific to their actual situation — frame as TRAIL-ready advantage>",
    "<strength>",
    "<strength>"
  ],
  "criticalGaps": [
    "<gap specific to their situation — name the specific risk or cost of inaction, using MEASURE to quantify where possible>",
    "<gap framed through DIAGNOSE lens — what will happen if this is not addressed>",
    "<gap>"
  ],
  "recommendations": [
    {
      "priority": "high",
      "category": "<specific category>",
      "title": "<specific title naming their industry or tools>",
      "description": "<2 sentences: what the problem is for ${data.companyName} specifically and what outcome fixing it would unlock — scored using Impact/Scale/Security/Adoption criteria but do NOT reveal the scoring method>",
      "estimatedImpact": "<High|Medium|Low>",
      "estimatedEffort": "<timeframe>"
    }
  ],
  "quickWins": [
    "<specific actionable win using one of their existing tools: ${tools.split(',')[0] || 'their current stack'} — keep the first ask tiny>",
    "<specific actionable win framed as a peer-demonstrable result>",
    "<specific actionable win that creates a measurable baseline>"
  ],
  "roadmap": [
    {
      "phase": "Phase 1: Translate & Risk-Check — ${data.industry} Foundation",
      "timeframe": "0-90 days",
      "initiatives": ["<map their specific pain point to AI-addressable tasks>", "<establish baselines using MEASURE methodology>", "<identify and mitigate ${data.industry}-specific risks>"],
      "expectedOutcomes": ["<outcome: clear pilot scope with success criteria defined>", "<outcome tied to their stated goal>"]
    },
    {
      "phase": "Phase 2: Attempt & Instrument — Controlled Pilot",
      "timeframe": "90-180 days",
      "initiatives": ["<run controlled pilot for their specific use case>", "<build feedback loops and track adoption>", "<develop prompt library for their workflows>"],
      "expectedOutcomes": ["<outcome: measured before/after comparison>", "<outcome: team adoption evidence>"]
    },
    {
      "phase": "Phase 3: Land & Scale — Embed Permanently",
      "timeframe": "180-365 days",
      "initiatives": ["<make AI part of onboarding and standard process>", "<expand to second use case funded by first pilot's ROI>", "<build governance framework>"],
      "expectedOutcomes": ["<outcome tied to their stated goal of ${data.primaryGoals[0] || 'growth'}>", "<outcome: AI survives personnel changes>"]
    }
  ],
  "nextSteps": "<2-3 sentences. Reference their specific score and their biggest challenge (${data.biggestChallenges[0] || 'adoption'}). Explain that this audit diagnosed WHERE they stand — the strategy call maps out the full implementation using the TRAIL methodology, including a tailored prompt library, pilot design, and rollout plan specific to ${data.industry}. A focused 30-minute session can shortcut months of trial and error.>"
}

Scoring guide (be honest, not generous):
- overallScore = sum of 4 category scores
- Emerging: 0-39, Developing: 40-59, Advancing: 60-79, Leading: 80-100
- Include 4-6 recommendations (mix of high/medium/low, scored internally using PRIORITISE criteria)
- If they have no AI budget, AI Strategy score should be 5-10/25 max
- If they use only spreadsheets, Data Infrastructure should be 3-8/25
- If they have no AI experience, Team & Culture should reflect DIAGNOSE assessment — even enthusiastic teams without a plan score low
- Remember: diagnose before prescribing. The report should make the reader think "this consultant truly understands my business" — that is what drives the strategy call booking.`
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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 })
    }

    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      messages: [{ role: 'user', content: buildPrompt(data) }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    let jsonText = content.text.trim()
    const start = jsonText.indexOf('{')
    const end = jsonText.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('No JSON found in response')
    jsonText = jsonText.slice(start, end + 1)

    jsonText = jsonText
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\x00-\x1f]/g, (ch) => ch === '\n' || ch === '\t' ? ch : '')

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
