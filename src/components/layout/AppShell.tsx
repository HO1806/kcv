import { useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutList, Briefcase, User, Settings as SettingsIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useAppStore } from '../../store'
import { cn } from '../../lib/utils'
import { SettingsProvider } from '../../contexts/SettingsProvider'
import { useSettings } from '../../contexts/SettingsContext'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

const QUOTA_MAX = 250

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

function QuotaCircle({ used }: { used: number }) {
  const pct = Math.min(100, Math.round((used / QUOTA_MAX) * 100))
  const r = 10
  const circ = 2 * Math.PI * r
  const fill = (pct / 100) * circ
  const color = pct >= 90 ? 'var(--c-danger)' : pct >= 70 ? '#f59e0b' : 'var(--c-accent)'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="relative w-7 h-7 flex items-center justify-center cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--c-accent)"
          role="img"
          tabIndex={0}
          aria-label={`Quota Gemini : ${used} sur ${QUOTA_MAX}`}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="14" cy="14" r={r} fill="none" strokeWidth="2.5" style={{ stroke: 'var(--c-surface-container-high)' }} />
            <circle
              cx="14" cy="14" r={r}
              fill="none"
              strokeWidth="2.5"
              strokeDasharray={`${fill} ${circ}`}
              strokeLinecap="round"
              style={{ stroke: color, transition: 'stroke-dasharray 0.4s ease' }}
            />
          </svg>
          <span className="absolute tabular-nums font-semibold" style={{ fontSize: '10px', color, lineHeight: 1 }} aria-hidden="true">
            {pct}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Quota Gemini : {used} / {QUOTA_MAX}
      </TooltipContent>
    </Tooltip>
  )
}

function useNavItems(): NavItem[] {
  const { t } = useTranslation()
  return [
    { to: '/applications', label: t('nav.applications'), icon: LayoutList },
    { to: '/apply', label: t('nav.applyJob'), icon: Briefcase },
    { to: '/edit', label: t('nav.profiles'), icon: User },
    { to: '/settings', label: t('nav.settings'), icon: SettingsIcon },
  ]
}

function TopBar() {
  const { settings } = useSettings()
  const quotaUsed = settings?.geminiQuotaUsed ?? 0
  const tabs = useNavItems()

  return (
    <div
      className="hidden md:grid h-12 px-5 border-b shrink-0 no-print relative z-60"
      style={{
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        background: 'var(--c-surface-bright)',
        borderColor: 'var(--c-outline)',
        boxShadow: '0 1px 0 var(--c-outline), 0 2px 6px -2px rgba(0, 0, 0, 0.06)',
      }}
    >
      <NavLink
        to="/applications"
        className="flex items-center gap-1 select-none w-fit"
        aria-label="Kosove CV — accueil"
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '-0.02em',
            color: 'var(--c-accent)',
            lineHeight: 1,
          }}
        >
          Kosove
        </span>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '18px',
            letterSpacing: '-0.02em',
            color: 'var(--c-on-surface)',
            lineHeight: 1,
          }}
        >
          CV
        </span>
      </NavLink>

      <nav className="flex gap-6" aria-label="Navigation principale">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'text-sm font-medium border-b-2 pb-[13px] whitespace-nowrap transition-colors tracking-normal',
                isActive
                  ? 'text-(--c-accent) border-(--c-accent)'
                  : 'text-(--c-on-surface-muted) hover:text-(--c-on-surface) border-transparent',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--c-accent)'
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2 justify-end">
        <QuotaCircle used={quotaUsed} />
      </div>
    </div>
  )
}

function MobileTopBar() {
  return (
    <div
      className="flex items-center px-4 py-3 md:hidden no-print border-b relative z-60"
      style={{ background: 'var(--c-surface)', borderColor: 'var(--c-outline)' }}
    >
      <NavLink to="/applications" aria-label="Kosove CV">
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 700, fontSize: '18px', color: 'var(--c-accent)' }}>Kosove</span>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '18px', color: 'var(--c-on-surface)' }}>CV</span>
      </NavLink>
    </div>
  )
}

function MobileBottomNav() {
  const items = useNavItems()

  return (
    <nav
      className="flex md:hidden fixed bottom-0 left-0 right-0 z-60 border-t no-print"
      style={{ background: 'var(--c-surface)', borderColor: 'var(--c-outline)' }}
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-1 py-2 min-h-[44px] text-[11px] font-medium tracking-normal transition-colors',
                isActive ? 'text-(--c-accent)' : 'text-(--c-on-surface-muted)'
              )
            }
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="truncate max-w-full px-1">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

function AppShellInner() {
  useTheme()
  const { language } = useAppStore()
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.language !== language) i18n.changeLanguage(language)
    document.documentElement.lang = language
  }, [language, i18n])

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--c-surface)' }}>
      <TopBar />
      <MobileTopBar />
      <main className="flex-1 overflow-hidden min-h-0 pb-14 md:pb-0">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  )
}

export function AppShell() {
  return (
    <SettingsProvider>
      <AppShellInner />
    </SettingsProvider>
  )
}
