import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useActiveProfile } from '../hooks/useActiveProfile'
import { db } from '../db'
import type { BaseCV } from '../types'
import { useCvPanel } from '../contexts/CvPanelContext'
import { FilterPills } from '../components/applications/FilterPills'
import type { StatusFilter } from '../components/applications/filters'
import { ApplicationsTable } from '../components/applications/ApplicationsTable'
import { ApplicationCard } from '../components/applications/ApplicationCard'
import { InspectorRail } from '../components/applications/InspectorRail'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import type { JobApplication } from '../types'

const SEARCH_PLACEHOLDER = 'Rechercher une candidature, une entreprise, un poste...'
const ONBOARDING_DISMISSED_KEY = 'kosovo:onboarding-dismissed'

function emptyCounts(): Record<StatusFilter, number> {
  return { all: 0, saved: 0, applied: 0, interview: 0, offer: 0, rejected: 0 }
}

function buildCounts(apps: JobApplication[]): Record<StatusFilter, number> {
  const counts = emptyCounts()
  counts.all = apps.length
  apps.forEach((a) => {
    counts[a.status] = (counts[a.status] ?? 0) + 1
  })
  return counts
}

function matchesSearch(app: JobApplication, query: string): boolean {
  if (!query) return true
  const haystack = `${app.company} ${app.jobTitle}`.toLowerCase()
  return haystack.includes(query.toLowerCase())
}

export function ApplicationsPage() {
  const { profile, id: profileId } = useActiveProfile()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setPanelCv } = useCvPanel()

  const baseCV = useLiveQuery<BaseCV | null | undefined>(
    async () => {
      if (!profileId) return undefined
      const rows = await db.baseCvs.where('profileId').equals(profileId).reverse().sortBy('generatedAt')
      return rows[0] ?? null
    },
    [profileId]
  )

  const applications = useLiveQuery(
    () =>
      profileId
        ? db.applications.where('profileId').equals(profileId).reverse().sortBy('createdAt')
        : Promise.resolve([] as JobApplication[]),
    [profileId]
  )

  const [filter, setFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<JobApplication | null>(null)
  const [onboardingDismissed, setOnboardingDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    setPanelCv(selected)
    return () => setPanelCv(null)
  }, [selected, setPanelCv])

  const list = useMemo<JobApplication[]>(() => applications ?? [], [applications])

  const counts = useMemo(() => buildCounts(list), [list])
  const filtered = useMemo(() => {
    return list.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false
      return matchesSearch(a, query)
    })
  }, [list, filter, query])

  function handleEdit(app: JobApplication) {
    navigate(`/apply?application=${encodeURIComponent(app.id)}`)
  }

  async function handleDelete(id: string) {
    if (!confirm(t('common.confirm') + ' ?')) return
    await db.applications.delete(id)
    if (selected?.id === id) setSelected(null)
  }

  function toggleSelect(app: JobApplication) {
    setSelected((prev) => (prev?.id === app.id ? null : app))
  }

  if (!profile || !profileId) {
    return <div className="p-8 text-(--c-on-surface-muted)">{t('common.loading')}</div>
  }

  // Show onboarding when base CV query resolved (not undefined) and no CV found,
  // and the user hasn't dismissed it yet.
  const showOnboarding = baseCV === null && !onboardingDismissed

  function dismissOnboarding() {
    try {
      localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1')
    } catch {
      // localStorage may be unavailable (private mode); ignore.
    }
    setOnboardingDismissed(true)
  }

  const heading = t('nav.applications', { defaultValue: 'Candidatures' })

  return (
    <div className="h-full overflow-y-auto bg-(--c-surface)">
      {showOnboarding && (
        <OnboardingModal
          onBuild={() => {
            dismissOnboarding()
            navigate('/edit')
          }}
          onDismiss={dismissOnboarding}
        />
      )}
      <div className="flex flex-col xl:flex-row gap-6 p-4 md:p-6 xl:p-8">
        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Heading */}
          <header className="flex flex-col gap-1">
            <h1 className="ks-display">{heading}</h1>
            <p className="ks-caption">
              {list.length} candidatures
            </p>
          </header>

          {/* Filter pills */}
          <FilterPills active={filter} counts={counts} onChange={setFilter} />

          {/* Search */}
          <SearchField value={query} onChange={setQuery} />

          {/* Empty state — but show skeleton table while initial Dexie load is pending */}
          {applications === undefined ? (
            <div className="hidden md:block">
              <ApplicationsTable
                applications={[]}
                selectedId={null}
                onSelect={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                loading
              />
            </div>
          ) : filtered.length === 0 ? (
            <ApplicationsEmpty
              isFiltering={list.length > 0}
              onApply={() => navigate('/apply')}
              onBuildBaseCv={() => navigate('/edit')}
            />
          ) : (
            <>
              {/* Desktop dense table */}
              <div className="hidden md:block">
                <ApplicationsTable
                  applications={filtered}
                  selectedId={selected?.id ?? null}
                  onSelect={toggleSelect}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>

              {/* Mobile card list */}
              <div className="md:hidden flex flex-col gap-3">
                {filtered.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    isSelected={selected?.id === app.id}
                    onSelect={toggleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right rail (desktop only) */}
        {list.length > 0 && (
          <div className="hidden xl:block xl:w-[320px] xl:shrink-0">
            <InspectorRail applications={list} />
          </div>
        )}
      </div>
    </div>
  )
}

interface SearchFieldProps {
  value: string
  onChange: (v: string) => void
}

function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-(--c-on-surface-muted)"
          style={{ fontSize: 18 }}
        >
          search
        </span>
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={SEARCH_PLACEHOLDER}
        aria-label={SEARCH_PLACEHOLDER}
      />
      {/* Reference Input symbol so the import is not pruned for shared CSS expectations */}
      <span className="hidden">
        <Input aria-hidden="true" tabIndex={-1} />
      </span>
    </InputGroup>
  )
}

interface ApplicationsEmptyProps {
  isFiltering: boolean
  onApply: () => void
  onBuildBaseCv: () => void
}

function ApplicationsEmpty({ isFiltering, onApply, onBuildBaseCv }: ApplicationsEmptyProps) {
  const title = isFiltering
    ? 'Aucune candidature ne correspond.'
    : "Votre tableau est vierge — l'histoire commence ici."
  const description = isFiltering
    ? 'Modifiez les filtres ou la recherche pour voir d’autres résultats.'
    : 'Postulez à une offre pour ouvrir votre première candidature et suivre son cycle de vie.'

  return (
    <Empty className="border border-dashed border-(--c-outline) bg-(--c-surface-bright) py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 20 }}>
            {isFiltering ? 'filter_alt_off' : 'send'}
          </span>
        </EmptyMedia>
        <EmptyTitle className="text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
          {title}
        </EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {!isFiltering && (
        <>
          <p className="ks-caption max-w-md text-center px-4">
            💡 Astuce : collez l'URL d'une offre Rekrute, Indeed ou LinkedIn — Kosove récupère le titre et l'entreprise automatiquement.
          </p>
          <EmptyContent>
            <Button onClick={onApply} variant="default">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">
                send
              </span>
              Postuler à une offre
            </Button>
            <Button onClick={onBuildBaseCv} variant="ghost" size="sm">
              Construire d'abord mon CV de base
            </Button>
          </EmptyContent>
        </>
      )}
    </Empty>
  )
}
