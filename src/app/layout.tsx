import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Readiness Audit | ThreeAI',
  description: 'Discover your company\'s AI readiness in minutes. Get a free, personalized AI strategy report with actionable recommendations tailored to your business.',
  openGraph: {
    title: 'Free AI Readiness Audit',
    description: 'Get a personalized AI readiness score and action plan for your business. Free in under 5 minutes.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
