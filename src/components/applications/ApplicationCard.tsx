import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { cn } from '../../lib/utils'
import { ScoreBadge } from './ScoreBadge'
import { StatusPill } from './StatusPill'
import type { JobApplication } from '../../types'

interface ApplicationCardProps {
  app: JobApplication
  isSelected: boolean
  onSelect: (app: JobApplication) => void
  onEdit: (app: JobApplication) => void
  onDelete: (id: string) => void
}

const DAY_MS = 1000 * 60 * 60 * 24

function relativeDays(ts: number): string {
  const days = Math.max(0, Math.floor((Date.now() - ts) / DAY_MS))
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return '1 jour'
  return `${days} jours`
}

export function ApplicationCard({
  app,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: ApplicationCardProps) {
  const { t } = useTranslation()
  const initial = (app.company || app.jobTitle || '?').trim().charAt(0).toUpperCase()
  const since = app.appliedAt ?? app.createdAt

  return (
    <Card
      onClick={() => onSelect(app)}
      data-size="sm"
      className={cn(
        'cursor-pointer transition-colors ring-1',
        isSelected
          ? 'ring-(--c-accent)'
          : 'ring-(--c-outline) hover:ring-(--c-on-surface-muted)'
      )}
    >
      <CardContent>
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-(--c-surface-container-high) text-(--c-on-surface) text-sm font-semibold"
          >
            {initial}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-(--c-on-surface) truncate">
                {app.company || '—'}
              </h3>
              {app.fitAnalysis && <ScoreBadge score={app.fitAnalysis.score} />}
            </div>
            <p className="text-xs text-(--c-on-surface-muted) truncate">
              {app.jobTitle || '—'}
            </p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <StatusPill status={app.status} />
              <span className="text-xs text-(--c-on-surface-muted)">
                {relativeDays(since)}
              </span>
            </div>
          </div>

          <div
            className="flex flex-col items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onSelect(app)}
              aria-label="Voir"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                visibility
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(app)}
              aria-label="Modifier"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                edit
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(app.id)}
              aria-label={t('common.remove')}
              className="hover:text-(--c-danger)"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                delete
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
