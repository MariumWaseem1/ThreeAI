'use client'

import { useState } from 'react'
import AuditForm from '@/components/AuditForm'
import ReportView from '@/components/ReportView'
import type { AuditFormData, AuditReport } from '@/types/audit'

type State = 'landing' | 'form' | 'loading' | 'report' | 'error'

export default function Home() {
  const [state, setState] = useState<State>('landing')
  const [report, setReport] = useState<AuditReport | null>(null)
  const [error, setError] = useState<string>('')

  async function handleFormSubmit(data: AuditFormData) {
    setState('loading')
    setError('')

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate report')
      }

      const reportData: AuditReport = await res.json()
      setReport(reportData)
      setState('report')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  function reset() {
    setState('landing')
    setReport(null)
    setError('')
  }

  if (state === 'report' && report) {
    return (
      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">ThreeAI</span>
            </div>
          </div>
          <ReportView report={report} onReset={reset} />
        </div>
      </main>
    )
  }

  if (state === 'loading') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-brand-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-10 h-10 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing your business...</h2>
          <p className="text-sm text-gray-500 mb-8">
            Our AI is reviewing your inputs and generating a personalized readiness report. This takes about 30 seconds.
          </p>
          <div className="space-y-3 text-left">
            {[
              'Evaluating data infrastructure',
              'Assessing team AI maturity',
              'Identifying quick wins',
              'Building your 90-day roadmap',
              'Finalizing recommendations',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin flex-shrink-0"
                  style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
                />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (state === 'error') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-2">{error}</p>
          <p className="text-xs text-gray-400 mb-6">Make sure your ANTHROPIC_API_KEY is set in .env.local</p>
          <button
            onClick={() => setState('form')}
            className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  if (state === 'form') {
    return (
      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">ThreeAI</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Readiness Audit</h1>
            <p className="text-sm text-gray-500">Takes about 3 minutes · 100% free · Report delivered instantly</p>
          </div>
          <AuditForm onSubmit={handleFormSubmit} isLoading={false} />
        </div>
      </main>
    )
  }

  // Landing page
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">ThreeAI</span>
          </div>
          <button
            onClick={() => setState('form')}
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Get your free audit →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 text-center bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-brand-100">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Free AI Readiness Assessment
          </div>
          <h1 className="text-5xl font-black text-gray-900 leading-tight mb-6">
            Is your business{' '}
            <span className="text-brand-600">ready for AI?</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            Get a personalized AI readiness score, identify your biggest gaps, and receive a
            concrete 90-day action plan — tailored to your industry and team size.
          </p>
          <button
            onClick={() => setState('form')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 text-white font-bold text-lg rounded-xl hover:bg-brand-700 active:bg-brand-800 transition-all shadow-lg shadow-brand-200"
          >
            Get My Free AI Audit
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-xs text-gray-400 mt-4">Takes 3 minutes · No credit card · Instant results</p>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">What you get in your report</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                title: 'AI Readiness Score',
                desc: 'A 0–100 score across 4 key dimensions: Data, Team, Process, and Strategy.',
              },
              {
                path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
                title: 'Prioritized Recommendations',
                desc: 'Specific, actionable steps ranked by impact and effort — no generic advice.',
              },
              {
                path: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
                title: '90-Day Roadmap',
                desc: 'A phased implementation plan with quick wins and longer-term milestones.',
              },
              {
                path: 'M13 10V3L4 14h7v7l9-11h-7z',
                title: 'Quick Wins',
                desc: 'Low-effort, high-impact actions you can start this week to build momentum.',
              },
              {
                path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
                title: 'Gap Analysis',
                desc: 'Clear visibility into the critical gaps holding your AI adoption back.',
              },
              {
                path: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                title: 'PDF Download',
                desc: 'Share your report with your team or board — professional and ready to present.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.path} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Built for businesses at every stage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '14', label: 'Industries covered' },
              { value: '4', label: 'Readiness dimensions' },
              { value: '90', label: 'Day roadmap included' },
              { value: '5 min', label: 'To complete' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-3xl font-black text-brand-600 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-brand-700 to-brand-500 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-4">Start your AI transformation today</h2>
          <p className="text-brand-200 mb-8 text-lg">
            Join forward-thinking companies using AI to grow faster, reduce costs, and outperform the competition.
          </p>
          <button
            onClick={() => setState('form')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold text-lg rounded-xl hover:bg-brand-50 transition-all shadow-lg"
          >
            Get My Free AI Readiness Report
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-brand-600 rounded flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-700">ThreeAI</span>
        </div>
        <p className="text-xs text-gray-400">Powered by Claude AI · Built to help businesses unlock their AI potential</p>
      </footer>
    </main>
  )
}
