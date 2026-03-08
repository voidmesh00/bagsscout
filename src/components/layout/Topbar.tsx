'use client'

import Link from 'next/link'

export default function Topbar() {
  return (
    <header
      className="flex items-center justify-between px-6 border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
    >
      {/* Logo */}
      <Link href="/analyzer" className="flex items-center gap-2.5 no-underline">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center font-mono text-xs font-medium"
          style={{ background: 'var(--accent)', color: '#0a0a0b' }}
        >
          BS
        </div>
        <span className="font-mono text-sm" style={{ color: 'var(--text)' }}>
          Bags<span style={{ color: 'var(--accent)' }}>Scout</span>
        </span>
      </Link>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div
          className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent)', animation: 'pulse-dot 2s infinite' }}
          />
          Live
        </div>

        {/* Connect wallet placeholder */}
        <a
          href="https://dev.bags.fm"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs px-3 py-1.5 rounded-md transition-all"
          style={{
            background: 'var(--accent)',
            color: '#0a0a0b',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Get API Key →
        </a>
      </div>
    </header>
  )
}
