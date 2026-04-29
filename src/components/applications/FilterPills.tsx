import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { STATUS_FILTERS, type StatusFilter } from './filters'

interface FilterPillsProps {
  active: StatusFilter
  counts: Record<StatusFilter, number>
  onChange: (next: StatusFilter) => void
  className?: string
}

const FALLBACK_LABELS: Record<StatusFilter, string> = {
  all: 'Tous',
  saved: 'Sauvegardés',
  applied: 'Candidaté',
  interview: 'Entretien',
  offer: 'Offre',
  rejected: 'Refusé',
}

function resolveLabel(key: StatusFilter, t: (k: string) => string): string {
  if (key === 'all') return FALLBACK_LABELS.all
  const translated = t(`applications.status.${key}`)
  // i18next returns the key when missing — fall back to French copy.
  return translated.startsWith('applications.') ? FALLBACK_LABELS[key] : translated
}

export function FilterPills({ active, counts, onChange, className }: FilterPillsProps) {
  const { t } = useTranslation()

  return (
    <ToggleGroup
      type="single"
      size="sm"
      spacing={2}
      value={active}
      onValueChange={(value) => {
        // Radix returns '' when the user toggles the active item off;
        // keep current selection in that case.
        if (value) onChange(value as StatusFilter)
      }}
      aria-label={t('applications.title')}
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      {STATUS_FILTERS.map((key) => {
        const isActive = active === key
        const label = resolveLabel(key, t)
        const count = counts[key] ?? 0
        return (
          <ToggleGroupItem
            key={key}
            value={key}
            variant="outline"
            size="sm"
            aria-label={`${label} (${count})`}
            className={cn(
              'gap-2 whitespace-nowrap rounded-full border-(--c-outline) bg-(--c-surface-bright) text-(--c-on-surface-muted)',
              'hover:text-(--c-on-surface) hover:bg-(--c-surface-container)',
              isActive &&
                'data-[state=on]:bg-(--c-accent) data-[state=on]:text-(--c-on-primary) data-[state=on]:border-(--c-accent)'
            )}
          >
            <span>{label}</span>
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-5 px-1 text-[10px] font-medium leading-none py-0.5 rounded-full',
                isActive
                  ? 'bg-(--c-on-primary)/15 text-(--c-on-primary)'
                  : 'bg-(--c-surface-container) text-(--c-on-surface-muted)'
              )}
            >
              {count}
            </span>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
