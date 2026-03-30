import type { NewsArticle, TopicCategory, SubscriberPreferences } from '@/types/newsletter'

// RSS sources — no API key required
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

// Fetch RSS feeds without external parser dependency — use native fetch + simple XML parsing
async function fetchRSSFeed(url: string, source: string): Promise<RawArticle[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 AINewsletter/1.0' },
      signal: AbortSignal.timeout(8000),
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

      if (title && link) {
        items.push({
          title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
          link,
          contentSnippet: description?.replace(/<[^>]+>/g, '').slice(0, 300),
          pubDate,
          source,
        })
      }
      if (items.length >= 10) break
    }
    return items
  } catch {
    return []
  }
}

// Hacker News — free, no API key
async function fetchHackerNews(): Promise<RawArticle[]> {
  try {
    const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      signal: AbortSignal.timeout(8000),
    })
    const ids: number[] = await res.json()
    const aiIds = ids.slice(0, 50)

    const stories = await Promise.allSettled(
      aiIds.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { signal: AbortSignal.timeout(5000) })
          .then((r) => r.json())
      )
    )

    return stories
      .filter((r): r is PromiseFulfilledResult<{ title: string; url: string; time: number; score: number }> =>
        r.status === 'fulfilled' && r.value?.url &&
        /\bai\b|artificial intelligence|machine learning|llm|gpt|claude|gemini|neural|openai|anthropic/i.test(r.value.title)
      )
      .slice(0, 8)
      .map((r) => ({
        title: r.value.title,
        link: r.value.url,
        pubDate: new Date(r.value.time * 1000).toISOString(),
        source: 'Hacker News',
      }))
  } catch {
    return []
  }
}

// Reddit — free JSON API, no key needed
async function fetchReddit(): Promise<RawArticle[]> {
  const subs = ['MachineLearning', 'artificial', 'singularity', 'OpenAI']
  const results: RawArticle[] = []

  for (const sub of subs) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=5`, {
        headers: { 'User-Agent': 'AINewsletter/1.0' },
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) continue
      const data = await res.json()
      const posts = data?.data?.children || []
      for (const post of posts) {
        const d = post.data
        if (d.stickied || d.score < 100) continue
        results.push({
          title: d.title,
          link: d.url?.startsWith('http') ? d.url : `https://reddit.com${d.permalink}`,
          contentSnippet: d.selftext?.slice(0, 200),
          pubDate: new Date(d.created_utc * 1000).toISOString(),
          source: `Reddit r/${sub}`,
        })
      }
    } catch { /* skip */ }
  }
  return results
}

// NewsAPI — free tier (100 req/day)
async function fetchNewsAPI(keywords: string[]): Promise<RawArticle[]> {
  const key = process.env.NEWSAPI_KEY
  if (!key) return []
  const q = keywords.slice(0, 3).join(' OR ')
  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=15&language=en`,
      { headers: { 'X-Api-Key': key }, signal: AbortSignal.timeout(8000) }
    )
    const data = await res.json()
    return (data.articles || []).map((a: { title: string; url: string; description?: string; publishedAt?: string; source?: { name: string } }) => ({
      title: a.title,
      link: a.url,
      contentSnippet: a.description,
      pubDate: a.publishedAt,
      source: a.source?.name || 'NewsAPI',
    }))
  } catch {
    return []
  }
}

// Map keywords to topic categories
function categorizarArticle(title: string, source: string): TopicCategory {
  const t = title.toLowerCase()
  if (/gpt|claude|gemini|llama|mistral|model release|benchmark|llm|language model/.test(t)) return 'llm_models'
  if (/tool|app|product|launch|startup|new ai|platform|software/.test(t) && !/fund|raise|series/.test(t)) return 'ai_tools'
  if (/fund|raise|series|invest|acqui|valuation|unicorn/.test(t)) return 'startups_funding'
  if (/robot|embodied|physical|hardware|actuator|boston dynamics/.test(t)) return 'robotics'
  if (/law|regulat|policy|ban|eu|congress|govern|ethic|safety|alignment/.test(t)) return 'policy_regulation'
  if (/paper|research|study|arxiv|lab|university|breakthrough|discover/.test(t)) return 'research'
  if (/art|image|video|music|creative|diffusion|midjourney|sora|dalle/.test(t)) return 'ai_art_creative'
  if (/job|career|hire|skill|workforce|replac|worker/.test(t)) return 'ai_jobs'
  if (/how to|tutorial|guide|tips|prompt|workflow|build with/.test(t)) return 'tutorials_howto'
  return 'business_ai'
}

export async function fetchAllNews(prefs: SubscriberPreferences): Promise<RawArticle[]> {
  const keywords = ['artificial intelligence', 'AI', 'machine learning', 'LLM', ...prefs.customKeywords.split(',').map((k) => k.trim()).filter(Boolean)]

  const [rssResults, hnResults, redditResults, newsApiResults] = await Promise.allSettled([
    Promise.all(RSS_SOURCES.map((s) => fetchRSSFeed(s.url, s.source))).then((r) => r.flat()),
    fetchHackerNews(),
    fetchReddit(),
    fetchNewsAPI(keywords),
  ])

  const all = [
    ...(rssResults.status === 'fulfilled' ? rssResults.value : []),
    ...(hnResults.status === 'fulfilled' ? hnResults.value : []),
    ...(redditResults.status === 'fulfilled' ? redditResults.value : []),
    ...(newsApiResults.status === 'fulfilled' ? newsApiResults.value : []),
  ]

  // Deduplicate by title similarity
  const seen = new Set<string>()
  return all.filter((a) => {
    const key = a.title.toLowerCase().slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function categorizeArticles(articles: RawArticle[]): NewsArticle[] {
  return articles.map((a) => ({
    title: a.title,
    summary: a.contentSnippet || '',
    url: a.link,
    source: a.source,
    publishedAt: a.pubDate || new Date().toISOString(),
    category: categorizarArticle(a.title, a.source),
    relevanceScore: 0,
  }))
}
