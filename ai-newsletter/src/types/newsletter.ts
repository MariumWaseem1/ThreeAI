export type TopicCategory =
  | 'llm_models'
  | 'ai_tools'
  | 'business_ai'
  | 'research'
  | 'ai_art_creative'
  | 'robotics'
  | 'policy_regulation'
  | 'startups_funding'
  | 'ai_jobs'
  | 'tutorials_howto'

export type DigestDepth = 'quick' | 'standard' | 'deep'
export type TonePreference = 'technical' | 'business' | 'beginner' | 'fun'
export type DeliveryFrequency = 'daily' | 'weekdays' | 'weekly'

export interface SubscriberPreferences {
  topics: TopicCategory[]
  depth: DigestDepth
  tone: TonePreference
  frequency: DeliveryFrequency
  includeTools: boolean        // spotlight a new AI tool each issue
  includeJobs: boolean         // AI job picks
  includeResearch: boolean     // arXiv paper of the day
  includeFunding: boolean      // startup funding news
  customKeywords: string       // e.g. "healthcare AI, legal AI"
}

export interface Subscriber {
  id: string
  email: string
  firstName: string
  confirmed: boolean
  confirmToken: string
  unsubscribeToken: string
  preferences: SubscriberPreferences
  referralCode: string
  referredBy?: string
  createdAt: string
}

export interface NewsArticle {
  title: string
  summary: string
  url: string
  source: string
  publishedAt: string
  category: TopicCategory
  relevanceScore: number
  imageUrl?: string
}

export interface NewsletterIssue {
  date: string
  headline: string
  intro: string
  topStory: NewsArticle & { deepDive: string }
  stories: (NewsArticle & { aiSummary: string })[]
  toolSpotlight?: { name: string; description: string; url: string; why: string }
  paperOfTheDay?: { title: string; summary: string; url: string; whyItMatters: string }
  fundingRound?: { company: string; amount: string; what: string; whyItMatters: string }
  quote: { text: string; author: string }
  closingNote: string
}

export const TOPIC_OPTIONS: { value: TopicCategory; label: string; description: string }[] = [
  { value: 'llm_models',        label: 'LLM & Models',         description: 'GPT, Claude, Gemini releases & benchmarks' },
  { value: 'ai_tools',          label: 'AI Tools',             description: 'New products, apps & workflows' },
  { value: 'business_ai',       label: 'AI in Business',       description: 'Enterprise adoption & case studies' },
  { value: 'research',          label: 'Research & Papers',    description: 'Breakthroughs from labs & universities' },
  { value: 'ai_art_creative',   label: 'Creative AI',          description: 'Image, video, music & design AI' },
  { value: 'robotics',          label: 'Robotics & Embodied',  description: 'Physical AI, robots & automation' },
  { value: 'policy_regulation', label: 'Policy & Ethics',      description: 'AI laws, regulation & safety' },
  { value: 'startups_funding',  label: 'Startups & Funding',   description: 'Rounds, acquisitions & launches' },
  { value: 'ai_jobs',           label: 'AI Careers',           description: 'Jobs, skills & the future of work' },
  { value: 'tutorials_howto',   label: 'How-To & Tutorials',   description: 'Practical guides & prompting tips' },
]

export const DEPTH_OPTIONS = [
  { value: 'quick'    as DigestDepth, label: 'Quick Read',   description: '3 bullets per story — 2 min read' },
  { value: 'standard' as DigestDepth, label: 'Standard',     description: 'Short paragraphs — 5 min read' },
  { value: 'deep'     as DigestDepth, label: 'Deep Dive',    description: 'Full context & analysis — 10 min read' },
]

export const TONE_OPTIONS = [
  { value: 'technical'  as TonePreference, label: 'Technical',       description: 'For engineers & researchers' },
  { value: 'business'   as TonePreference, label: 'Business-focused', description: 'ROI, strategy & implications' },
  { value: 'beginner'   as TonePreference, label: 'Beginner-friendly', description: 'Plain English, no jargon' },
  { value: 'fun'        as TonePreference, label: 'Fun & Casual',     description: 'Light, witty & engaging' },
]

export const FREQUENCY_OPTIONS = [
  { value: 'daily'    as DeliveryFrequency, label: 'Every day',         description: 'Mon–Sun at 9am' },
  { value: 'weekdays' as DeliveryFrequency, label: 'Weekdays only',     description: 'Mon–Fri at 9am' },
  { value: 'weekly'   as DeliveryFrequency, label: 'Weekly digest',     description: 'Every Monday at 9am' },
]

export const DEFAULT_PREFERENCES: SubscriberPreferences = {
  topics: ['llm_models', 'ai_tools', 'business_ai'],
  depth: 'standard',
  tone: 'business',
  frequency: 'daily',
  includeTools: true,
  includeJobs: false,
  includeResearch: false,
  includeFunding: true,
  customKeywords: '',
}
