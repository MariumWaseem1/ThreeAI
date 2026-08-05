import type { NewsArticle, TopicCategory, SubscriberPreferences } from '@/types/newsletter'

// ─── RSS sources ────────────────────────────────────────────────────────────

const RSS_SOURCES = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch AI' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat AI' },
  { url: 'https://www.wired.com/feed/tag/artificial-intelligence/latest/rss', source: 'Wired AI' },
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', source: 'The Verge AI' },
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI Blog' },
  { url: 'https://www.anthropic.com/rss.xml', source: 'Anthropic Blog' },
  { url: 'https://huggingface.co/blog/feed.xml', source: 'Hugging Face' },
  { url: 'https://blog.google/technology/ai/rss/', source: 'Google AI' },
  { url: 'https://feeds.feedburner.com/mit-technology-review/T9oS', source: 'MIT Tech Review' },
  { url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', source: 'MIT Tech Review AI' },
  { url: 'https://rss.arxiv.org/rss/cs.AI', source: 'arXiv AI' },
  { url: 'https://rss.arxiv.org/rss/cs.LG', source: 'arXiv ML' },
  { url: 'https://www.marktechpost.com/feed/', source: 'MarkTechPost' },
  { url: 'https://the-decoder.com/feed/', source: 'The Decoder' },
  { url: 'https://www.artificialintelligence-news.com/feed/', source: 'AI News' },
]

interface RawArticle {
  title: string
  link: string
  contentSnippet?: string
  content?: string
  pubDate?: string
  isoDate?: string
  source: string
}

function isRecent(dateStr: string | undefined, hoursAgo: number = 48): boolean {
  if (!dateStr) return true
  try {
    const pubTime = new Date(dateStr).getTime()
    if (isNaN(pubTime)) return true
    return Date.now() - pubTime < hoursAgo * 60 * 60 * 1000
  } catch {
    return true
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&apos;/g, "'")
}

async function fetchRSSFeed(url: string, source: string): Promise<RawArticle[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 SignalNewsletter/1.0 (AI news aggregator)' },
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items: RawArticle[] = []
    const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)

    for (const match of itemMatches) {
      const item = match[1]
      const title = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim()
      const link = item.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i)?.[1]?.trim()
        || item.match(/<guid[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\s<]+)(?:\]\]>)?<\/guid>/i)?.[1]?.trim()
      const description = item.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim()
      const pubDate = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i)?.[1]?.trim()
        || item.match(/<dc:date[^>]*>(.*?)<\/dc:date>/i)?.[1]?.trim()

      if (title && link && isRecent(pubDate)) {
        items.push({
          title: decodeHtmlEntities(title),
          link,
          contentSnippet: description?.replace(/<[^>]+>/g, '').slice(0, 400),
          pubDate,
          source,
        })
      }
      if (items.length >= 12) break
    }
    return items
  } catch {
    return []
  }
}

// ─── Hacker News — free, no API key ────────────────────────────────────────

const AI_KEYWORDS = /\bai\b|artificial intelligence|machine learning|llm|gpt|claude|gemini|neural|openai|anthropic|mistral|llama|deepseek|midjourney|stable diffusion|hugging\s?face|transformer|fine.?tun|langchain|rag\b|vector\s?db/i

async function fetchHackerNews(): Promise<RawArticle[]> {
  try {
    const [topRes, newRes] = await Promise.all([
      fetch('https://hacker-news.firebaseio.com/v0/topstories.json', { signal: AbortSignal.timeout(8000), cache: 'no-store' }),
      fetch('https://hacker-news.firebaseio.com/v0/newstories.json', { signal: AbortSignal.timeout(8000), cache: 'no-store' }),
    ])
    const topIds: number[] = await topRes.json()
    const newIds: number[] = await newRes.json()

    const combinedIds = [...new Set([...topIds.slice(0, 60), ...newIds.slice(0, 40)])]

    const stories = await Promise.allSettled(
      combinedIds.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { signal: AbortSignal.timeout(5000), cache: 'no-store' })
          .then((r) => r.json())
      )
    )

    return stories
      .filter((r): r is PromiseFulfilledResult<{ title: string; url: string; time: number; score: number }> =>
        r.status === 'fulfilled' && r.value?.url && r.value?.title &&
        AI_KEYWORDS.test(r.value.title) &&
        isRecent(new Date(r.value.time * 1000).toISOString(), 48)
      )
      .sort((a, b) => b.value.score - a.value.score)
      .slice(0, 10)
      .map((r) => ({
        title: r.value.title,
        link: r.value.url,
        pubDate: new Date(r.value.time * 1000).toISOString(),
        source: `Hacker News (${r.value.score} pts)`,
      }))
  } catch {
    return []
  }
}

