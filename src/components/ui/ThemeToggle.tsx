import { useTheme } from '../../hooks/useTheme'

function SunIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
    </svg>
  )
}

const OPTIONS = [
  { value: 'light' as const, icon: <SunIcon />, label: 'Clair' },
  { value: 'dark' as const, icon: <MoonIcon />, label: 'Sombre' },
  { value: 'system' as const, icon: <MonitorIcon />, label: 'Auto' },
]

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()

  if (compact) {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    const current = OPTIONS.find((o) => o.value === theme)!
    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        title={current.label}
        className="w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
        style={{ color: 'var(--c-on-surface-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-on-surface)'; e.currentTarget.style.background = 'var(--c-surface-container)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-on-surface-muted)'; e.currentTarget.style.background = 'transparent' }}
      >
        {current.icon}
      </button>
    )
  }

  return (
    <div
      className="flex border overflow-hidden text-xs"
      style={{ borderColor: 'var(--c-outline)' }}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setTheme(o.value)}
          title={o.label}
          className="flex items-center gap-1.5 px-2.5 py-1.5 font-medium transition-colors cursor-pointer"
          style={
            theme === o.value
              ? { background: 'var(--c-primary)', color: 'var(--c-on-primary)' }
              : { color: 'var(--c-on-surface-muted)' }
          }
          onMouseEnter={(e) => { if (theme !== o.value) { e.currentTarget.style.background = 'var(--c-surface-container)'; e.currentTarget.style.color = 'var(--c-on-surface)' } }}
          onMouseLeave={(e) => { if (theme !== o.value) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-on-surface-muted)' } }}
        >
          {o.icon}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  )
}
