'use client'

import { useRef } from 'react'
import type { AuditReport, CategoryScore, Recommendation } from '@/types/audit'

interface ReportViewProps {
  report: AuditReport
  onReset: () => void
}

function getReadinessColor(level: AuditReport['readinessLevel']) {
  switch (level) {
    case 'Emerging':   return { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-200', score: 'text-orange-600' }
    case 'Developing': return { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-200', score: 'text-yellow-600' }
    case 'Advancing':  return { bg: 'bg-blue-100',   text: 'text-blue-700',   ring: 'ring-blue-200',   score: 'text-blue-600' }
    case 'Leading':    return { bg: 'bg-green-100',  text: 'text-green-700',  ring: 'ring-green-200',  score: 'text-green-600' }
  }
}

function getPriorityStyle(priority: Recommendation['priority']) {
  switch (priority) {
    case 'high':   return { badge: 'bg-red-100 text-red-700',    dot: 'bg-red-500' }
    case 'medium': return { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' }
    case 'low':    return { badge: 'bg-gray-100 text-gray-600',  dot: 'bg-gray-400' }
  }
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-orange-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-12 text-right">
        {score}/{max}
      </span>
    </div>
  )
}

function CategoryCard({ cat }: { cat: CategoryScore }) {
  const pct = Math.round((cat.score / cat.maxScore) * 100)
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-800 text-sm">{cat.name}</h4>
        <span className="text-xs text-gray-500">{pct}%</span>
      </div>
      <ScoreBar score={cat.score} max={cat.maxScore} />
      <p className="text-xs text-gray-500 mt-2 mb-3">{cat.summary}</p>
      <ul className="space-y-1">
        {cat.details.map((d, i) => (
          <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
            <span className="text-gray-300 mt-0.5">•</span>
            {d}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ReportView({ report, onReset }: ReportViewProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const colors = getReadinessColor(report.readinessLevel)

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
    doc.text(`Overall Score: ${report.overallScore}/100 — ${report.readinessLevel}`, margin, y)
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

  const highPriority = report.recommendations.filter((r) => r.priority === 'high')
  const mediumPriority = report.recommendations.filter((r) => r.priority === 'medium')
  const lowPriority = report.recommendations.filter((r) => r.priority === 'low')

  return (
    <div className="max-w-4xl mx-auto" ref={reportRef}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-500 rounded-2xl p-8 text-white mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-brand-200 text-sm font-medium mb-1">AI READINESS AUDIT</p>
            <h1 className="text-2xl font-bold">{report.companyName}</h1>
            <p className="text-brand-200 text-sm mt-1">
              Generated {new Date(report.generatedAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            </p>
          </div>
          <div className={`${colors.bg} ${colors.ring} ring-2 rounded-2xl px-6 py-4 text-center flex-shrink-0`}>
            <div className={`text-4xl font-black ${colors.score}`}>{report.overallScore}</div>
            <div className="text-xs text-gray-500 font-medium">out of 100</div>
            <div className={`text-sm font-bold mt-1 ${colors.text}`}>{report.readinessLevel}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          New Audit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              Executive Summary
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {report.executiveSummary}
            </div>
          </section>

          {/* Category Scores */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              Readiness by Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {report.categoryScores.map((cat) => (
                <CategoryCard key={cat.name} cat={cat} />
              ))}
            </div>
          </section>

          {/* Recommendations */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </span>
              Priority Actions
            </h2>
            <p className="text-xs text-gray-500 mb-4">What needs to change — the detailed implementation plan is covered in your strategy call.</p>
            {[
              { label: 'High Priority', items: highPriority },
              { label: 'Medium Priority', items: mediumPriority },
              { label: 'Lower Priority', items: lowPriority },
            ].filter((g) => g.items.length > 0).map((group) => (
              <div key={group.label} className="mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{group.label}</h3>
                <div className="space-y-3">
                  {group.items.map((rec, i) => {
                    const style = getPriorityStyle(rec.priority)
                    return (
                      <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">{rec.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${style.badge}`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{rec.description}</p>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span><span className="font-medium text-gray-700">Impact:</span> {rec.estimatedImpact}</span>
                            <span><span className="font-medium text-gray-700">Effort:</span> {rec.estimatedEffort}</span>
                          </div>
                          {rec.priority === 'high' && (
                            <a
                              href={`mailto:mariumw784@gmail.com?subject=AI%20Strategy%20Call%20-%20${encodeURIComponent(report.companyName)}`}
                              className="text-xs text-brand-600 font-semibold hover:underline whitespace-nowrap"
                            >
                              Get the plan →
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Mid-report CTA */}
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 mt-2">
              <p className="text-sm font-semibold text-brand-900 mb-1">Want the step-by-step implementation plan?</p>
              <p className="text-xs text-brand-700 mb-3">A 30-minute call turns these findings into a concrete action plan built around your specific team, tools, and goals.</p>
              <a
                href={`mailto:mariumw784@gmail.com?subject=AI%20Strategy%20Call%20-%20${encodeURIComponent(report.companyName)}&body=Hi%20Marium%2C%20I%20just%20completed%20the%20AI%20Readiness%20Audit%20and%20scored%20${report.overallScore}%2F100.%20I%27d%20love%20to%20discuss%20next%20steps.`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-all"
              >
                Book a Free Strategy Call
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </section>

          {/* Roadmap */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </span>
              Your AI Roadmap Overview
            </h2>
            <p className="text-xs text-gray-500 mb-4">High-level phases for {report.companyName}. Full milestones, owners, and sequencing are mapped out in your strategy call.</p>
            <div className="space-y-5">
              {report.roadmap.map((phase, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < report.roadmap.length - 1 && (
                      <div className="w-0.5 h-full bg-brand-100 mt-2" />
                    )}
                  </div>
                  <div className="pb-5 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-gray-900">{phase.phase}</h3>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{phase.timeframe}</span>
                    </div>
                    <ul className="space-y-1 mb-2">
                      {phase.initiatives.map((init, j) => (
                        <li key={j} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-brand-400 mt-0.5">-</span> {init}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {phase.expectedOutcomes.map((outcome, j) => (
                        <span key={j} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                          {outcome}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Strengths */}
          <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
            <h3 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Top Strengths
            </h3>
            <ul className="space-y-2">
              {report.topStrengths.map((s, i) => (
                <li key={i} className="text-xs text-green-700 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-green-200 flex items-center justify-center text-green-700 flex-shrink-0 mt-0.5 font-bold" style={{fontSize: '9px'}}>
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Critical Gaps */}
          <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
            <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Critical Gaps
            </h3>
            <ul className="space-y-2">
              {report.criticalGaps.map((g, i) => (
                <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">!</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Wins */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Wins
            </h3>
            <ul className="space-y-2">
              {report.quickWins.map((win, i) => (
                <li key={i} className="text-xs text-blue-700 flex items-start gap-2">
                  <span className="text-blue-400 flex-shrink-0 mt-0.5">-</span>
                  {win}
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps CTA */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white">
            <p className="text-xs text-brand-300 font-semibold uppercase tracking-wider mb-2">Your Score: {report.overallScore}/100</p>
            <h3 className="text-sm font-bold mb-2">Turn this report into a plan</h3>
            <p className="text-xs text-brand-200 leading-relaxed mb-4">{report.nextSteps}</p>
            <a
              href={`mailto:mariumw784@gmail.com?subject=AI%20Strategy%20Call%20-%20${encodeURIComponent(report.companyName)}&body=Hi%20Marium%2C%20I%20completed%20the%20AI%20Readiness%20Audit%20for%20${encodeURIComponent(report.companyName)}%20and%20scored%20${report.overallScore}%2F100.%20I%27d%20love%20to%20discuss%20a%20tailored%20AI%20strategy.`}
              className="block w-full text-center text-xs font-semibold bg-white text-brand-700 rounded-lg py-2.5 hover:bg-brand-50 transition-all"
            >
              Book a Free 30-Min Strategy Call
            </a>
            <p className="text-xs text-brand-300 text-center mt-2">mariumw784@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
