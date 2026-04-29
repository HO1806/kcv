import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'

interface ApiKeyFieldProps {
  value: string
  onChange: (next: string) => void
  onSave: () => void
  saved: boolean
  saveLabel: string
  savedLabel: string
  /** Quota numerator — current usage. */
  quotaUsed: number
  /** Quota denominator — daily limit. */
  quotaLimit: number
  /** Help text displayed under the progress bar. */
  helpText: string
  /** Placeholder e.g. "AIza..." */
  placeholder?: string
  /** External link to obtain a key (label + href). */
  getKeyLabel: string
  getKeyHref: string
  /** Status hint — already configured / missing. */
  statusText: string
  statusKind: 'ok' | 'warn'
}

export function ApiKeyField({
  value,
  onChange,
  onSave,
  saved,
  saveLabel,
  savedLabel,
  quotaUsed,
  quotaLimit,
  helpText,
  placeholder = 'AIza...',
  getKeyLabel,
  getKeyHref,
  statusText,
  statusKind,
}: ApiKeyFieldProps) {
  const inputId = useId()
  const [revealed, setRevealed] = useState(false)
  const pct = Math.min(100, quotaLimit > 0 ? Math.round((quotaUsed / quotaLimit) * 100) : 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="flex-1 flex items-center gap-1">
          <Input
            id={inputId}
            type={revealed ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Masquer la clé' : 'Afficher la clé'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {revealed ? 'visibility_off' : 'visibility'}
            </span>
          </Button>
        </div>
        <Button type="button" onClick={onSave}>
          {saved ? savedLabel : saveLabel}
        </Button>
      </div>

      {/* Quota meter */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="ks-section">Utilisation de l'IA</span>
          <span className="text-xs font-mono tabular-nums text-(--c-on-surface)">
            {quotaUsed}/{quotaLimit} ({pct}%)
          </span>
        </div>
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-(--c-surface-container-high)"
          role="progressbar"
          aria-valuenow={quotaUsed}
          aria-valuemin={0}
          aria-valuemax={quotaLimit}
        >
          <div
            className="h-full origin-left transition-transform bg-(--c-accent)"
            style={{ width: '100%', transform: `scaleX(${pct / 100})` }}
          />
        </div>
        <p className="text-xs text-(--c-on-surface-muted)">{helpText}</p>
      </div>

      {/* Status row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <p
          className="flex items-center gap-1.5 text-xs"
          style={{ color: statusKind === 'ok' ? 'var(--c-success)' : 'var(--c-warning)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {statusKind === 'ok' ? 'check_circle' : 'error'}
          </span>
          {statusText}
        </p>
        <a
          href={getKeyHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline underline-offset-2 text-(--c-accent)"
        >
          {getKeyLabel}
        </a>
      </div>
    </div>
  )
}
