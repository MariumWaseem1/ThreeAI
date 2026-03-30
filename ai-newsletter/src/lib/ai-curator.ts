import Anthropic from '@anthropic-ai/sdk'
import type { NewsArticle, NewsletterIssue, SubscriberPreferences } from '@/types/newsletter'

const anthropic = new Anthropic()

// Try Groq first (free + fast), fall back to Claude
async function generateWithGroqOrClaude(prompt: string, maxTokens = 2000): Promise<string> {
  // Try Groq (free tier, very fast)
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

  // Fall back to Claude
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

export async function scoreAndFilterArticles(
  articles: NewsArticle[],
  prefs: SubscriberPreferences
): Promise<NewsArticle[]> {
  const topicList = prefs.topics.join(', ')
  const titlesJson = JSON.stringify(articles.slice(0, 40).map((a, i) => ({ i, title: a.title, source: a.source, category: a.category })))

  const prompt = `You are an AI news editor. Score these articles by relevance for a reader interested in: ${topicList}.
${prefs.customKeywords ? `They also care about: ${prefs.customKeywords}` : ''}

Rate each from 0-10 for relevance. Return ONLY a JSON array of objects: [{"i": 0, "score": 8}, ...]

Articles:
${titlesJson}`

  try {
    const raw = await generateWithGroqOrClaude(prompt, 800)
    const start = raw.indexOf('[')
    const end = raw.lastIndexOf(']')
    if (start === -1 || end === -1) throw new Error('No JSON array')
    const scores: { i: number; score: number }[] = JSON.parse(raw.slice(start, end + 1))

    return articles
      .map((a, i) => ({ ...a, relevanceScore: scores.find((s) => s.i === i)?.score || 0 }))
      .filter((a) => a.relevanceScore >= 5)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 12)
  } catch {
    // If scoring fails, just return top articles by recency
    return articles.slice(0, 8)
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
  const topStoriesJson = JSON.stringify(articles.slice(0, 8).map((a) => ({
    title: a.title,
    url: a.url,
    source: a.source,
    summary: a.summary,
    category: a.category,
  })))

  const prompt = `You are the editor of "Signal" — a premium daily AI newsletter. Today is ${today}.
Write today's newsletter issue for ${subscriberName}.

TONE: ${tone}
DEPTH: ${depth}
TOPICS OF INTEREST: ${prefs.topics.join(', ')}
${prefs.customKeywords ? `CUSTOM FOCUS: ${prefs.customKeywords}` : ''}

TODAY'S TOP STORIES:
${topStoriesJson}

Generate a newsletter issue as JSON. Return ONLY valid JSON, no other text:

{
  "date": "${today}",
  "headline": "<compelling headline for today's top story — max 12 words>",
  "intro": "<warm, personal 2-sentence intro. Reference ${subscriberName} by first name once. Set the tone for today's issue.>",
  "topStory": {
    "title": "<title from articles above>",
    "summary": "<one sentence summary>",
    "url": "<url from articles above>",
    "source": "<source from articles above>",
    "publishedAt": "<date>",
    "category": "<category>",
    "relevanceScore": 9,
    "deepDive": "<${prefs.depth === 'deep' ? '150-word' : prefs.depth === 'standard' ? '80-word' : '40-word'} analysis: what happened, why it matters, what to watch for>"
  },
  "stories": [
    {
      "title": "<title>",
      "summary": "<one sentence>",
      "url": "<url>",
      "source": "<source>",
      "publishedAt": "<date>",
      "category": "<category>",
      "relevanceScore": 7,
      "aiSummary": "<${depth} summary of this story>"
    }
  ],
  ${prefs.includeTools ? `"toolSpotlight": {
    "name": "<name of a real, relevant AI tool from the news or well-known>",
    "description": "<what it does in one sentence>",
    "url": "<real url>",
    "why": "<why this tool matters right now — 1-2 sentences>"
  },` : ''}
  ${prefs.includeResearch ? `"paperOfTheDay": {
    "title": "<paper title from arXiv if available in stories, else invent a plausible recent one>",
    "summary": "<what they did in plain terms>",
    "url": "<url>",
    "whyItMatters": "<practical implication in 1-2 sentences>"
  },` : ''}
  ${prefs.includeFunding ? `"fundingRound": {
    "company": "<company name from stories>",
    "amount": "<funding amount>",
    "what": "<what they build>",
    "whyItMatters": "<strategic significance in 1 sentence>"
  },` : ''}
  "quote": {
    "text": "<an insightful, real or plausible quote about AI — thoughtful and relevant to today's theme>",
    "author": "<real person's name>"
  },
  "closingNote": "<warm 1-2 sentence sign-off from 'Marium' that relates to today's biggest theme. Encourage the reader.>"
}

Include 4-6 stories total (not counting the top story). Make every summary specific to the actual story content.`

  const raw = await generateWithGroqOrClaude(prompt, 3000)
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Failed to generate newsletter JSON')

  const issue = JSON.parse(raw.slice(start, end + 1)) as NewsletterIssue
  return issue
}
