interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  verdict?: 'STRONG' | 'NEUTRAL' | 'RISKY'
}

const verdictColor = {
  STRONG: '#c8f04a',
  NEUTRAL: '#f0a44a',
  RISKY: '#f04a4a',
}

export default function ScoreRing({ score, size = 80, strokeWidth = 6, verdict = 'NEUTRAL' }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = verdictColor[verdict]

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      {/* Score text */}
      <div className="absolute flex flex-col items-center">
        <span className="font-mono font-medium" style={{ fontSize: size * 0.22, color }}>
          {score}
        </span>
      </div>
    </div>
  )
}
