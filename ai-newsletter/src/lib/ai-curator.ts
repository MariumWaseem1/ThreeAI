import type { NewsArticle, NewsletterIssue, SubscriberPreferences } from '@/types/newsletter'

async function generateWithGroqOrClaude(prompt: string, maxTokens = 2000): Promise<string> {
  // Try Groq first (free tier, very fast)
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(30000),
      })
      const data = await res.json()
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content
      }
    } catch { /* fall through to Claude */ }
  }

  // Fall back to Claude (lazy init to avoid build-time errors)
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const anthropic = new Anthropic()
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })
  const content = msg.content[0]
  return content.type === 'text' ? content.text : ''
}

function toneInstruction(tone: SubscriberPreferences['tone']): string {
  switch (tone) {
    case 'technical':  return 'Write for engineers and researchers. Use precise technical language, mention model architectures, benchmarks, and implementation details where relevant.'
    case 'business':   return 'Write for business leaders. Focus on ROI, competitive implications, adoption timelines, and what this means for their industry.'
    case 'beginner':   return 'Write in plain English. Avoid jargon. When a technical term is needed, explain it in brackets. Make it accessible to someone new to AI.'
    case 'fun':        return 'Write in a warm, witty, conversational tone. Light analogies, occasional humor, engaging and human. Not corporate.'
  }
}

function depthInstruction(depth: SubscriberPreferences['depth']): string {
  switch (depth) {
    case 'quick':    return 'Keep it short — 2-3 bullet points per story, max 50 words each.'
    case 'standard': return 'Write 2-3 sentences per story. Clear and informative.'
    case 'deep':     return 'Write a full paragraph (100-150 words) per story with context, implications, and analysis.'
  }
}

function recencyBonus(dateStr: string): number {
  try {
    const hoursOld = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60)
    if (hoursOld < 6) return 2
    if (hoursOld < 12) return 1.5
    if (hoursOld < 24) return 1
    return 0
  } catch { return 0 }
}

export async function scoreAndFilterArticles(
  articles: NewsArticle[],
  prefs: SubscriberPreferences
): Promise<NewsArticle[]> {
  const topicList = prefs.topics.join(', ')
  const articlesToScore = articles.slice(0, 50)
  const titlesJson = JSON.stringify(articlesToScore.map((a, i) => ({
    i,
    title: a.title,
    source: a.source,
    category: a.category,
    snippet: a.summary.slice(0, 100),
  })))

  const prompt = `You are an AI news editor curating a daily newsletter. Score these articles by relevance for a reader interested in: ${topicList}.
${prefs.customKeywords ? `They also care about: ${prefs.customKeywords}` : ''}

SCORING RULES:
- 9-10: Breaking/major news directly in their topic areas
- 7-8: Relevant and interesting to their interests
- 5-6: Somewhat related, worth knowing
- 1-4: Not very relevant to their interests
- Favour articles from credible sources (TechCrunch, Wired, arXiv, etc.)
- Penalise clickbait, listicles, or vague titles

Return ONLY a JSON array: [{"i": 0, "score": 8}, ...]

Articles:
${titlesJson}`

  try {
    const raw = await generateWithGroqOrClaude(prompt, 1200)
    const start = raw.indexOf('[')
    const end = raw.lastIndexOf(']')
    if (start === -1 || end === -1) throw new Error('No JSON array')
    const scores: { i: number; score: number }[] = JSON.parse(raw.slice(start, end + 1))

    const scored = articlesToScore
      .map((a, i) => {
        const aiScore = scores.find((s) => s.i === i)?.score || 0
        const bonus = recencyBonus(a.publishedAt)
        return { ...a, relevanceScore: Math.min(10, aiScore + bonus) }
      })
      .filter((a) => a.relevanceScore >= 5)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 15)

    console.log(`[Signal] Scored ${articlesToScore.length} articles, ${scored.length} passed threshold`)
    return scored
  } catch (err) {
    console.error('[Signal] Scoring failed, falling back to recency:', err)
    return articles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 10)
  }
}

