'use client'

import { useState } from 'react'
import { Search, AlertTriangle, CheckCircle, Minus, ExternalLink, Github, Twitter, Clock, TrendingUp, Users, Zap } from 'lucide-react'
import ScoreRing from '@/components/ui/ScoreRing'
import VerdictBadge from '@/components/ui/VerdictBadge'
import type { AnalyzeResponse } from '@/types'

const QUICK_TOKENS = [
  { label: 'GASTOWN', mint: 'GasT0wnExampleMint111111111111111111111111' },
  { label: 'LEVELSIO', mint: 'LeveLsi0ExampleMint11111111111111111111111' },
  { label: 'DEVCLAIM', mint: 'DevCLa1mExampleMint1111111111111111111111' },
]

export default function AnalyzerPage() {
  const [mint, setMint] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyze = async (mintAddress?: string) => {
    const target = mintAddress || mint.trim()
    if (!target) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mintAddress: target }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Analysis failed')
      }

      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="px-10 pt-12 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
        <h1 className="font-serif text-3xl mb-2" style={{ color: 'var(--text)' }}>
          Token <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Analyzer</em>
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted)', maxWidth: 480 }}>
          Paste any Bags token mint address. Claude analyzes creator background,
          holder distribution, and trading patterns in seconds.
        </p>

        {/* Search */}
        <div className="mt-7 flex gap-3" style={{ maxWidth: 600 }}>
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted)' }}
            />
            <input
              type="text"
              value={mint}
              onChange={e => setMint(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && analyze()}
              placeholder="Token mint address..."
              className="w-full rounded-lg py-3 pl-10 pr-4 font-mono text-sm outline-none transition-all"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border2)',
                color: 'var(--text)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>
          <button
            onClick={() => analyze()}
            disabled={loading || !mint.trim()}
            className="px-5 rounded-lg font-mono text-sm font-medium transition-all disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#0a0a0b' }}
          >
            {loading ? 'Analyzing...' : 'Scout →'}
          </button>
        </div>

        {/* Quick tokens */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Try:</span>
          {QUICK_TOKENS.map(t => (
            <button
              key={t.mint}
              onClick={() => { setMint(t.mint); analyze(t.mint) }}
              className="font-mono text-xs px-2.5 py-1 rounded-full transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'none' }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.borderColor = 'var(--accent)'
                ;(e.target as HTMLElement).style.color = 'var(--accent)'
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.target as HTMLElement).style.color = 'var(--muted)'
              }}
            >
              ${t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result area */}
      <div className="px-10 py-8">

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-fade-up" style={{ maxWidth: 800 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
              <span className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
                Claude is analyzing this token...
              </span>
            </div>
            {[0,1,2].map(i => (
              <div key={i} className="skeleton h-16 rounded-lg" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg p-4 animate-fade-up" style={{ background: 'rgba(240,74,74,0.08)', border: '1px solid rgba(240,74,74,0.2)' }}>
            <p className="text-sm font-mono" style={{ color: '#f04a4a' }}>⚠ {error}</p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="animate-fade-up space-y-4" style={{ maxWidth: 800 }}>

            {/* Header card */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="p-6 flex items-start justify-between gap-6">
                {/* Token identity */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-medium text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#0a0a0b' }}
                  >
                    {result.token.symbol?.slice(0, 2) || '??'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-medium" style={{ color: 'var(--text)' }}>
                        {result.token.name || 'Unknown Token'}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                        ${result.token.symbol}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {result.token.twitterHandle && (
                        <a href={`https://twitter.com/${result.token.twitterHandle}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 font-mono text-xs no-underline"
                          style={{ color: 'var(--muted)' }}>
                          <Twitter size={11} /> @{result.token.twitterHandle}
                        </a>
                      )}
                      {result.token.githubHandle && (
                        <a href={`https://github.com/${result.token.githubHandle}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 font-mono text-xs no-underline"
                          style={{ color: 'var(--muted)' }}>
                          <Github size={11} /> {result.token.githubHandle}
                        </a>
                      )}
                      <a href={`https://bags.fm/token/${result.token.mintAddress}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-xs no-underline"
                        style={{ color: 'var(--muted)' }}>
                        <ExternalLink size={11} /> bags.fm
                      </a>
                    </div>
                  </div>
                </div>

                {/* Score + verdict */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <ScoreRing score={result.analysis.score} size={72} verdict={result.analysis.verdict} />
                  <div>
                    <VerdictBadge verdict={result.analysis.verdict} />
                    <p className="font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>
                      Scout Score
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="px-6 pb-5 pt-1">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {result.analysis.summary}
                </p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Creator', icon: Users, data: result.analysis.creatorScore, max: 40 },
                { label: 'Holders', icon: TrendingUp, data: result.analysis.holderScore, max: 30 },
                { label: 'Momentum', icon: Zap, data: result.analysis.momentumScore, max: 30 },
              ].map(({ label, icon: Icon, data, max }) => (
                <div key={label} className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={13} style={{ color: 'var(--muted)' }} />
                      <span className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{label}</span>
                    </div>
                    <span className="font-mono text-sm font-medium" style={{ color: 'var(--accent)' }}>
                      {data.score}<span style={{ color: 'var(--muted)', fontSize: 10 }}>/{max}</span>
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="h-1 rounded-full mb-3" style={{ background: 'var(--surface2)' }}>
                    <div
                      className="h-1 rounded-full transition-all duration-700"
                      style={{
                        width: `${(data.score / max) * 100}%`,
                        background: 'var(--accent)',
                      }}
                    />
                  </div>

                  <p className="font-mono text-xs mb-1" style={{ color: 'var(--text)' }}>{data.label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{data.details}</p>
                </div>
              ))}
            </div>

            {/* Flags + Insights side by side */}
            <div className="grid grid-cols-2 gap-3">

              {/* Flags */}
              <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="font-mono text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--muted)' }}>Flags</p>
                <div className="space-y-2.5">
                  {result.analysis.flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      {flag.type === 'positive'
                        ? <CheckCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                        : flag.type === 'warning'
                        ? <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#f04a4a' }} />
                        : <Minus size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--muted)' }} />
                      }
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>{flag.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="font-mono text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--muted)' }}>AI Insights</p>
                <div className="space-y-3">
                  {result.analysis.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="font-mono text-xs mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fee data */}
            {(result.token.totalFees !== undefined || result.token.unclaimedFees !== undefined) && (
              <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="font-mono text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--muted)' }}>Fee Activity</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Generated', value: `${result.token.totalFees?.toFixed(3) || '0'} SOL` },
                    { label: 'Claimed', value: `${result.token.claimedFees?.toFixed(3) || '0'} SOL` },
                    { label: 'Unclaimed', value: `${result.token.unclaimedFees?.toFixed(3) || '0'} SOL`, highlight: true },
                  ].map(({ label, value, highlight }) => (
                    <div key={label}>
                      <p className="font-mono text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
                      <p className="font-mono text-lg font-medium" style={{ color: highlight ? 'var(--accent3)' : 'var(--text)' }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Holder distribution */}
            {result.holders.length > 0 && (
              <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="font-mono text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--muted)' }}>
                  Top Holders
                </p>
                <div className="space-y-2">
                  {result.holders.slice(0, 8).map((h, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="font-mono text-xs w-5 text-right" style={{ color: 'var(--muted)' }}>
                        {i + 1}
                      </span>
                      <span className="font-mono text-xs flex-1 truncate" style={{ color: 'var(--muted)' }}>
                        {h.address.slice(0, 6)}...{h.address.slice(-4)}
                      </span>
                      <div className="w-28 h-1 rounded-full" style={{ background: 'var(--surface2)' }}>
                        <div
                          className="h-1 rounded-full"
                          style={{ width: `${Math.min(h.percentage, 100)}%`, background: i === 0 ? 'var(--accent3)' : 'var(--accent)' }}
                        />
                      </div>
                      <span className="font-mono text-xs w-12 text-right" style={{ color: i === 0 ? 'var(--accent3)' : 'var(--text)' }}>
                        {h.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated at */}
            <div className="flex items-center gap-2 pt-1">
              <Clock size={11} style={{ color: 'var(--muted)' }} />
              <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                Analysis generated at {new Date(result.analysis.generatedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <Search size={24} style={{ color: 'var(--muted)' }} />
            </div>
            <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
              Enter a token mint address to begin
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)', opacity: 0.6 }}>
              Claude will analyze creator, holders, and trading patterns
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
