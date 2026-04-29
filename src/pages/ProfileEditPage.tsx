import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useActiveProfile } from '../hooks/useActiveProfile'
import { db } from '../db'
import { sectionCompletion } from '../components/profile/completion'
import { PersonalTab } from '../components/profile/PersonalTab'
import { ExperienceTab } from '../components/profile/ExperienceTab'
import { EducationTab } from '../components/profile/EducationTab'
import { SkillsTab } from '../components/profile/SkillsTab'
import { LanguagesTab } from '../components/profile/LanguagesTab'
import { CertificationsTab } from '../components/profile/CertificationsTab'
import { AiContextTab } from '../components/profile/AiContextTab'
import { BaseCvBanner } from '../components/profile/BaseCvBanner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { EditorSection } from '../store'
import type { Profile } from '../types'

interface SectionDef {
  key: EditorSection
  label: string
  subtitle: string
}

const SECTIONS: SectionDef[] = [
  { key: 'personal',       label: 'Personnel',       subtitle: 'Coordonnées & résumé' },
  { key: 'experience',     label: 'Expérience',      subtitle: 'Analyse & affinage du contenu' },
  { key: 'education',      label: 'Formation',       subtitle: 'Diplômes & parcours' },
  { key: 'skills',         label: 'Compétences',     subtitle: 'Compétences & outils' },
  { key: 'languages',      label: 'Langues',         subtitle: 'Maîtrise linguistique' },
  { key: 'certifications', label: 'Certifications',  subtitle: 'Certifications & accréditations' },
  { key: 'aiContext',      label: 'Contexte IA',     subtitle: 'Contexte privé pour Gemini' },
]

export function ProfileEditPage() {
  const { profile, id: profileId } = useActiveProfile()
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  if (!profile || !profileId) {
    return (
      <div className="p-4 ks-body" style={{ color: 'var(--c-on-surface-muted)' }}>
        {t('common.loading')}
      </div>
    )
  }

  async function save(updates: Partial<Profile>) {
    setSaving(true)
    try {
      await db.profiles.update(profileId!, { ...updates, updatedAt: Date.now() })
      setSavedAt(Date.now())
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Échec de l'enregistrement."
      toast.error("Échec de l'enregistrement", { description: msg })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: 'var(--c-surface-bright)' }}
    >
      <header
        className="shrink-0 flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: 'var(--c-outline)' }}
      >
        <h1 className="ks-display">Profil</h1>
        <SaveIndicator saving={saving} savedAt={savedAt} />
      </header>

      <BaseCvBanner profile={profile} profileId={profileId} />

      <Tabs
        defaultValue="personal"
        orientation="vertical"
        className="flex-1 min-h-0 px-4 pt-3 pb-4 gap-4"
      >
        <TabsList variant="line" className="w-56 shrink-0 self-start flex-col h-fit p-0 bg-transparent items-stretch">
          {SECTIONS.map((sec) => {
            const completion = sectionCompletion(profile, sec.key)
            return (
              <TabsTrigger
                key={sec.key}
                value={sec.key}
                className="justify-between gap-3"
              >
                <span className="truncate">{sec.label}</span>
                <CompletionDot pct={completion} />
              </TabsTrigger>
            )
          })}
        </TabsList>

        <div className="flex-1 min-w-0 overflow-y-auto">
          {SECTIONS.map((sec) => {
            const completion = sectionCompletion(profile, sec.key)
            return (
              <TabsContent key={sec.key} value={sec.key} className="flex flex-col gap-4 pr-2">
                <SectionHeader sec={sec} completion={completion} />
                {sec.key === 'personal'       && <PersonalTab       profile={profile} onSave={save} />}
                {sec.key === 'experience'     && <ExperienceTab     profile={profile} onSave={save} />}
                {sec.key === 'education'      && <EducationTab      profile={profile} onSave={save} />}
                {sec.key === 'skills'         && <SkillsTab         profile={profile} onSave={save} />}
                {sec.key === 'languages'      && <LanguagesTab      profile={profile} onSave={save} />}
                {sec.key === 'certifications' && <CertificationsTab profile={profile} onSave={save} />}
                {sec.key === 'aiContext'      && <AiContextTab      profile={profile} onSave={save} />}
              </TabsContent>
            )
          })}
        </div>
      </Tabs>
    </div>
  )
}

interface SectionHeaderProps {
  sec: SectionDef
  completion: number
}

function SectionHeader({ sec, completion }: SectionHeaderProps) {
  const isComplete = completion >= 100
  const meterColor = isComplete ? 'var(--c-success)' : 'var(--c-accent)'
  return (
    <div className="flex flex-col gap-2 pb-2 border-b" style={{ borderColor: 'var(--c-outline)' }}>
      <div className="flex items-end justify-between gap-2">
        <h2 className="ks-section">{sec.label}</h2>
        <span
          className="ks-caption tabular-nums font-medium"
          style={{ color: isComplete ? 'var(--c-success)' : 'var(--c-on-surface-muted)' }}
        >
          {completion}%
        </span>
      </div>
      <p className="ks-caption">{sec.subtitle}</p>
      <div
        className="h-[2px] w-full rounded-full overflow-hidden"
        style={{ background: 'var(--c-surface-container-high)' }}
        role="progressbar"
        aria-valuenow={completion}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${completion}%`, background: meterColor }}
        />
      </div>
    </div>
  )
}

interface CompletionDotProps {
  pct: number
}

const RING_RADIUS = 5
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function CompletionDot({ pct }: CompletionDotProps) {
  const isComplete = pct >= 100
  const color = isComplete ? 'var(--c-success)' : 'var(--c-accent)'
  const dash = (pct / 100) * RING_CIRCUMFERENCE
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
      <circle cx="7" cy="7" r={RING_RADIUS} fill="none" strokeWidth="1.5" stroke="var(--c-outline)" />
      <circle
        cx="7"
        cy="7"
        r={RING_RADIUS}
        fill="none"
        strokeWidth="1.5"
        stroke={color}
        strokeDasharray={`${dash} ${RING_CIRCUMFERENCE}`}
        strokeLinecap="round"
        transform="rotate(-90 7 7)"
      />
    </svg>
  )
}

interface SaveIndicatorProps {
  saving: boolean
  savedAt: number | null
}

function SaveIndicator({ saving, savedAt }: SaveIndicatorProps) {
  const { t } = useTranslation()
  if (saving) {
    return (
      <span className="ks-caption flex items-center gap-1.5" aria-live="polite">
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse motion-reduce:animate-none"
          style={{ background: 'var(--c-accent)' }}
        />
        {t('profileEdit.saving')}
      </span>
    )
  }
  if (savedAt) {
    return (
      <span className="ks-caption flex items-center gap-1.5" aria-live="polite">
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{ fontSize: 14, color: 'var(--c-success)' }}
        >
          check
        </span>
        {t('profileEdit.saved')}
      </span>
    )
  }
  return <span className="ks-caption">Auto-sauvegarde</span>
}
