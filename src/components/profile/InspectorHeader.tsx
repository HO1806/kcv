import clsx from 'clsx'
import { Progress } from '@/components/ui/progress'

interface InspectorHeaderProps {
  /** Currently active section name (sentence case), e.g. "Expérience". */
  sectionLabel: string
  /** Short summary line, e.g. "Analyse & affinage". */
  subtitle?: string
  /** 0–100 completion for the active section. */
  completion: number
  className?: string
}

/**
 * Section header strip used at the top of an editor section.
 *
 * Uses sentence-case typography (`ks-section`, `ks-caption`) and the shadcn
 * `Progress` primitive for the completion meter. The previous "INSPECTEUR"
 * eyebrow has been removed — the wayfinding now comes from the parent tabs.
 */
export function InspectorHeader({
  sectionLabel,
  subtitle,
  completion,
  className,
}: InspectorHeaderProps) {
  const isComplete = completion >= 100

  return (
    <div
      className={clsx('flex flex-col gap-3 px-4 py-4 border-b shrink-0', className)}
      style={{ borderColor: 'var(--c-outline)' }}
    >
      <div className="flex items-end justify-between gap-3">
        <h2 className="ks-section truncate" title={sectionLabel}>
          {sectionLabel}
        </h2>
        <span
          className="tabular-nums font-medium leading-none ks-caption"
          style={{ color: isComplete ? 'var(--c-success)' : 'var(--c-on-surface-muted)' }}
        >
          {completion}%
        </span>
      </div>

      {subtitle && (
        <p className="ks-caption leading-snug -mt-1">{subtitle}</p>
      )}

      <Progress value={completion} aria-label={`Complétion: ${completion}%`} />
    </div>
  )
}
