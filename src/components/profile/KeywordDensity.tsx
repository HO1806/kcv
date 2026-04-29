import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/progress'

interface KeywordDensityProps {
  bullets: string[]
  skills: { name: string; category: 'technical' | 'tool' | 'soft' }[]
}

export function KeywordDensity({ bullets, skills }: KeywordDensityProps) {
  const bulletsText = bullets.join(' ').toLowerCase()

  const matched = skills.filter((s) => bulletsText.includes(s.name.toLowerCase()))
  const missing = skills
    .filter((s) => !bulletsText.includes(s.name.toLowerCase()))
    .slice(0, 6)

  const coverage = skills.length === 0 ? 0 : Math.round((matched.length / skills.length) * 100)

  const coverageColor =
    coverage >= 60
      ? 'var(--c-success)'
      : coverage >= 30
      ? 'var(--c-warning)'
      : 'var(--c-on-surface-muted)'

  return (
    <div
      className="flex flex-col gap-2 p-3 rounded-md"
      style={{ background: 'var(--c-surface-container)' }}
    >
      <div className="flex items-center justify-between">
        <span className="ks-eyebrow">Densité des mots-clés</span>
        <span
          className="ks-body-sm font-semibold tabular-nums"
          style={{ color: coverageColor }}
        >
          {coverage}%
        </span>
      </div>

      <Progress value={coverage} aria-label={`Densité des mots-clés: ${coverage}%`} />

      {missing.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {missing.map((s) => (
            <Badge key={s.name} variant="outline" className="text-[11px]">
              {s.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
