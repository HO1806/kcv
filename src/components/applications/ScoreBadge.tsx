import { cn } from '../../lib/utils'

interface ScoreBadgeProps {
  score: number
  className?: string
}

function tone(score: number): string {
  if (score >= 70) return 'bg-(--c-success) text-(--c-on-success)'
  if (score >= 45) return 'bg-(--c-warning)/15 text-(--c-warning)'
  return 'bg-(--c-danger)/15 text-(--c-danger)'
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
        tone(score),
        className
      )}
    >
      {score}%
    </span>
  )
}
