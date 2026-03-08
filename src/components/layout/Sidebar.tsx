'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Zap, TrendingUp, Bell, BookOpen, Settings } from 'lucide-react'

const navItems = [
  { href: '/analyzer', icon: Search, label: 'Token Analyzer', badge: null },
  { href: '/feed', icon: Zap, label: 'Live Feed', badge: 'NEW' },
  { href: '/tokens', icon: TrendingUp, label: 'Top Tokens', badge: null },
  { href: '/alerts', icon: Bell, label: 'Alerts', badge: 'AI' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col border-r h-full" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 pt-5">
        <p className="font-mono text-[10px] uppercase tracking-widest px-2 mb-3" style={{ color: 'var(--muted)' }}>
          Tools
        </p>
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group"
              style={{
                background: active ? 'var(--surface2)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--muted)',
              }}
            >
              <Icon
                size={15}
                style={{ color: active ? 'var(--accent)' : 'inherit' }}
              />
              <span className="flex-1">{label}</span>
              {badge && (
                <span
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active ? 'var(--accent)' : 'var(--surface2)',
                    color: active ? '#0a0a0b' : 'var(--muted)',
                    border: active ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* API Status Footer */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
            Data Sources
          </p>
          {[
            { label: 'Bags API', ok: true },
            { label: 'Bitquery', ok: true },
            { label: 'Claude AI', ok: true },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center justify-between py-0.5">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: ok ? 'var(--accent)' : 'var(--danger)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
