import { Card, CardContent } from '@/components/ui/Card'

interface AtsScoreMeterProps {
  score: number
  /** Smaller variant for tight spaces (mobile chip). */
  size?: 'md' | 'lg'
  jobTitle?: string
  company?: string
}

const SIZES = {
  md: { box: 96, stroke: 6, font: 'text-2xl' },
  lg: { box: 132, stroke: 7, font: 'text-3xl' },
} as const

function scoreColor(score: number): string {
  if (score >= 70) return 'var(--c-success)'
  if (score >= 45) return 'var(--c-warning)'
  return 'var(--c-danger)'
}

export function AtsScoreMeter({ score, size = 'lg', jobTitle, company }: AtsScoreMeterProps) {
  const dims = SIZES[size]
  const radius = (dims.box - dims.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference - (clamped / 100) * circumference
  const stroke = scoreColor(clamped)

  return (
    <Card className="bg-(--c-surface-container) ring-(--c-outline)">
      <CardContent>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative" style={{ width: dims.box, height: dims.box }}>
            <svg width={dims.box} height={dims.box} className="-rotate-90">
              <circle
                cx={dims.box / 2}
                cy={dims.box / 2}
                r={radius}
                fill="none"
                stroke="var(--c-outline)"
                strokeWidth={dims.stroke}
                opacity={0.4}
              />
              <circle
                cx={dims.box / 2}
                cy={dims.box / 2}
                r={radius}
                fill="none"
                stroke={stroke}
                strokeWidth={dims.stroke}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
              />
            </svg>
            <div
              className={`absolute inset-0 flex items-center justify-center font-bold ${dims.font}`}
              style={{ color: 'var(--c-on-surface)', fontFamily: 'var(--font-serif)' }}
            >
              {clamped}%
            </div>
          </div>
          <p className="ks-section">Score de compatibilité</p>
          {(jobTitle || company) && (
            <p
              className="text-sm italic leading-snug text-(--c-on-surface)"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {jobTitle}
              {jobTitle && company ? ' · ' : ''}
              {company}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
