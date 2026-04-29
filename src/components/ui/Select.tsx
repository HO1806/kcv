import { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

type Option<T extends string = string> = T | { value: T; label: string }

export interface SelectProps<T extends string = string> {
  value: T
  onChange: (value: T) => void
  options: ReadonlyArray<Option<T>>
  placeholder?: string
  searchable?: boolean
  label?: string
  className?: string
  disabled?: boolean
}

function normalize<T extends string>(opt: Option<T>): { value: T; label: string } {
  return typeof opt === 'string' ? { value: opt, label: opt } : opt
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  label,
  className,
  disabled = false,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const items = useMemo(() => options.map((o) => normalize<T>(o)), [options])
  const selected = useMemo(() => items.find((i) => i.value === value), [items, value])

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return items
    const q = query.toLowerCase()
    return items.filter((i) => i.label.toLowerCase().includes(q))
  }, [items, query, searchable])

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative flex flex-col gap-1', className)}>
      {label ? (
        <span className="text-xs font-medium" style={{ color: 'var(--c-on-surface-muted)' }}>
          {label}
        </span>
      ) : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-3 text-sm outline-none transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
        style={{
          borderColor: 'var(--c-outline)',
          color: 'var(--c-on-surface)',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn('truncate text-left', !selected && 'opacity-60')}>
          {selected?.label ?? placeholder ?? ''}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">
          expand_more
        </span>
      </button>
      {open ? (
        <div
          className="absolute z-50 mt-1 max-h-64 w-full overflow-hidden rounded-lg border shadow-lg"
          style={{
            top: label ? '100%' : 'calc(100% + 0px)',
            background: 'var(--c-surface-bright)',
            borderColor: 'var(--c-outline)',
          }}
        >
          {searchable ? (
            <div className="border-b p-1.5" style={{ borderColor: 'var(--c-outline)' }}>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="w-full bg-transparent px-2 py-1 text-sm outline-none"
                style={{ color: 'var(--c-on-surface)' }}
              />
            </div>
          ) : null}
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li
                className="px-3 py-1.5 text-sm"
                style={{ color: 'var(--c-on-surface-muted)' }}
              >
                Aucun résultat
              </li>
            ) : (
              filtered.map((item) => (
                <li key={item.value} role="option" aria-selected={item.value === value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(item.value)
                      setOpen(false)
                      setQuery('')
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-1.5 text-left text-sm transition-colors hover:bg-(--c-surface-container)',
                      item.value === value && 'font-medium'
                    )}
                    style={{ color: 'var(--c-on-surface)' }}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.value === value ? (
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16, color: 'var(--c-primary)' }}
                        aria-hidden="true"
                      >
                        check
                      </span>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
