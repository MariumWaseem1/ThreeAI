'use client'

import { useState } from 'react'
import type { AuditFormData } from '@/types/audit'
import {
  INDUSTRIES,
  TEAM_SIZES,
  REVENUE_RANGES,
  COMMON_TOOLS,
  AI_USAGE_LEVELS,
  BUDGET_RANGES,
  PRIMARY_GOALS,
  COMMON_CHALLENGES,
  TIMEFRAMES,
} from '@/types/audit'
import StepIndicator from './StepIndicator'
import { FormField, Select, TextInput, Textarea, CheckboxGroup, RadioGroup } from './FormField'

const STEPS = [
  { label: 'Company', icon: '1' },
  { label: 'Tech Stack', icon: '2' },
  { label: 'AI Maturity', icon: '3' },
  { label: 'Goals', icon: '4' },
  { label: 'Contact', icon: '5' },
]

const DEFAULT_FORM: AuditFormData = {
  companyName: '',
  industry: '',
  teamSize: '',
  annualRevenue: '',
  businessDescription: '',
  currentTools: [],
  customTools: '',
  dataInfrastructure: '',
  currentAiUsage: '',
  aiExperience: '',
  budgetRange: '',
  primaryGoals: [],
  specificAiUseCase: '',
  biggestPainPoint: '',
  biggestChallenges: [],
  timeframe: '',
  successMetric: '',
  contactName: '',
  email: '',
  jobTitle: '',
}

interface AuditFormProps {
  onSubmit: (data: AuditFormData) => void
  isLoading: boolean
}

