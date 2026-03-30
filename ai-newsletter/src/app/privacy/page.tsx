import Link from 'next/link'

export default function PrivacyPage() {
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

        <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: '#3d2b1f' }}>Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: '#b89880' }}>Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="prose prose-stone max-w-none space-y-6 text-sm leading-relaxed" style={{ color: '#5a3d2f' }}>
          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>1. What we collect</h2>
            <p>When you subscribe to Signal, we collect your <strong>first name</strong> and <strong>email address</strong>. You may optionally provide topic preferences and keyword interests. We do not collect any payment information.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>2. How we use it</h2>
            <p>We use your information solely to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Send you the Signal daily newsletter</li>
              <li>Personalise the content to your preferences</li>
              <li>Send transactional emails (e.g. confirmation, unsubscribe confirmation)</li>
            </ul>
            <p className="mt-2">We never sell, share, or rent your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>3. Legal basis (GDPR)</h2>
            <p>We process your data on the basis of <strong>explicit consent</strong> obtained via our double opt-in confirmation process. You may withdraw consent at any time by unsubscribing.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>4. Data storage</h2>
            <p>Your data is stored securely in a Supabase database hosted on infrastructure within the EU. Email delivery is handled by Resend.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>5. Your rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You may unsubscribe and have your data deleted at any time by clicking the unsubscribe link in any email, or by contacting us.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>6. Cookies</h2>
            <p>Signal does not use tracking cookies or analytics. We do not use pixel tracking in emails.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: '#3d2b1f' }}>7. Contact</h2>
            <p>For any privacy questions or data requests, contact: <strong>mariumw784@gmail.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  )
}
