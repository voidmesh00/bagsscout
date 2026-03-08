'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, ExternalLink, Search } from 'lucide-react'

export default function TokensPage() {
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rateLimit, setRateLimit] = useState(false)
  const [sortBy, setSortBy] = useState<'totalFees'|'unclaimedFees'|'volume24h'|'holders'>('totalFees')

  useEffect(() => {
    fetch('/api/tokens')
      .then(r => r.json())
      .then(data => { setTokens(data.tokens || []); setRateLimit(data.error === 'rate_limit'); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = tokens
    .filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.symbol?.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0))

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-10 pt-12 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
        <h1 className="font-serif text-3xl mb-2" style={{ color: 'var(--text)' }}>
          Top <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Tokens</em>
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Recently launched Bags tokens sorted by activity.
        </p>

        {/* Search */}
        <div className="relative" style={{ maxWidth: 320 }}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter tokens..."
            className="w-full rounded-lg py-2.5 pl-9 pr-4 font-mono text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 mt-4">
          <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>SORT BY</span>
          {(['totalFees', 'unclaimedFees', 'volume24h', 'holders'] as const).map(key => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className="font-mono text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: sortBy === key ? 'rgba(200,240,74,0.15)' : 'var(--surface2)',
                color: sortBy === key ? 'var(--accent)' : 'var(--muted)',
                border: sortBy === key ? '1px solid rgba(200,240,74,0.3)' : '1px solid var(--border)',
              }}
            >
              {key === 'totalFees' ? 'Lifetime Fees' : key === 'unclaimedFees' ? 'Unclaimed Fees' : key === 'volume24h' ? 'Volume 24h' : 'Holders'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="px-10 py-8">
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', maxWidth: 900 }}>
          {/* Table header */}
          <div
            className="grid font-mono text-xs uppercase tracking-wide px-5 py-3"
            style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', background: 'var(--surface2)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}
          >
            <span>Token</span>
            <span className="text-right">Volume 24h</span>
            <span className="text-right">Holders</span>
            <span className="text-right">Unclaimed Fees</span>
            <span className="text-right">Scout</span>
          </div>

          {/* Rows */}
          {loading && (
            <div className="p-4 space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-lg" />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="px-5 py-12 text-center">
              {rateLimit ? (
                <div>
                  <p className="text-sm font-mono mb-1" style={{ color: 'var(--accent)' }}>⚠ Rate limit reached</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Bags API resets hourly. Please check back in a few minutes.</p>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--muted)' }}>No tokens found.</p>
              )}
            </div>
          )}

          {!loading && filtered.map((token, i) => (
            <div
              key={token.mintAddress || i}
              className="grid items-center px-5 py-4 transition-all animate-fade-up"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                background: 'var(--surface)',
                animationDelay: `${i * 0.03}s`,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
            >
              {/* Token */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: 'var(--surface2)' }}>
                  {token.imageUrl ? (
                    <img src={token.imageUrl} alt={token.symbol} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--accent),var(--accent2));font-size:10px;font-weight:600;color:#0a0a0b">${(token.symbol||'??').slice(0,2)}</div>` }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-xs font-medium" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#0a0a0b' }}>
                      {token.symbol?.slice(0, 2) || '??'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{token.name}</p>
                  <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>${token.symbol}</p>
                </div>
              </div>

              {/* Volume */}
              <p className="font-mono text-sm text-right" style={{ color: 'var(--text)' }}>
                {token.volume24h ? `${Number(token.volume24h).toFixed(1)} SOL` : '—'}
              </p>

              {/* Holders */}
              <p className="font-mono text-sm text-right" style={{ color: 'var(--text)' }}>
                {token.holders || '—'}
              </p>

              {/* Unclaimed */}
              <p className="font-mono text-sm text-right" style={{ color: token.unclaimedFees > 0 ? 'var(--accent3)' : 'var(--muted)' }}>
                {token.unclaimedFees ? `${Number(token.unclaimedFees).toFixed(2)} SOL` : '—'}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <a
                  href={`/analyzer?mint=${token.mintAddress}`}
                  className="flex items-center gap-1 font-mono text-xs px-2 py-1 rounded transition-all no-underline"
                  style={{ background: 'rgba(200,240,74,0.1)', color: 'var(--accent)', border: '1px solid rgba(200,240,74,0.2)' }}
                >
                  <TrendingUp size={10} />
                  Scout
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
