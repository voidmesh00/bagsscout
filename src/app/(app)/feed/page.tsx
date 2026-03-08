'use client'

import { useState, useEffect } from 'react'
import { Zap, RefreshCw, TrendingUp, AlertCircle, Star, Flame } from 'lucide-react'

const typeConfig = {
  new_token: { icon: Star, label: 'New Token', color: 'var(--accent2)' },
  volume_spike: { icon: Flame, label: 'Volume Spike', color: 'var(--accent3)' },
  fee_claimed: { icon: Zap, label: 'Fee Claimed', color: 'var(--accent)' },
  whale_entry: { icon: TrendingUp, label: 'Whale Entry', color: '#a78bfa' },
  creator_alert: { icon: AlertCircle, label: 'Creator Alert', color: '#f04a4a' },
}

const severityDot = {
  high: '#f04a4a',
  medium: 'var(--accent3)',
  low: 'var(--muted)',
}

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadFeed = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const res = await fetch('/api/feed')
      if (!res.ok) throw new Error('Failed to load feed')
      const data = await res.json()
      setFeed(data.items || [])
      setInsights(data.insights || [])
      setLastUpdated(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadFeed()
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => loadFeed(true), 120_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-10 pt-12 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl mb-2" style={{ color: 'var(--text)' }}>
              Live <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Feed</em>
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)', maxWidth: 480 }}>
              Claude monitors the Bags ecosystem in real-time and surfaces what matters.
              Auto-refreshes every 2 minutes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => loadFeed(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all disabled:opacity-40"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="px-10 py-8">
        <div className="grid grid-cols-3 gap-6" style={{ maxWidth: 900 }}>

          {/* Feed items (2/3 width) */}
          <div className="col-span-2 space-y-2">
            <p className="font-mono text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--muted)' }}>
              Recent Activity
            </p>

            {loading && (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton h-20 rounded-lg" />
                ))}
              </div>
            )}

            {!loading && feed.length === 0 && (
              <div className="rounded-xl p-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>No activity detected yet.</p>
              </div>
            )}

            {!loading && feed.map((item, i) => {
              const tc = typeConfig[item.type as keyof typeof typeConfig] || typeConfig.new_token
              const Icon = tc.icon
              return (
                <div
                  key={item.id || i}
                  className="rounded-xl p-4 flex items-start gap-4 transition-all cursor-pointer animate-fade-up"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    animationDelay: `${i * 0.04}s`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${tc.color}15`, border: `1px solid ${tc.color}30` }}
                  >
                    <Icon size={14} style={{ color: tc.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-medium" style={{ color: tc.color }}>
                        {tc.label}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: severityDot[item.severity as keyof typeof severityDot] }}
                      />
                      <span className="font-mono text-xs ml-auto" style={{ color: 'var(--muted)' }}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface2)', color: 'var(--text)' }}>
                        ${item.token?.symbol}
                      </span>
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                        {item.token?.name}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                      {item.insight}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* AI Insights sidebar (1/3 width) */}
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--muted)' }}>
              Claude's Insights
            </p>

            {loading && (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-24 rounded-lg" />
                ))}
              </div>
            )}

            {!loading && insights.map((insight, i) => (
              <div
                key={i}
                className="rounded-xl p-4 animate-fade-up"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
                  {insight}
                </p>
              </div>
            ))}

            {!loading && insights.length === 0 && (
              <div className="rounded-xl p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Insights will appear as ecosystem data loads.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