// ─── Reddit — JSON API with OAuth for reliability ──────────────────────────

const REDDIT_AI_SUBS = [
  'MachineLearning',
  'artificial',
  'singularity',
  'OpenAI',
  'LocalLLaMA',
  'ChatGPT',
  'StableDiffusion',
  'ArtificialIntelligence',
]

async function getRedditAccessToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  try {
    const res = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'SignalNewsletter/1.0',
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return data.access_token || null
  } catch {
    return null
  }
}

async function fetchRedditOAuth(token: string, sub: string): Promise<RawArticle[]> {
  try {
    const res = await fetch(`https://oauth.reddit.com/r/${sub}/hot?limit=10&t=day`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'SignalNewsletter/1.0',
      },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    const posts = data?.data?.children || []
    const results: RawArticle[] = []

    for (const post of posts) {
      const d = post.data
      if (d.stickied || d.score < 50) continue
      if (!isRecent(new Date(d.created_utc * 1000).toISOString(), 48)) continue
      results.push({
        title: d.title,
        link: d.url?.startsWith('http') ? d.url : `https://reddit.com${d.permalink}`,
        contentSnippet: d.selftext?.slice(0, 300),
        pubDate: new Date(d.created_utc * 1000).toISOString(),
        source: `Reddit r/${sub} (${d.score} upvotes)`,
      })
    }
    return results
  } catch {
    return []
  }
}

async function fetchRedditPublic(sub: string): Promise<RawArticle[]> {
  try {
    const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=8&t=day`, {
      headers: { 'User-Agent': 'SignalNewsletter/1.0' },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    const posts = data?.data?.children || []
    const results: RawArticle[] = []

    for (const post of posts) {
      const d = post.data
      if (d.stickied || d.score < 50) continue
      if (!isRecent(new Date(d.created_utc * 1000).toISOString(), 48)) continue
      results.push({
        title: d.title,
        link: d.url?.startsWith('http') ? d.url : `https://reddit.com${d.permalink}`,
        contentSnippet: d.selftext?.slice(0, 300),
        pubDate: new Date(d.created_utc * 1000).toISOString(),
        source: `Reddit r/${sub}`,
      })
    }
    return results
  } catch {
    return []
  }
}

async function fetchReddit(): Promise<RawArticle[]> {
  const token = await getRedditAccessToken()
  const results: RawArticle[] = []

  const fetches = await Promise.allSettled(
    REDDIT_AI_SUBS.map((sub) =>
      token ? fetchRedditOAuth(token, sub) : fetchRedditPublic(sub)
    )
  )

  for (const r of fetches) {
    if (r.status === 'fulfilled') results.push(...r.value)
  }

  return results
    .sort((a, b) => {
      const scoreA = parseInt(a.source.match(/(\d+)/)?.[1] || '0')
      const scoreB = parseInt(b.source.match(/(\d+)/)?.[1] || '0')
      return scoreB - scoreA
    })
    .slice(0, 15)
}

// ─── NewsAPI — free tier (100 req/day) ─────────────────────────────────────

async function fetchNewsAPI(keywords: string[]): Promise<RawArticle[]> {
  const key = process.env.NEWSAPI_KEY
  if (!key) return []

  const today = new Date()
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const fromDate = yesterday.toISOString().split('T')[0]

  const queries = [
    'artificial intelligence',
    'AI startup OR AI funding',
    ...keywords.slice(0, 2),
  ]

  const allArticles: RawArticle[] = []

  for (const q of queries) {
    try {
      const params = new URLSearchParams({
        q,
        from: fromDate,
        sortBy: 'publishedAt',
        pageSize: '10',
        language: 'en',
      })
      const res = await fetch(
        `https://newsapi.org/v2/everything?${params}`,
        {
          headers: { 'X-Api-Key': key },
          signal: AbortSignal.timeout(10000),
          cache: 'no-store',
        }
      )
      if (!res.ok) continue
      const data = await res.json()

      for (const a of data.articles || []) {
        if (!a.title || a.title === '[Removed]') continue
        allArticles.push({
          title: a.title,
          link: a.url,
          contentSnippet: a.description || '',
          pubDate: a.publishedAt,
          source: a.source?.name || 'NewsAPI',
        })
      }
    } catch {
      continue
    }
  }

  return allArticles
}

// ─── NewsAPI top headlines (separate endpoint, separate quota bucket) ───────

