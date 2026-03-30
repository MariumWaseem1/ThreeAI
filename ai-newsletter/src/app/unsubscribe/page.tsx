'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function UnsubscribeContent() {
  const params = useSearchParams()
  const status = params.get('status')
  const error = params.get('error')

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#f2ece5' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4623a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold mb-3" style={{ color: '#3d2b1f' }}>You've been unsubscribed</h1>
        <p className="mb-4" style={{ color: '#7a5c4e' }}>
          You won't receive any more Signal emails. We're sorry to see you go.
        </p>
        <p className="text-sm mb-8" style={{ color: '#b89880' }}>
          Changed your mind? You can always subscribe again.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #d4623a 0%, #c9956b 100%)' }}
        >
          Subscribe again
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#fdf0ec' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4623a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h1 className="font-serif text-3xl font-bold mb-3" style={{ color: '#3d2b1f' }}>
        {error === 'missing' ? 'Missing token' : 'Link not found'}
      </h1>
      <p className="mb-6" style={{ color: '#7a5c4e' }}>
        {error === 'missing'
          ? 'Please use the unsubscribe link from your email.'
          : 'This unsubscribe link doesn\'t seem to be valid. You may have already unsubscribed.'}
      </p>
      <Link href="/" className="text-sm underline" style={{ color: '#c9956b' }}>Back to home</Link>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#faf7f4' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#d4623a' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span className="font-serif text-xl font-semibold" style={{ color: '#3d2b1f' }}>Signal</span>
          </Link>
        </div>
        <Suspense fallback={<div className="text-center" style={{ color: '#b89880' }}>Loading...</div>}>
          <UnsubscribeContent />
        </Suspense>
      </div>
    </div>
  )
}
