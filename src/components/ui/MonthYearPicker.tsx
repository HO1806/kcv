import { useState, useRef, useEffect, useId } from 'react'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

// Grid layout: 3 columns, 4 rows
// Arrow key navigation: Left/Right move between months, Up/Down move between rows of 3
const COLS = 3

interface MonthYearPickerProps {
  value: string // "YYYY-MM" or ""
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function MonthYearPicker({ value, onChange, disabled = false, placeholder = 'MM/AAAA' }: MonthYearPickerProps) {
  const uid = useId()
  const popupId = `myp-popup-${uid}`

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const parsed = value && value.includes('-') ? { year: parseInt(value.split('-')[0]), month: parseInt(value.split('-')[1]) } : null

  const [yearOverride, setYearOverride] = useState<number>(parsed?.year ?? new Date().getFullYear())
  const year = parsed?.year ?? yearOverride

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function selectMonth(monthIdx: number) {
    const mm = String(monthIdx + 1).padStart(2, '0')
    onChange(`${year}-${mm}`)
    setOpen(false)
  }

  function displayValue() {
    if (!value || !parsed) return ''
    return `${MONTHS[parsed.month - 1]} ${parsed.year}`
  }

  const formattedValue = displayValue()
  const isSelectedYear = parsed?.year === year

  function handleMonthKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, idx: number) {
    const buttons = Array.from(
      gridRef.current?.querySelectorAll<HTMLButtonElement>('button[data-month-idx]') ?? []
    )

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      buttons[idx + 1]?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      buttons[idx - 1]?.focus()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      buttons[idx + COLS]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      buttons[idx - COLS]?.focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-label={formattedValue ? `Date: ${formattedValue}` : 'Sélectionner une date'}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? popupId : undefined}
        className="w-full text-left px-3 py-2.5 text-sm rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#adc6ff]"
        style={{
          background: '#161b2b',
          borderColor: open ? '#adc6ff' : 'rgba(66,71,84,0.6)',
          color: value ? '#dee1f7' : '#8c909f',
        }}
      >
        {formattedValue || <span style={{ color: '#8c909f' }}>{placeholder}</span>}
      </button>

      {open && (
        <div
          id={popupId}
          role="dialog"
          aria-label="Sélecteur de date"
          className="absolute z-50 mt-1 rounded-xl border shadow-2xl p-3 w-56"
          style={{ background: '#25293a', borderColor: 'rgba(66,71,84,0.4)' }}
        >
          {/* Year row */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setYearOverride((y) => y - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#adc6ff]"
              style={{ color: '#adc6ff' }}
              aria-label="Année précédente"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">chevron_left</span>
            </button>
            <span className="font-semibold text-sm" style={{ color: '#dee1f7' }}>{year}</span>
            <button
              type="button"
              onClick={() => setYearOverride((y) => y + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#adc6ff]"
              style={{ color: '#adc6ff' }}
              aria-label="Année suivante"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">chevron_right</span>
            </button>
          </div>

          {/* Month grid */}
          <div ref={gridRef} className="grid grid-cols-3 gap-1">
            {MONTHS.map((m, i) => {
              const selected = isSelectedYear && parsed?.month === i + 1
              return (
                <button
                  key={m}
                  type="button"
                  data-month-idx={i}
                  onClick={() => selectMonth(i)}
                  onKeyDown={(e) => handleMonthKeyDown(e, i)}
                  aria-label={`${m} ${year}`}
                  aria-pressed={selected}
                  className="py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#adc6ff] focus-visible:outline-none"
                  style={{
                    background: selected ? '#4ae176' : 'transparent',
                    color: selected ? '#002109' : '#dee1f7',
                  }}
                  onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                  onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