async function fetchNewsAPIHeadlines(): Promise<RawArticle[]> {
  const key = process.env.NEWSAPI_KEY
  if (!key) return []

  try {
    const params = new URLSearchParams({
      q: 'AI OR artificial intelligence',
      category: 'technology',
      pageSize: '10',
      language: 'en',
    })
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?${params}`,
      {
        headers: { 'X-Api-Key': key },
        signal: AbortSignal.timeout(10000),
        cache: 'no-store',
      }
    )
    if (!res.ok) return []
    const data = await res.json()

    return (data.articles || [])
      .filter((a: { title: string }) => a.title && a.title !== '[Removed]')
      .map((a: { title: string; url: string; description?: string; publishedAt?: string; source?: { name: string } }) => ({
        title: a.title,
        link: a.url,
        contentSnippet: a.description || '',
        pubDate: a.publishedAt,
        source: `${a.source?.name || 'NewsAPI'} (Headlines)`,
      }))
  } catch {
    return []
  }
}

// ─── Category mapping ──────────────────────────────────────────────────────

function categorizeArticle(title: string, snippet: string): TopicCategory {
  const t = `${title} ${snippet}`.toLowerCase()
  if (/gpt|claude|gemini|llama|mistral|model release|benchmark|llm|language model|deepseek|phi-|qwen/i.test(t)) return 'llm_models'
  if (/tool|app|product|launch|startup|new ai|platform|software|copilot|cursor|replit/i.test(t) && !/fund|raise|series/.test(t)) return 'ai_tools'
  if (/fund|raise|series|invest|acqui|valuation|unicorn|ipo|$\d+[mb]/i.test(t)) return 'startups_funding'
  if (/robot|embodied|physical|hardware|actuator|boston dynamics|humanoid|figure\s/i.test(t)) return 'robotics'
  if (/law|regulat|policy|ban|eu|congress|govern|ethic|safety|alignment|aisafety/i.test(t)) return 'policy_regulation'
  if (/paper|research|study|arxiv|lab|university|breakthrough|discover|conference|neurips|icml/i.test(t)) return 'research'
  if (/art|image|video|music|creative|diffusion|midjourney|sora|dalle|flux|kling|runway/i.test(t)) return 'ai_art_creative'
  if (/job|career|hire|skill|workforce|replac|worker|layoff|automat/i.test(t)) return 'ai_jobs'
  if (/how to|tutorial|guide|tips|prompt|workflow|build with|step.by.step/i.test(t)) return 'tutorials_howto'
  return 'business_ai'
}

// ─── Main orchestrator ─────────────────────────────────────────────────────

export async function fetchAllNews(prefs: SubscriberPreferences): Promise<RawArticle[]> {
  const keywords = [
    'artificial intelligence', 'AI', 'machine learning', 'LLM',
    ...prefs.customKeywords.split(',').map((k) => k.trim()).filter(Boolean),
  ]

  const [rssResults, hnResults, redditResults, newsApiResults, headlineResults] = await Promise.allSettled([
    Promise.all(RSS_SOURCES.map((s) => fetchRSSFeed(s.url, s.source))).then((r) => r.flat()),
    fetchHackerNews(),
    fetchReddit(),
    fetchNewsAPI(keywords),
    fetchNewsAPIHeadlines(),
  ])

  const all = [
    ...(rssResults.status === 'fulfilled' ? rssResults.value : []),
    ...(hnResults.status === 'fulfilled' ? hnResults.value : []),
    ...(redditResults.status === 'fulfilled' ? redditResults.value : []),
    ...(newsApiResults.status === 'fulfilled' ? newsApiResults.value : []),
    ...(headlineResults.status === 'fulfilled' ? headlineResults.value : []),
  ]

  // Log source counts for debugging
  const sourceCounts = {
    rss: rssResults.status === 'fulfilled' ? rssResults.value.length : 0,
    hn: hnResults.status === 'fulfilled' ? hnResults.value.length : 0,
    reddit: redditResults.status === 'fulfilled' ? redditResults.value.length : 0,
    newsapi: newsApiResults.status === 'fulfilled' ? newsApiResults.value.length : 0,
    headlines: headlineResults.status === 'fulfilled' ? headlineResults.value.length : 0,
  }
  console.log(`[Signal] Fetched articles: ${JSON.stringify(sourceCounts)} — total raw: ${all.length}`)

  // Deduplicate by normalised title similarity
  const seen = new Set<string>()
  const deduped = all.filter((a) => {
    const key = a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Sort by recency
  deduped.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0
    return dateB - dateA
  })

  console.log(`[Signal] After dedup: ${deduped.length} articles`)
  return deduped
}

export function categorizeArticles(articles: RawArticle[]): NewsArticle[] {
  return articles.map((a) => ({
    title: a.title,
    summary: a.contentSnippet || '',
    url: a.link,
    source: a.source,
    publishedAt: a.pubDate || new Date().toISOString(),
    category: categorizeArticle(a.title, a.contentSnippet || ''),
    relevanceScore: 0,
  }))
}
