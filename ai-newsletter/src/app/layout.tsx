import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Signal — Your Daily AI Briefing',
  description: 'A beautifully curated AI newsletter, personalised to what you care about. Delivered every morning.',
  openGraph: {
    title: 'Signal — Your Daily AI Briefing',
    description: 'A beautifully curated AI newsletter, personalised to what you care about.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-beige-100 text-stone-800 antialiased">
        {children}
      </body>
    </html>
  )
}
