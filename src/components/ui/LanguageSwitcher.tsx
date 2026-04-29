import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store'

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation()
  const { language, setLanguage } = useAppStore()

  function toggle(lang: 'fr' | 'en') {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  if (compact) {
    const next = language === 'fr' ? 'en' : 'fr'
    return (
      <button
        type="button"
        onClick={() => toggle(next)}
        aria-label={`Switch to ${next.toUpperCase()}`}
        className="w-8 h-8 flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer"
        style={{ color: 'var(--c-on-surface-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-surface-container)'; e.currentTarget.style.color = 'var(--c-on-surface)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-on-surface-muted)' }}
      >
        {language}
      </button>
    )
  }

  return (
    <div
      className="flex border overflow-hidden text-xs"
      style={{ borderColor: 'var(--c-outline)' }}
    >
      {(['fr', 'en'] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => toggle(lang)}
          className="px-3 py-1.5 font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer"
          style={
            language === lang
              ? { background: 'var(--c-primary)', color: 'var(--c-on-primary)' }
              : { color: 'var(--c-on-surface-muted)' }
          }
          onMouseEnter={(e) => { if (language !== lang) { e.currentTarget.style.background = 'var(--c-surface-container)'; e.currentTarget.style.color = 'var(--c-on-surface)' } }}
          onMouseLeave={(e) => { if (language !== lang) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-on-surface-muted)' } }}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
