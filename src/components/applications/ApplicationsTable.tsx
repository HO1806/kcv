import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '../../lib/utils'
import { ScoreBadge } from './ScoreBadge'
import { StatusPill } from './StatusPill'
import type { JobApplication } from '../../types'

interface ApplicationsTableProps {
  applications: JobApplication[]
  selectedId: string | null
  onSelect: (app: JobApplication) => void
  onEdit: (app: JobApplication) => void
  onDelete: (id: string) => void
  className?: string
  loading?: boolean
}

const SKELETON_ROW_COUNT = 5

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, idx) => (
        <TableRow
          key={`skeleton-${idx}`}
          className="border-b border-(--c-outline) hover:bg-transparent"
          aria-hidden="true"
        >
          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-4 w-32" />
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell>
            <div className="flex items-center justify-end gap-1">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-6" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

const COLUMN_LABELS = {
  company: 'Entreprise',
  role: 'Poste',
  score: 'Score',
  template: 'Modèle',
  status: 'Statut',
  appliedAt: 'Candidaté',
  actions: 'Actions',
} as const

const ACTION_LABELS = {
  view: 'Voir',
  edit: 'Modifier',
} as const

function formatDateShort(ts: number): string {
  return new Date(ts).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function templateLabel(id: string): string {
  // Sentence case from a kebab id, e.g. "ats-clean" -> "Ats clean"
  const words = id.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function ApplicationsTable(props: ApplicationsTableProps) {
  const { applications, selectedId, onSelect, onEdit, onDelete, className, loading = false } = props
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'border border-(--c-outline) bg-(--c-surface-bright) rounded-xl overflow-hidden',
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-b border-(--c-outline) hover:bg-transparent">
            <TableHead>{COLUMN_LABELS.company}</TableHead>
            <TableHead>{COLUMN_LABELS.role}</TableHead>
            <TableHead>{COLUMN_LABELS.score}</TableHead>
            <TableHead>{COLUMN_LABELS.template}</TableHead>
            <TableHead>{COLUMN_LABELS.status}</TableHead>
            <TableHead>{COLUMN_LABELS.appliedAt}</TableHead>
            <TableHead className="text-right">{COLUMN_LABELS.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? <SkeletonRows /> : applications.map((app) => {
            const isSelected = selectedId === app.id
            const initial = (app.company || app.jobTitle || '?').trim().charAt(0).toUpperCase()
            return (
              <TableRow
                key={app.id}
                role="button"
                tabIndex={0}
                aria-label={`${app.company || '—'} — ${app.jobTitle || '—'}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(app)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(app)
                  }
                }}
                data-state={isSelected ? 'selected' : undefined}
                className={cn(
                  'border-b border-(--c-outline) cursor-pointer',
                  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--c-accent)'
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--c-surface-container-high) text-(--c-on-surface) text-[11px] font-semibold"
                    >
                      {initial}
                    </span>
                    <span className="font-medium text-(--c-on-surface) truncate">
                      {app.company || '—'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-(--c-on-surface-muted) truncate max-w-56">
                  {app.jobTitle || '—'}
                </TableCell>
                <TableCell>
                  {app.fitAnalysis ? (
                    <ScoreBadge score={app.fitAnalysis.score} />
                  ) : (
                    <span className="text-(--c-on-surface-muted)">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-(--c-surface-container) text-(--c-on-surface-muted) border border-(--c-outline)">
                    {templateLabel(app.templateId)}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusPill status={app.status} />
                </TableCell>
                <TableCell className="text-(--c-on-surface-muted)">
                  {app.appliedAt ? formatDateShort(app.appliedAt) : formatDateShort(app.createdAt)}
                </TableCell>
                <TableCell>
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onSelect(app)}
                          aria-label={ACTION_LABELS.view}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">
                            visibility
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{ACTION_LABELS.view}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEdit(app)}
                          aria-label={ACTION_LABELS.edit}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">
                            edit
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{ACTION_LABELS.edit}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDelete(app.id)}
                          aria-label={t('common.remove')}
                          className="hover:text-(--c-danger)"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">
                            delete
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('common.remove')}</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
