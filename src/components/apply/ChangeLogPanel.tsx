import { useMemo } from 'react'
import { diffWords, type Change } from 'diff'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import type { ChangeEntry, EnhancedExperience } from '../../types'

interface ChangeLogPanelProps {
  changeLog: ChangeEntry[]
  editedSummary: string
  onSummaryChange: (v: string) => void
  editedExperience: EnhancedExperience[]
  onExperienceChange: (updated: EnhancedExperience[]) => void
}

export function ChangeLogPanel({
  changeLog,
  editedSummary,
  onSummaryChange,
  editedExperience,
  onExperienceChange,
}: ChangeLogPanelProps) {
  const { t } = useTranslation()

  if (changeLog.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-xs text-(--c-on-surface-muted)">
          {t('apply.changeLog.noChanges')}
        </p>
      </div>
    )
  }

  const fieldsLabel =
    changeLog.length === 1
      ? t('apply.changeLog.fieldsAdaptedOne', { count: 1 })
      : t('apply.changeLog.fieldsAdaptedOther', { count: changeLog.length })

  return (
    <div className="flex flex-col gap-4">
      <div
        className="px-3 py-2 border-l-2 rounded-md"
        style={{
          borderColor: 'var(--c-accent)',
          background: 'var(--c-surface-container)',
        }}
      >
        <p className="ks-section text-(--c-accent)">{fieldsLabel}</p>
        <p className="text-xs mt-0.5 text-(--c-on-surface-muted)">
          {t('apply.changeLog.reviewHint')}
        </p>
      </div>

      {/* TODO(wave3): Apply diff highlighting in CV preview pane */}
      {changeLog.map((entry, i) => {
        if (entry.field === 'summary') {
          return (
            <ChangeField
              key={i}
              label={t('apply.changeLog.summaryLabel')}
              context={null}
              before={entry.before}
              value={editedSummary}
              onChange={onSummaryChange}
            />
          )
        }

        const expEntry = editedExperience.find((e) => e.experienceId === entry.experienceId)
        const currentValue = expEntry ? expEntry.enhancedBullets.join('\n') : entry.after
        const context = [entry.role, entry.company].filter(Boolean).join(' · ') || null

        return (
          <ChangeField
            key={i}
            label={t('apply.changeLog.experienceLabel')}
            context={context}
            before={entry.before}
            value={currentValue}
            onChange={(v) => {
              const updated = editedExperience.map((e) =>
                e.experienceId === entry.experienceId
                  ? { ...e, enhancedBullets: v.split('\n').filter((b) => b.trim()) }
                  : e
              )
              onExperienceChange(updated)
            }}
          />
        )
      })}
    </div>
  )
}

interface ChangeFieldProps {
  label: string
  context: string | null
  before: string
  value: string
  onChange: (v: string) => void
}

function ChangeField({ label, context, before, value, onChange }: ChangeFieldProps) {
  const { t } = useTranslation()
  const diffParts = useMemo<Change[]>(() => diffWords(before, value), [before, value])

  return (
    <Card className="ring-(--c-outline)">
      <CardHeader className="pb-2 border-b border-(--c-outline) bg-(--c-surface-container)">
        <div className="flex items-center gap-2">
          <span className="ks-section text-(--c-accent)">{label}</span>
          {context && (
            <span className="text-xs text-(--c-on-surface-muted)">{context}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* Unified diff view */}
        <div>
          <p className="ks-caption mb-1">{t('apply.changeLog.diff')}</p>
          <p className="text-[11px] leading-relaxed whitespace-pre-wrap">
            <DiffInline parts={diffParts} />
          </p>
        </div>

        {/* Before — read-only, struck through */}
        <div>
          <p className="ks-caption mb-1">{t('apply.changeLog.before')}</p>
          <p
            className="text-[11px] leading-relaxed whitespace-pre-wrap text-(--c-on-surface-muted) line-through"
          >
            {before}
          </p>
        </div>

        {/* After — editable */}
        <div>
          <p className="ks-caption mb-1 text-(--c-accent)">
            {t('apply.changeLog.after')}
          </p>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-[11px] leading-relaxed border-(--c-accent) bg-(--c-surface-bright)"
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface DiffInlineProps {
  parts: Change[]
}

function DiffInline({ parts }: DiffInlineProps) {
  return (
    <>
      {parts.map((part, idx) => {
        if (part.added) {
          return (
            <span
              key={idx}
              className="bg-(--c-accent)/15 text-(--c-accent)"
              style={{ borderRadius: 2, padding: '0 2px' }}
            >
              {part.value}
            </span>
          )
        }
        if (part.removed) {
          return (
            <span
              key={idx}
              className="bg-(--c-danger)/10 text-(--c-danger) line-through"
              style={{ borderRadius: 2, padding: '0 2px' }}
            >
              {part.value}
            </span>
          )
        }
        return (
          <span key={idx} style={{ color: 'var(--c-on-surface)' }}>
            {part.value}
          </span>
        )
      })}
    </>
  )
}
