'use client'

import { useState } from 'react'
import { TOPIC_OPTIONS, DEPTH_OPTIONS, TONE_OPTIONS, FREQUENCY_OPTIONS, DEFAULT_PREFERENCES } from '@/types/newsletter'
import type { SubscriberPreferences, TopicCategory } from '@/types/newsletter'

type Step = 'landing' | 'form' | 'done'

export default function HomePage() {
  const [step, setStep] = useState<Step>('landing')
  const [formStep, setFormStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [referralCode, setReferralCode] = useState('')

  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [prefs, setPrefs] = useState<SubscriberPreferences>(DEFAULT_PREFERENCES)

  function toggleTopic(topic: TopicCategory) {
    setPrefs((p) => ({
      ...p,
      topics: p.topics.includes(topic)
        ? p.topics.filter((t) => t !== topic)
        : [...p.topics, topic],
    }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, preferences: prefs }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setReferralCode(data.referralCode || '')
      setStep('done')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return <SuccessScreen firstName={firstName} email={email} referralCode={referralCode} />
  }

  if (step === 'form') {
    return (
      <FormScreen
        formStep={formStep}
        setFormStep={setFormStep}
        firstName={firstName}
        setFirstName={setFirstName}
        email={email}
        setEmail={setEmail}
        prefs={prefs}
        setPrefs={setPrefs}
        toggleTopic={toggleTopic}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onBack={() => setStep('landing')}
      />
    )
  }

  return <LandingScreen onStart={() => setStep('form')} />
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen" style={{ background: '#faf7f4' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#d4623a' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span className="font-serif text-xl font-semibold" style={{ color: '#3d2b1f' }}>Signal</span>
        </div>
        <button
          onClick={onStart}
          className="text-sm font-medium px-4 py-2 rounded-full border transition-all hover:opacity-80"
          style={{ borderColor: '#d4623a', color: '#d4623a' }}
        >
          Subscribe free
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center px-6 pt-16 pb-12">
        <div
          className="inline-block text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
          style={{ background: '#f2ece5', color: '#c9956b' }}
        >
          Your daily AI briefing
        </div>

        <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ color: '#3d2b1f' }}>
          Stay ahead of AI
          <span className="italic font-normal" style={{ color: '#d4623a' }}> without the noise</span>
        </h1>

        <p className="text-lg leading-relaxed mb-10" style={{ color: '#7a5c4e', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
          Signal curates the AI stories that matter to you — delivered at 9am in your tone, your depth, your topics. Powered by multiple AI sources.
        </p>

        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-medium text-base shadow-lg hover:shadow-xl transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #d4623a 0%, #c9956b 100%)' }}
        >
          Start reading free
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        <p className="text-xs mt-4" style={{ color: '#b89880' }}>No credit card. Unsubscribe any time.</p>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4623a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              ),
              title: 'Every morning at 9am',
              desc: 'Daily, weekday, or weekly — you choose the cadence that fits your life.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4623a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ),
              title: 'AI-curated for you',
              desc: 'Groq + Claude score and rank 100+ articles to find what matters to your interests.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4623a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              ),
              title: 'Your tone, your depth',
              desc: 'Technical deep-dives or casual briefings. Pick the voice that clicks for you.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4623a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              ),
              title: '12+ premium sources',
              desc: 'TechCrunch, VentureBeat, arXiv, Hacker News, Reddit & more — all in one email.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4623a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/>
                </svg>
              ),
              title: 'Optional sections',
              desc: 'Tool spotlight, research papers, funding rounds — add what you want, hide what you don\'t.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4623a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ),
              title: 'GDPR compliant',
              desc: 'Double opt-in, one-click unsubscribe, no data sharing. Your privacy comes first.',
            },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl p-6 border" style={{ background: '#fff', borderColor: '#e8ddd4' }}>
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-serif font-semibold text-base mb-1.5" style={{ color: '#3d2b1f' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#7a5c4e' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof / quote */}
      <section className="max-w-xl mx-auto px-6 py-10 text-center">
        <div className="rounded-3xl p-8" style={{ background: '#f2ece5' }}>
          <div className="font-serif text-2xl italic mb-2" style={{ color: '#d4623a' }}>"</div>
          <p className="font-serif italic text-lg leading-relaxed mb-4" style={{ color: '#3d2b1f' }}>
            The best AI newsletter I've read — it actually knows what I care about.
          </p>
          <p className="text-xs font-medium tracking-wide uppercase" style={{ color: '#c9956b' }}>
            — Early reader
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center px-6 py-12">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-medium shadow-md hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #d4623a 0%, #c9956b 100%)' }}
        >
          Get Signal in your inbox
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs" style={{ borderColor: '#e8ddd4', color: '#b89880' }}>
        <p>Signal Newsletter &copy; {new Date().getFullYear()} &nbsp;·&nbsp;
          <a href="/privacy" className="underline hover:opacity-70" style={{ color: '#b89880' }}>Privacy Policy</a>
          &nbsp;·&nbsp;
          <a href="/terms" className="underline hover:opacity-70" style={{ color: '#b89880' }}>Terms</a>
        </p>
      </footer>
    </div>
  )
}

