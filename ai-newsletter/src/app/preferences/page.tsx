'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TOPIC_OPTIONS, DEPTH_OPTIONS, TONE_OPTIONS, FREQUENCY_OPTIONS } from '@/types/newsletter'
import type { SubscriberPreferences, TopicCategory } from '@/types/newsletter'

function PreferencesContent() {
  const params = useSearchParams()
  const token = params.get('token')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [firstName, setFirstName] = useState('')
  const [prefs, setPrefs] = useState<SubscriberPreferences | null>(null)

  useEffect(() => {
    if (!token) { setLoading(false); setError('No token provided. Use the link from your email.'); return }
    fetch(`/api/preferences?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setFirstName(data.firstName)
        setPrefs(data.preferences)
      })
      .catch((e) => setError(e.message || 'Failed to load preferences'))
      .finally(() => setLoading(false))
  }, [token])

  function toggleTopic(topic: TopicCategory) {
    if (!prefs) return
    setPrefs({
      ...prefs,
      topics: prefs.topics.includes(topic)
        ? prefs.topics.filter((t) => t !== topic)
        : [...prefs.topics, topic],
    })
    setSaved(false)
  }

  async function save() {
    if (!prefs || !token) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/preferences?token=${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
    } catch {
      setError('Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12" style={{ color: '#b89880' }}>Loading your preferences...</div>
  }

  if (error && !prefs) {
    return (
      <div className="text-center py-12">
        <p className="mb-4" style={{ color: '#d4623a' }}>{error}</p>
        <Link href="/" className="text-sm underline" style={{ color: '#c9956b' }}>Go home</Link>
      </div>
    )
  }

  if (!prefs) return null

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-1" style={{ color: '#3d2b1f' }}>
        Your preferences, {firstName}
      </h1>
      <p className="text-sm mb-8" style={{ color: '#b89880' }}>
        Changes apply from your next issue.
      </p>

      {/* Topics */}
      <section className="mb-8">
        <h2 className="font-serif text-lg font-semibold mb-3" style={{ color: '#3d2b1f' }}>Topics</h2>
        <div className="grid grid-cols-2 gap-2">
          {TOPIC_OPTIONS.map((opt) => {
            const active = prefs.topics.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => toggleTopic(opt.value)}
                className="text-left px-3 py-3 rounded-xl border text-sm transition-all"
                style={{
                  background: active ? '#fdf0ec' : '#faf7f4',
                  borderColor: active ? '#d4623a' : '#e8ddd4',
                  color: active ? '#d4623a' : '#5a3d2f',
                }}
              >
                <div className="font-medium text-xs">{opt.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{opt.description}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Depth */}
      <section className="mb-6">
        <h2 className="font-serif text-lg font-semibold mb-3" style={{ color: '#3d2b1f' }}>Reading depth</h2>
        <div className="space-y-2">
          {DEPTH_OPTIONS.map((opt) => {
            const active = prefs.depth === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => { setPrefs({ ...prefs, depth: opt.value }); setSaved(false) }}
                className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all"
                style={{
                  background: active ? '#fdf0ec' : '#faf7f4',
                  borderColor: active ? '#d4623a' : '#e8ddd4',
                  color: active ? '#d4623a' : '#5a3d2f',
                }}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="ml-2 text-xs opacity-60">{opt.description}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Tone */}
      <section className="mb-6">
        <h2 className="font-serif text-lg font-semibold mb-3" style={{ color: '#3d2b1f' }}>Writing tone</h2>
        <div className="grid grid-cols-2 gap-2">
          {TONE_OPTIONS.map((opt) => {
            const active = prefs.tone === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => { setPrefs({ ...prefs, tone: opt.value }); setSaved(false) }}
                className="text-left px-3 py-3 rounded-xl border text-sm transition-all"
                style={{
                  background: active ? '#fdf0ec' : '#faf7f4',
                  borderColor: active ? '#d4623a' : '#e8ddd4',
                  color: active ? '#d4623a' : '#5a3d2f',
                }}
              >
                <div className="font-medium text-xs">{opt.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{opt.description}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Frequency */}
      <section className="mb-6">
        <h2 className="font-serif text-lg font-semibold mb-3" style={{ color: '#3d2b1f' }}>Frequency</h2>
        <div className="grid grid-cols-3 gap-2">
          {FREQUENCY_OPTIONS.map((opt) => {
            const active = prefs.frequency === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => { setPrefs({ ...prefs, frequency: opt.value }); setSaved(false) }}
                className="text-center px-2 py-3 rounded-xl border text-xs transition-all"
                style={{
                  background: active ? '#fdf0ec' : '#faf7f4',
                  borderColor: active ? '#d4623a' : '#e8ddd4',
                  color: active ? '#d4623a' : '#5a3d2f',
                  fontWeight: active ? '600' : '400',
                }}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="mt-0.5 opacity-70">{opt.description}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Extras */}
      <section className="mb-6">
        <h2 className="font-serif text-lg font-semibold mb-3" style={{ color: '#3d2b1f' }}>Optional sections</h2>
        <div className="space-y-2">
          {[
            { key: 'includeTools', label: 'Tool Spotlight', desc: 'One standout AI tool per issue' },
            { key: 'includeResearch', label: 'Paper of the Day', desc: 'arXiv research made accessible' },
            { key: 'includeFunding', label: 'Funding Rounds', desc: 'Notable startup investment news' },
            { key: 'includeJobs', label: 'AI Career Picks', desc: 'Interesting roles in AI' },
          ].map(({ key, label, desc }) => {
            const active = prefs[key as keyof SubscriberPreferences] as boolean
            return (
              <label
                key={key}
                className="flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all"
                style={{ background: active ? '#fdf0ec' : '#faf7f4', borderColor: active ? '#d4623a' : '#e8ddd4' }}
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: active ? '#d4623a' : '#3d2b1f' }}>{label}</div>
                  <div className="text-xs" style={{ color: '#b89880' }}>{desc}</div>
                </div>
                <div
                  className="w-10 h-6 rounded-full transition-all relative flex-shrink-0 ml-3"
                  style={{ background: active ? '#d4623a' : '#e8ddd4' }}
                  onClick={() => { setPrefs({ ...prefs, [key]: !active }); setSaved(false) }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
                    style={{ left: active ? '20px' : '4px' }}
                  />
                </div>
              </label>
            )
          })}
        </div>
      </section>

      {/* Custom keywords */}
      <section className="mb-8">
        <h2 className="font-serif text-lg font-semibold mb-2" style={{ color: '#3d2b1f' }}>Custom keywords</h2>
        <input
          type="text"
          value={prefs.customKeywords}
          onChange={(e) => { setPrefs({ ...prefs, customKeywords: e.target.value }); setSaved(false) }}
          placeholder="e.g. healthcare AI, legal tech, robotics"
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
          style={{ borderColor: '#e8ddd4', background: '#faf7f4', color: '#3d2b1f' }}
        />
      </section>

      {error && (
        <p className="mb-4 text-sm px-3 py-2 rounded-lg" style={{ background: '#fdf0ec', color: '#d4623a' }}>{error}</p>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-full text-white font-medium transition-all disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #d4623a 0%, #c9956b 100%)' }}
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save preferences'}
      </button>

      <div className="mt-6 text-center">
        <Link
          href={`/api/unsubscribe?token=${token}`}
          className="text-xs underline"
          style={{ color: '#b89880' }}
        >
          Unsubscribe from Signal
        </Link>
      </div>
    </div>
  )
}

export default function PreferencesPage() {
  return (
    <div className="min-h-screen px-4 py-12" style={{ background: '#faf7f4' }}>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#d4623a' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span className="font-serif text-xl font-semibold" style={{ color: '#3d2b1f' }}>Signal</span>
          </Link>
        </div>
        <Suspense fallback={<div style={{ color: '#b89880' }}>Loading...</div>}>
          <PreferencesContent />
        </Suspense>
      </div>
    </div>
  )
}
