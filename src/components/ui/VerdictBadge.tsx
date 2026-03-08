type Verdict = 'STRONG' | 'NEUTRAL' | 'RISKY'

const config = {
  STRONG: { label: 'STRONG', bg: 'rgba(200,240,74,0.1)', color: '#c8f04a', border: 'rgba(200,240,74,0.25)' },
  NEUTRAL: { label: 'NEUTRAL', bg: 'rgba(240,164,74,0.1)', color: '#f0a44a', border: 'rgba(240,164,74,0.25)' },
  RISKY: { label: 'RISKY', bg: 'rgba(240,74,74,0.1)', color: '#f04a4a', border: 'rgba(240,74,74,0.25)' },
}

export default function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const c = config[verdict]
  return (
    <span
      className="font-mono text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {c.label}
    </span>
  )
}