// ─── Subscription Form (multi-step) ──────────────────────────────────────────

interface FormProps {
  formStep: number
  setFormStep: (n: number) => void
  firstName: string
  setFirstName: (s: string) => void
  email: string
  setEmail: (s: string) => void
  prefs: SubscriberPreferences
  setPrefs: (p: SubscriberPreferences) => void
  toggleTopic: (t: TopicCategory) => void
  loading: boolean
  error: string
  onSubmit: () => void
  onBack: () => void
}

function FormScreen({ formStep, setFormStep, firstName, setFirstName, email, setEmail, prefs, setPrefs, toggleTopic, loading, error, onSubmit, onBack }: FormProps) {
  const steps = ['You', 'Topics', 'Style', 'Extras']

  function next() { setFormStep(Math.min(formStep + 1, 3)) }
  function prev() {
    if (formStep === 0) onBack()
    else setFormStep(formStep - 1)
  }

  const canNext = () => {
    if (formStep === 0) return firstName.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (formStep === 1) return prefs.topics.length > 0
    return true
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#faf7f4' }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#d4623a' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span className="font-serif text-xl font-semibold" style={{ color: '#3d2b1f' }}>Signal</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div
                className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{ background: i <= formStep ? '#d4623a' : '#e8ddd4' }}
              />
              {i < steps.length - 1 && null}
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-8 shadow-sm border" style={{ background: '#fff', borderColor: '#e8ddd4' }}>
          <div className="mb-6">
            <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: '#c9956b' }}>
              Step {formStep + 1} of {steps.length}
            </p>
            <h2 className="font-serif text-2xl font-bold" style={{ color: '#3d2b1f' }}>
              {formStep === 0 && 'Nice to meet you'}
              {formStep === 1 && 'What are you into?'}
              {formStep === 2 && 'How do you like it?'}
              {formStep === 3 && 'Final touches'}
            </h2>
          </div>

          {formStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#5a3d2f' }}>First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alexandra"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                  style={{
                    borderColor: '#e8ddd4',
                    background: '#faf7f4',
                    color: '#3d2b1f',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#5a3d2f' }}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    borderColor: '#e8ddd4',
                    background: '#faf7f4',
                    color: '#3d2b1f',
                  }}
                />
              </div>
              <p className="text-xs" style={{ color: '#b89880' }}>
                We'll send a confirmation email. No spam, ever.
              </p>
            </div>
          )}

          {formStep === 1 && (
            <div>
              <p className="text-sm mb-4" style={{ color: '#7a5c4e' }}>Pick all that interest you:</p>
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
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5a3d2f' }}>Reading depth</label>
                <div className="space-y-2">
                  {DEPTH_OPTIONS.map((opt) => {
                    const active = prefs.depth === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setPrefs({ ...prefs, depth: opt.value })}
                        className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all"
                        style={{
                          background: active ? '#fdf0ec' : '#faf7f4',
                          borderColor: active ? '#d4623a' : '#e8ddd4',
                          color: active ? '#d4623a' : '#5a3d2f',
                        }}
                      >
                        <span className="font-medium">{opt.label}</span>
                        <span className="ml-2 opacity-60 text-xs">{opt.description}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5a3d2f' }}>Writing tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONE_OPTIONS.map((opt) => {
                    const active = prefs.tone === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setPrefs({ ...prefs, tone: opt.value })}
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
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5a3d2f' }}>Delivery frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {FREQUENCY_OPTIONS.map((opt) => {
                    const active = prefs.frequency === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setPrefs({ ...prefs, frequency: opt.value })}
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
              </div>
            </div>
          )}

          {formStep === 3 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium mb-3" style={{ color: '#5a3d2f' }}>Optional sections</p>
                <div className="space-y-2">
                  {[
                    { key: 'includeTools', label: 'Tool Spotlight', desc: 'One standout AI tool per issue' },
                    { key: 'includeResearch', label: 'Paper of the Day', desc: 'arXiv research made accessible' },
                    { key: 'includeFunding', label: 'Funding Rounds', desc: 'Notable startup investment news' },
                    { key: 'includeJobs', label: 'AI Career Picks', desc: 'Interesting roles in AI' },
                  ].map(({ key, label, desc }) => {
                    const active = prefs[key as keyof SubscriberPreferences] as boolean
                    return (
                      <label key={key} className="flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all"
                        style={{ background: active ? '#fdf0ec' : '#faf7f4', borderColor: active ? '#d4623a' : '#e8ddd4' }}>
                        <div>
                          <div className="text-sm font-medium" style={{ color: active ? '#d4623a' : '#3d2b1f' }}>{label}</div>
                          <div className="text-xs" style={{ color: '#b89880' }}>{desc}</div>
                        </div>
                        <div
                          className="w-10 h-6 rounded-full transition-all relative flex-shrink-0 ml-3"
                          style={{ background: active ? '#d4623a' : '#e8ddd4' }}
                          onClick={() => setPrefs({ ...prefs, [key]: !active })}
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
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#5a3d2f' }}>
                  Custom keywords <span style={{ color: '#b89880' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={prefs.customKeywords}
                  onChange={(e) => setPrefs({ ...prefs, customKeywords: e.target.value })}
                  placeholder="e.g. healthcare AI, legal tech, robotics"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e8ddd4', background: '#faf7f4', color: '#3d2b1f' }}
                />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#b89880' }}>
                By subscribing you agree to our{' '}
                <a href="/privacy" className="underline" style={{ color: '#c9956b' }}>Privacy Policy</a> and{' '}
                <a href="/terms" className="underline" style={{ color: '#c9956b' }}>Terms</a>. Unsubscribe any time.
              </p>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm px-3 py-2 rounded-lg" style={{ background: '#fdf0ec', color: '#d4623a' }}>
              {error}
            </p>
          )}

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prev}
              className="text-sm font-medium px-5 py-2.5 rounded-full border transition-all hover:opacity-70"
              style={{ borderColor: '#e8ddd4', color: '#7a5c4e' }}
            >
              {formStep === 0 ? 'Back' : 'Previous'}
            </button>

            {formStep < 3 ? (
              <button
                onClick={next}
                disabled={!canNext()}
                className="text-sm font-medium px-6 py-2.5 rounded-full text-white transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #d4623a 0%, #c9956b 100%)' }}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={onSubmit}
                disabled={loading}
                className="text-sm font-medium px-6 py-2.5 rounded-full text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #d4623a 0%, #c9956b 100%)' }}
              >
                {loading ? 'Subscribing...' : 'Start reading Signal'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ firstName, email, referralCode }: { firstName: string; email: string; referralCode: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: '#faf7f4' }}>
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #d4623a 0%, #c9956b 100%)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
      <h1 className="font-serif text-4xl font-bold mb-3" style={{ color: '#3d2b1f' }}>
        You're almost in, {firstName}
      </h1>
      <p className="text-base mb-2" style={{ color: '#7a5c4e', maxWidth: '440px' }}>
        We've sent a confirmation email to <strong>{email}</strong>.
        Click the link inside to activate your subscription.
      </p>
      <p className="text-sm mb-8" style={{ color: '#b89880' }}>
        Check your spam folder if it doesn't arrive within a minute.
      </p>

      {referralCode && (
        <div className="rounded-2xl p-6 border max-w-sm w-full" style={{ background: '#fff', borderColor: '#e8ddd4' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#5a3d2f' }}>Your referral code</p>
          <div className="font-mono text-2xl font-bold tracking-widest mb-2" style={{ color: '#d4623a' }}>
            {referralCode}
          </div>
          <p className="text-xs" style={{ color: '#b89880' }}>Share Signal with friends. Coming soon: perks for referrals.</p>
        </div>
      )}
    </div>
  )
}
