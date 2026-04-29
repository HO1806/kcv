import clsx from 'clsx'
import { Card } from '@/components/ui/Card'

export type ThemeCardValue = 'light' | 'dark' | 'system'

interface ThemeCardProps {
  value: ThemeCardValue
  label: string
  description: string
  active: boolean
  onSelect: (value: ThemeCardValue) => void
}

function ThemePreview({ value }: { value: ThemeCardValue }) {
  if (value === 'light') {
    return (
      <div
        className="flex h-12 w-16 shrink-0 overflow-hidden border rounded-md"
        style={{ borderColor: 'var(--c-outline)' }}
      >
        <div className="w-1/3" style={{ backgroundColor: '#FCF9F3' }} />
        <div
          className="flex-1 flex flex-col justify-center gap-1 p-1.5"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <span className="block h-1 w-3/4" style={{ backgroundColor: '#630D0D' }} />
          <span className="block h-1 w-1/2" style={{ backgroundColor: '#5A5151' }} />
        </div>
      </div>
    )
  }
  if (value === 'dark') {
    return (
      <div
        className="flex h-12 w-16 shrink-0 overflow-hidden border rounded-md"
        style={{ borderColor: '#2D343D' }}
      >
        <div className="w-1/3" style={{ backgroundColor: '#1B4332' }} />
        <div
          className="flex-1 flex flex-col justify-center gap-1 p-1.5"
          style={{ backgroundColor: '#121417' }}
        >
          <span className="block h-1 w-3/4" style={{ backgroundColor: '#34D399' }} />
          <span className="block h-1 w-1/2" style={{ backgroundColor: '#A0AEC0' }} />
        </div>
      </div>
    )
  }
  return (
    <div
      className="flex h-12 w-16 shrink-0 overflow-hidden border rounded-md"
      style={{ borderColor: 'var(--c-outline)' }}
    >
      <div
        className="w-1/2 flex flex-col justify-center gap-1 p-1.5"
        style={{ backgroundColor: '#FCF9F3' }}
      >
        <span className="block h-1 w-3/4" style={{ backgroundColor: '#630D0D' }} />
      </div>
      <div
        className="w-1/2 flex flex-col justify-center gap-1 p-1.5"
        style={{ backgroundColor: '#121417' }}
      >
        <span className="block h-1 w-3/4" style={{ backgroundColor: '#34D399' }} />
      </div>
    </div>
  )
}

export function ThemeCard({ value, label, description, active, onSelect }: ThemeCardProps) {
  return (
    <Card
      role="radio"
      aria-checked={active}
      tabIndex={0}
      onClick={() => onSelect(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(value)
        }
      }}
      data-size="sm"
      className={clsx(
        'group flex w-full items-center gap-3 p-4 text-left transition-colors cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-(--c-accent) focus-visible:outline-offset-2',
        'md:flex-col md:items-start md:gap-3',
        active
          ? 'ring-(--c-accent) bg-(--c-surface-bright)'
          : 'ring-(--c-outline) bg-(--c-surface-container) hover:ring-(--c-on-surface-muted)'
      )}
    >
      <ThemePreview value={value} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-(--c-on-surface)">{label}</span>
          <span
            className={clsx(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
              active ? 'border-transparent bg-(--c-accent) text-(--c-on-success)' : 'border-(--c-outline)'
            )}
            aria-hidden
          >
            {active && (
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                check
              </span>
            )}
          </span>
        </div>
        <p className="mt-1 text-xs text-(--c-on-surface-muted)">{description}</p>
      </div>
    </Card>
  )
}
