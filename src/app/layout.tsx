import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BagsScout — AI Intelligence for Bags Ecosystem',
  description: 'Monitor, analyze, and get AI-powered insights on Bags.fm tokens. Scout creators, track fees, and spot opportunities before anyone else.',
  openGraph: {
    title: 'BagsScout',
    description: 'AI intelligence for the Bags ecosystem',
    siteName: 'BagsScout',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
