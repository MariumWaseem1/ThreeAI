import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-12" style={{ background: '#faf7f4' }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#d4623a' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span className="font-serif text-xl font-semibold" style={{ color: '#3d2b1f' }}>Signal</span>
        </Link>

        <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: '#3d2b1f' }}>Terms of Service</h1>
        <p className="text-sm mb-8" style={{ color: '#b89880' }}>Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#5a3d2f' }}>
          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>1. Service</h2>
            <p>Signal is a free AI-curated newsletter service. By subscribing you agree to these terms.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>2. Subscription</h2>
            <p>Subscription is free. You must confirm your email address (double opt-in) before receiving newsletters. You may unsubscribe at any time.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>3. Content</h2>
            <p>Newsletter content is AI-generated and curated from publicly available sources. Signal is provided for informational purposes only and does not constitute professional, financial, or legal advice.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>4. CAN-SPAM & GDPR</h2>
            <p>All emails include a clear sender identity, physical or operational address, and a one-click unsubscribe option. We comply with CAN-SPAM and GDPR requirements.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>5. Disclaimer</h2>
            <p>Signal is provided "as is" without warranties of any kind. We are not responsible for errors, omissions, or inaccuracies in the content.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>6. Contact</h2>
            <p>Questions? Contact <strong>mariumw784@gmail.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  )
}
