export interface AuditFormData {
  // Step 1: Company info
  companyName: string
  industry: string
  teamSize: string
  annualRevenue: string
  businessDescription: string   // What does your business do?

  // Step 2: Current tech
  currentTools: string[]
  customTools: string
  dataInfrastructure: string

  // Step 3: AI maturity
  currentAiUsage: string
  aiExperience: string
  budgetRange: string

  // Step 4: Goals & challenges
  primaryGoals: string[]
  specificAiUseCase: string     // What specifically do you want AI to do?
  biggestPainPoint: string      // Biggest operational bottleneck right now
  biggestChallenges: string[]
  timeframe: string
  successMetric: string         // How would you measure success in 12 months?

  // Lead capture
  contactName: string
  email: string
  jobTitle: string
}

export interface CategoryScore {
  name: string
  score: number
  maxScore: number
  summary: string
  details: string[]
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  estimatedImpact: string
  estimatedEffort: string
}

export interface RoadmapItem {
  phase: string
  timeframe: string
  initiatives: string[]
  expectedOutcomes: string[]
}

export interface AuditReport {
  companyName: string
  generatedAt: string
  overallScore: number
  readinessLevel: 'Emerging' | 'Developing' | 'Advancing' | 'Leading'
  executiveSummary: string
  categoryScores: CategoryScore[]
  topStrengths: string[]
  criticalGaps: string[]
  recommendations: Recommendation[]
  roadmap: RoadmapItem[]
  quickWins: string[]
  nextSteps: string
}

export const INDUSTRIES = [
  'Financial Services & Banking',
  'Healthcare & Life Sciences',
  'Retail & E-commerce',
  'Manufacturing & Supply Chain',
  'Technology & Software',
  'Professional Services',
  'Real Estate',
  'Education',
  'Media & Entertainment',
  'Logistics & Transportation',
  'Energy & Utilities',
  'Government & Public Sector',
  'Non-profit',
  'Other',
]

export const TEAM_SIZES = [
  '1-10 (Startup)',
  '11-50 (Small)',
  '51-200 (Mid-size)',
  '201-500 (Growth)',
  '501-1000 (Scale-up)',
  '1000+ (Enterprise)',
]

export const REVENUE_RANGES = [
  'Pre-revenue',
  'Under $1M',
  '$1M - $5M',
  '$5M - $20M',
  '$20M - $100M',
  '$100M - $500M',
  '$500M+',
]

export const COMMON_TOOLS = [
  'Microsoft 365 / Office',
  'Google Workspace',
  'Salesforce CRM',
  'HubSpot',
  'Slack / Teams',
  'Jira / Confluence',
  'Tableau / Power BI',
  'AWS / Azure / GCP',
  'SAP / Oracle ERP',
  'Zapier / Make (automation)',
  'ChatGPT / Copilot',
  'Custom databases / Data warehouse',
]

export const AI_USAGE_LEVELS = [
  'No AI usage: exploring possibilities',
  'Minimal: one or two tools like ChatGPT for occasional tasks',
  'Moderate: AI tools used regularly in a few departments',
  'Significant: AI integrated into key workflows',
  'Advanced: AI is core to our product or operations',
]

export const BUDGET_RANGES = [
  'Not yet allocated',
  'Under $10K/year',
  '$10K - $50K/year',
  '$50K - $200K/year',
  '$200K - $1M/year',
  '$1M+/year',
]

export const PRIMARY_GOALS = [
  'Reduce operational costs',
  'Increase revenue / sales',
  'Improve customer experience',
  'Automate repetitive tasks',
  'Better data-driven decisions',
  'Speed up product development',
  'Competitive differentiation',
  'Improve employee productivity',
  'Risk management & compliance',
]

export const COMMON_CHALLENGES = [
  'Lack of clean / structured data',
  'Unclear ROI on AI investments',
  'Skill gaps in the team',
  'Budget constraints',
  'Data privacy & security concerns',
  'Resistance to change internally',
  'Vendor selection complexity',
  'Integration with existing systems',
  'Regulatory / compliance barriers',
]

export const TIMEFRAMES = [
  '0-3 months (immediate)',
  '3-6 months',
  '6-12 months',
  '1-2 years',
  '2+ years (long-term transformation)',
]
