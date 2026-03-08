'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, TrendingUp, AlertTriangle, Zap, RefreshCw, ExternalLink, ChevronRight, Clock } from 'lucide-react'

const ALERT_CONFIG: Record<string, any> = {
  volume_spike:   { icon: TrendingUp,    color: '#c8f04a', bg: 'rgba(200,240,74,0.08)',  label: 'Volume Spike'   },
  unclaimed_high: { icon: AlertTriangle, color: '#f0a84a', bg: 'rgba(240,168,74,0.08)', label: 'High Unclaimed' },
  new_activity:   { icon: Zap,           color: '#4af0c8', bg: 'rgba(74,240,200,0.08)', label: 'New Activity'   },
  fee_anomaly:    { icon: Bell,          color: '#f04a4a', bg: 'rgba(240,74,74,0.08)',  label: 'Fee Anomaly'    },
}
const SEVERITY_DOT: Record<string, string> = { high: '#f04a4a', medium: '#f0a84a', low: '#c8f04a' }

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [generatedAt, setGeneratedAt] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [rateLimit, setRateLimit] = useState(false)
  const [filter, setFilter] = useState('all')

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const res = await fetch('/api/alerts')
      const data = await res.json()
      setAlerts(data.alerts || [])
      setGeneratedAt(data.generatedAt || '')
      setRateLimit(data.error === 'rate_limit')
    } finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const iv = setInterval(() => load(true), 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [load])

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter)

  return (
    <div className="min-h-full">
      <div className="px-10 pt-12 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-serif text-3xl" style={{ color: 'var(--text)' }}>
            AI <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Alerts</em>
          </h1>
          <button onClick={() => load(true)} disabled={refreshing}
            className="flex items-center gap-2 font-mono text-xs px-3 py-2 rounded-lg transition-all"
            style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
            <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Scanning...' : 'Refresh'}
          </button>
        </div>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Claude scans the ecosystem and surfaces anomalies automatically.</p>
        {generatedAt && (
          <div className="flex items-center gap-1.5 mt-3">
            <Clock size={10} style={{ color: 'var(--muted)' }} />
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Last scan: {new Date(generatedAt).toLocaleTimeString()}</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-5 flex-wrap">
          {['all', 'volume_spike', 'unclaimed_high', 'new_activity', 'fee_anomaly'].map(key => (
            <button key={key} onClick={() => setFilter(key)}
              className="font-mono text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: filter === key ? 'rgba(200,240,74,0.15)' : 'var(--surface2)',
                color: filter === key ? 'var(--accent)' : 'var(--muted)',
                border: filter === key ? '1px solid rgba(200,240,74,0.3)' : '1px solid var(--border)',
              }}>
              {key === 'all' ? `All (${alerts.length})` : ALERT_CONFIG[key]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-10 py-8 space-y-3 max-w-3xl">
        {loading && [...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}

        {!loading && rateLimit && (
          <div className="rounded-xl p-6 text-center" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <p className="font-mono text-sm" style={{ color: 'var(--accent)' }}>Rate limit reached</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Bags API resets hourly. Alerts will resume automatically.</p>
          </div>
        )}

        {!loading && !rateLimit && filtered.length === 0 && (
          <div className="rounded-xl p-12 text-center" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <Bell size={24} className="mx-auto mb-3" style={{ color: 'var(--muted)' }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No alerts detected. Ecosystem looks calm.</p>
          </div>
        )}

        {!loading && filtered.map((alert, i) => {
          const cfg = ALERT_CONFIG[alert.type] || ALERT_CONFIG.volume_spike
          const Icon = cfg.icon
          const isSelected = selected?.mint === alert.mint && selected?.type === alert.type
          return (
            <div key={i} onClick={() => setSelected(isSelected ? null : alert)}
              className="rounded-xl p-5 cursor-pointer transition-all animate-fade-up"
              style={{
                background: isSelected ? cfg.bg : 'var(--surface)',
                border: `1px solid ${isSelected ? cfg.color + '40' : 'var(--border)'}`,
                animationDelay: `${i * 0.05}s`,
              }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--surface2)' }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                  <Icon size={15} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    <span className="w-2 h-2 rounded-full" style={{ background: SEVERITY_DOT[alert.severity] || '#c8f04a' }} />
                    <span className="font-mono text-xs capitalize" style={{ color: 'var(--muted)' }}>{alert.severity}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{alert.title}</p>
                    <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>\${alert.symbol}</span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs px-2 py-1 rounded" style={{ background: 'var(--surface2)', color: cfg.color }}>{alert.metric}</span>
                    <ChevronRight size={13} style={{ color: 'var(--muted)', transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: cfg.color + '30' }}>
                  <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
                    <span style={{ color: cfg.color }}>Action: </span>{alert.action}
                  </p>
                  <div className="flex gap-2">
                    <a href={"/analyzer?mint=" + alert.mint}
                      className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg no-underline"
                      style={{ background: 'rgba(200,240,74,0.1)', color: 'var(--accent)', border: '1px solid rgba(200,240,74,0.2)' }}
                      onClick={e => e.stopPropagation()}>
                      <TrendingUp size={10} /> Full Analysis
                    </a>
                    <a href={"https://bags.fm/" + alert.mint} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg no-underline"
                      style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
                      onClick={e => e.stopPropagation()}>
                      <ExternalLink size={10} /> bags.fm
                    </a>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