export async function buildNewsletterIssue(
  articles: NewsArticle[],
  prefs: SubscriberPreferences,
  subscriberName: string
): Promise<NewsletterIssue> {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const tone = toneInstruction(prefs.tone)
  const depth = depthInstruction(prefs.depth)
  const topStoriesJson = JSON.stringify(articles.slice(0, 10).map((a) => ({
    title: a.title,
    url: a.url,
    source: a.source,
    summary: a.summary,
    category: a.category,
    publishedAt: a.publishedAt,
  })))

  const prompt = `You are the editor of "Signal" — a premium daily AI newsletter by Marium, an AI strategy consultant who has led real AI rollouts across financial services, media, legal, and enterprise teams. Today is ${today}.
Write today's newsletter issue for ${subscriberName}.

TONE: ${tone}
DEPTH: ${depth}
TOPICS OF INTEREST: ${prefs.topics.join(', ')}
${prefs.customKeywords ? `CUSTOM FOCUS: ${prefs.customKeywords}` : ''}

MARIUM'S CONSULTANT PERSPECTIVE — weave these insights naturally into story analysis and the closing note:
- The technology is almost never the problem — adoption, workflow fit, and change management are.
- Diagnose before prescribing: when covering new AI tools or launches, note what problem they actually solve, not just what they do.
- Peer stories beat any training: when covering adoption stories, highlight what made it work at the team level.
- When an AI product fails or has issues, the fix should be systemic (process, guardrails) not blame-based.
- AI bias is real, especially in hiring, lending, and content moderation. Flag it when relevant.
- The first step to any AI rollout is mapping the workflow, not choosing the tool (TRAIL methodology).
- Measure before you touch anything — if you cannot prove the baseline, you cannot prove AI helped.
- For tool spotlights: note not just what the tool does, but what workflow it fits into and what success looks like.

IMPORTANT: Only reference REAL articles from the list below. Do not invent URLs or article titles. Use ONLY the URLs and titles provided. Every story must come from this list.

TODAY'S TOP STORIES:
${topStoriesJson}

Generate a newsletter issue as JSON. Return ONLY valid JSON, no other text:

{
  "date": "${today}",
  "headline": "<compelling headline for today's top story — max 12 words>",
  "intro": "<warm, personal 2-sentence intro. Reference ${subscriberName} by first name once. Set the tone for today's issue.>",
  "topStory": {
    "title": "<EXACT title from articles above>",
    "summary": "<one sentence summary>",
    "url": "<EXACT url from articles above>",
    "source": "<source from articles above>",
    "publishedAt": "<date from articles>",
    "category": "<category>",
    "relevanceScore": 9,
    "deepDive": "<${prefs.depth === 'deep' ? '150-word' : prefs.depth === 'standard' ? '80-word' : '40-word'} analysis: what happened, why it matters, what to watch for. Add a 'Consultant's lens' angle — what should teams actually do about this news?>"
  },
  "stories": [
    {
      "title": "<EXACT title from articles>",
      "summary": "<one sentence>",
      "url": "<EXACT url from articles>",
      "source": "<source>",
      "publishedAt": "<date>",
      "category": "<category>",
      "relevanceScore": 7,
      "aiSummary": "<${depth} summary of this story — include a practical 'so what' angle when relevant>"
    }
  ],
  ${prefs.includeTools ? `"toolSpotlight": {
    "name": "<name of a real, relevant AI tool>",
    "description": "<what it does in one sentence>",
    "url": "<real url>",
    "why": "<why this tool matters right now — 1-2 sentences. Include what workflow it fits and what success looks like, not just features.>"
  },` : ''}
  ${prefs.includeResearch ? `"paperOfTheDay": {
    "title": "<paper title, prefer from arXiv articles above if any>",
    "summary": "<what they did in plain terms>",
    "url": "<url>",
    "whyItMatters": "<practical implication in 1-2 sentences — how would a real team use this?>"
  },` : ''}
  ${prefs.includeFunding ? `"fundingRound": {
    "company": "<company name from stories if any funding story exists>",
    "amount": "<funding amount>",
    "what": "<what they build>",
    "whyItMatters": "<strategic significance in 1 sentence — what does this mean for teams considering this space?>"
  },` : ''}
  "consultantCorner": "<1-2 sentences of Marium's take on today's biggest theme. Draw from real rollout experience. Could be a pattern she has seen ('Every time I see a team try X without Y, this happens...'), a reframe ('The real story here is not the tool — it is...'), or tactical advice ('If you are evaluating this, start by...'). Write in first person as Marium. Warm but authoritative.>",
  "quote": {
    "text": "<an insightful real quote about AI — thoughtful and relevant to today's theme>",
    "author": "<real person's name>"
  },
  "closingNote": "<warm 1-2 sentence sign-off from 'Marium' that ties back to the consultant corner insight. Encourage the reader to think about how today's news affects their own workflow. End with a forward-looking thought.>"
}

Include 4-6 stories total (not counting the top story). Make every summary specific to the actual story content. Do NOT invent articles or URLs.`

  const raw = await generateWithGroqOrClaude(prompt, 3000)
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Failed to generate newsletter JSON')

  const issue = JSON.parse(raw.slice(start, end + 1)) as NewsletterIssue
  return issue
}
