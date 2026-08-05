'use client'

import { useRef } from 'react'
import type { AuditReport, Recommendation } from '@/types/audit'

interface ReportViewProps {
  report: AuditReport
  onReset: () => void
}

function getScoreColor(score: number) {
  if (score >= 80) return { stroke: '#22c55e', bg: 'bg-green-50', text: 'text-green-600', label: 'text-green-700' }
  if (score >= 60) return { stroke: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-600', label: 'text-blue-700' }
  if (score >= 40) return { stroke: '#eab308', bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'text-yellow-700' }
  return { stroke: '#f97316', bg: 'bg-orange-50', text: 'text-orange-600', label: 'text-orange-700' }
}

function getBarColor(pct: number) {
  if (pct >= 80) return 'bg-green-500'
  if (pct >= 60) return 'bg-blue-500'
  if (pct >= 40) return 'bg-yellow-500'
  return 'bg-orange-500'
}

function getPriorityDot(priority: Recommendation['priority']) {
  switch (priority) {
    case 'high':   return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    case 'low':    return 'bg-gray-400'
  }
}

function getPriorityPill(priority: Recommendation['priority']) {
  switch (priority) {
    case 'high':   return 'bg-red-50 text-red-700 border-red-100'
    case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-100'
    case 'low':    return 'bg-gray-50 text-gray-600 border-gray-100'
  }
}

/* ---------- Circular Score Ring ---------- */
function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const colors = getScoreColor(score)
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-black ${colors.text}`}>{score}</span>
        <span className="text-xs text-gray-400 font-medium">/ 100</span>
      </div>
    </div>
  )
}

export default function ReportView({ report, onReset }: ReportViewProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const scoreColors = getScoreColor(report.overallScore)

  async function handleDownload() {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = margin

    doc.setFillColor(79, 70, 229)
    doc.rect(0, 0, pageWidth, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('AI Readiness Audit Report', margin, 18)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${report.companyName} · Generated ${new Date(report.generatedAt).toLocaleDateString()}`, margin, 27)

    y = 50
    doc.setTextColor(30, 30, 30)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Overall Score: ${report.overallScore}/100 | ${report.readinessLevel}`, margin, y)
    y += 12

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Executive Summary', margin, y)
    y += 7
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const summaryLines = doc.splitTextToSize(report.executiveSummary, pageWidth - margin * 2)
    doc.text(summaryLines, margin, y)
    y += summaryLines.length * 5 + 10

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Category Scores', margin, y)
    y += 5

    autoTable(doc, {
      startY: y,
      head: [['Category', 'Score', 'Summary']],
      body: report.categoryScores.map((c) => [c.name, `${c.score}/${c.maxScore}`, c.summary]),
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 12

    if (y > 240) { doc.addPage(); y = margin }
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Recommendations', margin, y)
    y += 5

    autoTable(doc, {
      startY: y,
      head: [['Priority', 'Title', 'Impact', 'Effort']],
      body: report.recommendations.map((r) => [r.priority.toUpperCase(), r.title, r.estimatedImpact, r.estimatedEffort]),
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 12

    if (y > 240) { doc.addPage(); y = margin }
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Quick Wins', margin, y)
    y += 7
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    report.quickWins.forEach((win, i) => {
      doc.text(`${i + 1}. ${win}`, margin, y)
      y += 6
    })
    y += 6

    if (y > 200) { doc.addPage(); y = margin }
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('90-Day Roadmap', margin, y)
    y += 5

    autoTable(doc, {
      startY: y,
      head: [['Phase', 'Timeframe', 'Key Initiatives']],
      body: report.roadmap.map((p) => [p.phase, p.timeframe, p.initiatives.join('\n')]),
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    })

    doc.save(`AI-Readiness-Audit-${report.companyName.replace(/\s+/g, '-')}.pdf`)
  }

  return (
    <div className="max-w-5xl mx-auto" ref={reportRef}>

      {/* ========== HERO BANNER ========== */}
      <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 rounded-2xl p-8 sm:p-10 text-white mb-8">
        <p className="text-brand-200 text-xs font-semibold uppercase tracking-widest mb-4">AI Readiness Audit</p>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Score ring */}
          <div className="flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
              <ScoreRing score={report.overallScore} size={150} />
            </div>
          </div>
          {/* Company info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">{report.companyName}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${scoreColors.bg} ${scoreColors.label}`}>
                {report.readinessLevel}
              </span>
              <span className="text-brand-200 text-sm">
                {new Date(report.generatedAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </span>
            </div>
            <p className="text-brand-100 text-sm leading-relaxed max-w-xl">
              {report.executiveSummary.length > 200
                ? report.executiveSummary.slice(0, 200).trim() + '...'
                : report.executiveSummary}
            </p>
          </div>
        </div>
      </div>

      {/* ========== ACTIONS ========== */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          New Audit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ========== LEFT COLUMN ========== */}
        <div className="lg:col-span-2 space-y-8">

          {/* ---------- Category Scores: Horizontal Bar Chart ---------- */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-6">Readiness by Category</h2>
            <div className="space-y-5">
              {report.categoryScores.map((cat) => {
                const pct = Math.round((cat.score / cat.maxScore) * 100)
                const barColor = getBarColor(pct)
                return (
                  <div key={cat.name}>
                    <div className="flex items-center gap-4 mb-1.5">
                      <span className="text-sm font-semibold text-gray-800 w-40 flex-shrink-0 truncate">{cat.name}</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-14 text-right flex-shrink-0">
                        {cat.score}/{cat.maxScore}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 pl-44 leading-snug">{cat.summary}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ---------- Recommendations ---------- */}
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-1">Priority Actions</h2>
            <p className="text-sm text-gray-500 mb-5">
              What to focus on next. The detailed implementation plan is covered in your strategy call.
            </p>
            <div className="space-y-3">
              {report.recommendations.map((rec, i) => {
                const dot = getPriorityDot(rec.priority)
                const pill = getPriorityPill(rec.priority)
                return (
                  <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-start gap-4">
                    <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${dot}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">{rec.title}</h4>
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{rec.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${pill}`}>
                          {rec.priority}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                          Impact: {rec.estimatedImpact}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100 font-medium">
                          Effort: {rec.estimatedEffort}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mid-report CTA */}
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 mt-6">
              <p className="text-sm font-bold text-brand-900 mb-1">Want the step-by-step implementation plan?</p>
              <p className="text-xs text-brand-700 mb-4">A 30-minute call turns these findings into a concrete action plan built around your specific team, tools, and goals.</p>
              <a
                href={`mailto:mariumw784@gmail.com?subject=AI%20Strategy%20Call%20-%20${encodeURIComponent(report.companyName)}&body=Hi%20Marium%2C%20I%20just%20completed%20the%20AI%20Readiness%20Audit%20and%20scored%20${report.overallScore}%2F100.%20I%27d%20love%20to%20discuss%20next%20steps.`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-all"
              >
                Book a Free Strategy Call
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </section>

          {/* ---------- Roadmap Timeline ---------- */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-1">Your AI Roadmap</h2>
            <p className="text-sm text-gray-500 mb-6">
              High-level phases for {report.companyName}. Full milestones and sequencing are mapped in your strategy call.
            </p>
            <div className="space-y-0">
              {report.roadmap.map((phase, i) => (
                <div key={i} className="flex gap-5">
                  {/* Timeline rail */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 ring-4 ring-brand-50">
                      {i + 1}
                    </div>
                    {i < report.roadmap.length - 1 && (
                      <div className="w-0.5 flex-1 bg-brand-100 my-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-8 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-bold text-gray-900">{phase.phase}</h3>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full font-medium">{phase.timeframe}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.initiatives.map((init, j) => (
                        <span
                          key={j}
                          className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg border border-brand-100 font-medium"
                        >
                          {init}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ========== RIGHT SIDEBAR ========== */}
        <div className="space-y-6">

          {/* ---------- Strengths ---------- */}
          <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
            <h3 className="text-sm font-black text-green-800 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Top Strengths
            </h3>
            <div className="space-y-2.5">
              {report.topStrengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-green-800 flex-shrink-0 text-xs font-bold mt-px">
                    {i + 1}
                  </span>
                  <span className="text-xs text-green-800 font-medium leading-snug">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Critical Gaps ---------- */}
          <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
            <h3 className="text-sm font-black text-red-800 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Critical Gaps
            </h3>
            <div className="space-y-2.5">
              {report.criticalGaps.map((g, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-red-800 flex-shrink-0 text-xs font-bold mt-px">
                    {i + 1}
                  </span>
                  <span className="text-xs text-red-800 font-medium leading-snug">{g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Quick Wins ---------- */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <h3 className="text-sm font-black text-blue-800 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Wins
            </h3>
            <div className="space-y-2.5">
              {report.quickWins.map((win, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 flex-shrink-0 text-xs font-bold mt-px">
                    {i + 1}
                  </span>
                  <span className="text-xs text-blue-800 font-medium leading-snug">{win}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Sidebar CTA ---------- */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
            <p className="text-xs text-brand-300 font-bold uppercase tracking-widest mb-2">Your Score: {report.overallScore}/100</p>
            <h3 className="text-base font-black mb-2">Turn this report into a plan</h3>
            <p className="text-xs text-brand-200 leading-relaxed mb-5">{report.nextSteps}</p>
            <a
              href={`mailto:mariumw784@gmail.com?subject=AI%20Strategy%20Call%20-%20${encodeURIComponent(report.companyName)}&body=Hi%20Marium%2C%20I%20completed%20the%20AI%20Readiness%20Audit%20for%20${encodeURIComponent(report.companyName)}%20and%20scored%20${report.overallScore}%2F100.%20I%27d%20love%20to%20discuss%20a%20tailored%20AI%20strategy.`}
              className="block w-full text-center text-sm font-bold bg-white text-brand-700 rounded-xl py-3 hover:bg-brand-50 transition-all"
            >
              Book a Free 30-Min Strategy Call
            </a>
            <p className="text-xs text-brand-300 text-center mt-2.5">mariumw784@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