export default function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<AuditFormData>(DEFAULT_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof AuditFormData, string>>>({})

  function update<K extends keyof AuditFormData>(field: K, value: AuditFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validateStep(s: number): boolean {
    const newErrors: typeof errors = {}

    if (s === 0) {
      if (!form.companyName.trim()) newErrors.companyName = 'Required'
      if (!form.industry) newErrors.industry = 'Required'
      if (!form.teamSize) newErrors.teamSize = 'Required'
      if (!form.businessDescription.trim()) newErrors.businessDescription = 'Required'
    }

    if (s === 1) {
      if (form.currentTools.length === 0 && !form.customTools.trim()) {
        newErrors.currentTools = 'Select at least one tool or describe your stack'
      }
    }

    if (s === 2) {
      if (!form.currentAiUsage) newErrors.currentAiUsage = 'Required'
    }

    if (s === 3) {
      if (form.primaryGoals.length === 0) newErrors.primaryGoals = 'Select at least one goal'
      if (!form.specificAiUseCase.trim()) newErrors.specificAiUseCase = 'Required'
      if (!form.biggestPainPoint.trim()) newErrors.biggestPainPoint = 'Required'
      if (form.biggestChallenges.length === 0) newErrors.biggestChallenges = 'Select at least one challenge'
    }

    if (s === 4) {
      if (!form.contactName.trim()) newErrors.contactName = 'Required'
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'Valid email required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => s + 1)
  }

  function prevStep() {
    setStep((s) => s - 1)
  }

  function handleSubmit() {
    if (validateStep(4)) {
      onSubmit(form)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator steps={STEPS} currentStep={step} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Step 0: Company Info */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about your company</h2>
            <p className="text-sm text-gray-500 mb-6">This helps us tailor recommendations to your context.</p>

            <FormField label="Company Name" required error={errors.companyName}>
              <TextInput
                value={form.companyName}
                onChange={(v) => update('companyName', v)}
                placeholder="Acme Corp"
              />
            </FormField>

            <FormField label="Industry" required error={errors.industry}>
              <Select
                value={form.industry}
                onChange={(v) => update('industry', v)}
                options={INDUSTRIES}
                placeholder="Select your industry"
              />
            </FormField>

            <FormField label="Team Size" required error={errors.teamSize}>
              <Select
                value={form.teamSize}
                onChange={(v) => update('teamSize', v)}
                options={TEAM_SIZES}
                placeholder="Select team size"
              />
            </FormField>

            <FormField label="Annual Revenue">
              <Select
                value={form.annualRevenue}
                onChange={(v) => update('annualRevenue', v)}
                options={REVENUE_RANGES}
                placeholder="Select range (optional)"
              />
            </FormField>

            <FormField
              label="What does your business do?"
              required
              hint="Describe what you do, who your customers are, and how you make money."
              error={errors.businessDescription}
            >
              <Textarea
                value={form.businessDescription}
                onChange={(v) => update('businessDescription', v)}
                placeholder="e.g. We run a 3PL logistics company managing warehouse operations for 50+ e-commerce brands. We handle order fulfilment, returns, and inventory tracking. Our main challenge is manual processes slowing down order accuracy."
                rows={4}
              />
            </FormField>
          </div>
        )}

        {/* Step 1: Tech Stack */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Current tools & infrastructure</h2>
            <p className="text-sm text-gray-500 mb-6">Select all tools your team currently uses.</p>

            <FormField label="Tools & Platforms" error={errors.currentTools}>
              <CheckboxGroup
                options={COMMON_TOOLS}
                selected={form.currentTools}
                onChange={(v) => update('currentTools', v)}
              />
            </FormField>

            <FormField label="Other tools not listed above" hint="Describe any additional software, databases, or platforms">
              <TextInput
                value={form.customTools}
                onChange={(v) => update('customTools', v)}
                placeholder="e.g. custom CRM, PostgreSQL, internal analytics..."
              />
            </FormField>

            <FormField label="How would you describe your data infrastructure?" hint="Where does your business data live?">
              <RadioGroup
                options={[
                  'Mostly spreadsheets and local files',
                  'Mix of cloud apps with limited integration',
                  'Centralized cloud storage (CRM, ERP, etc.)',
                  'Dedicated data warehouse or data lake',
                  'Advanced data platform with pipelines',
                ]}
                value={form.dataInfrastructure}
                onChange={(v) => update('dataInfrastructure', v)}
              />
            </FormField>
          </div>
        )}

        {/* Step 2: AI Maturity */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">AI experience & investment</h2>
            <p className="text-sm text-gray-500 mb-6">Help us understand where you are on the AI journey.</p>

            <FormField label="Current AI usage" required error={errors.currentAiUsage}>
              <RadioGroup
                options={AI_USAGE_LEVELS}
                value={form.currentAiUsage}
                onChange={(v) => update('currentAiUsage', v)}
              />
            </FormField>

            <FormField label="Team AI experience level">
              <RadioGroup
                options={[
                  'No one has hands-on AI experience',
                  'A few individuals have explored AI tools',
                  'Several team members use AI tools regularly',
                  'We have dedicated AI/data science resources',
                ]}
                value={form.aiExperience}
                onChange={(v) => update('aiExperience', v)}
              />
            </FormField>

            <FormField label="Annual AI investment budget">
              <Select
                value={form.budgetRange}
                onChange={(v) => update('budgetRange', v)}
                options={BUDGET_RANGES}
                placeholder="Select budget range"
              />
            </FormField>
          </div>
        )}

        {/* Step 3: Goals & Challenges */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Goals & challenges</h2>
            <p className="text-sm text-gray-500 mb-6">Select up to 3 in each category.</p>

            <FormField
              label="What specifically do you want AI to do for your business?"
              required
              hint="Be as specific as possible. The more detail, the better your report."
              error={errors.specificAiUseCase}
            >
              <Textarea
                value={form.specificAiUseCase}
                onChange={(v) => update('specificAiUseCase', v)}
                placeholder="e.g. I want to automate the quoting process. Right now my sales team spends 3 hours manually building quotes in Excel. I also want to use AI to analyse customer churn patterns in our CRM data."
                rows={3}
              />
            </FormField>

            <FormField
              label="What is your biggest operational pain point right now?"
              required
              hint="The problem costing you the most time or money today."
              error={errors.biggestPainPoint}
            >
              <Textarea
                value={form.biggestPainPoint}
                onChange={(v) => update('biggestPainPoint', v)}
                placeholder="e.g. Our support team handles 500+ tickets a week manually. Most are repeat questions. We have no triage system so urgent issues get missed."
                rows={3}
              />
            </FormField>

            <FormField
              label="Primary business goals for AI"
              hint="Select up to 3"
              error={errors.primaryGoals}
            >
              <CheckboxGroup
                options={PRIMARY_GOALS}
                selected={form.primaryGoals}
                onChange={(v) => update('primaryGoals', v)}
                maxSelect={3}
              />
            </FormField>

            <FormField
              label="Biggest challenges to AI adoption"
              hint="Select up to 3"
              error={errors.biggestChallenges}
            >
              <CheckboxGroup
                options={COMMON_CHALLENGES}
                selected={form.biggestChallenges}
                onChange={(v) => update('biggestChallenges', v)}
                maxSelect={3}
              />
            </FormField>

            <FormField label="Implementation timeframe">
              <Select
                value={form.timeframe}
                onChange={(v) => update('timeframe', v)}
                options={TIMEFRAMES}
                placeholder="When do you want results?"
              />
            </FormField>

            <FormField
              label="How would you measure AI success in 12 months?"
              hint="What would need to be true for this to be worth it?"
            >
              <Textarea
                value={form.successMetric}
                onChange={(v) => update('successMetric', v)}
                placeholder="e.g. Cut manual admin time by 50%, reduce customer response time from 24hrs to 2hrs, or generate an extra £200K in revenue without hiring."
                rows={2}
              />
            </FormField>
          </div>
        )}

        {/* Step 4: Lead Capture */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Get your report</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter your details below. Your AI Readiness Report will be generated instantly.
            </p>

            <FormField label="Full Name" required error={errors.contactName}>
              <TextInput
                value={form.contactName}
                onChange={(v) => update('contactName', v)}
                placeholder="Jane Smith"
              />
            </FormField>

            <FormField label="Work Email" required error={errors.email}>
              <TextInput
                value={form.email}
                onChange={(v) => update('email', v)}
                placeholder="jane@company.com"
                type="email"
              />
            </FormField>

            <FormField label="Job Title">
              <TextInput
                value={form.jobTitle}
                onChange={(v) => update('jobTitle', v)}
                placeholder="e.g. CEO, VP of Operations, CTO"
              />
            </FormField>

            <div className="mt-6 p-4 bg-brand-50 rounded-xl border border-brand-100">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-brand-800">Your data is private</p>
                  <p className="text-xs text-brand-600 mt-0.5">
                    We use your information only to generate your report. No spam, no sharing with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={prevStep}
            className={`
              px-5 py-2.5 text-sm font-medium rounded-lg transition-all
              ${step === 0 ? 'invisible' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
            `}
          >
            Back
          </button>

          <div className="text-xs text-gray-400">
            Step {step + 1} of {STEPS.length}
          </div>

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 active:bg-brand-800 transition-all shadow-sm"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate My Report'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
