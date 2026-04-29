import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { toast } from 'sonner'
import { db, getSettings } from '../../db'
import { generateBaseCV } from '../../services/gemini'
import { hashProfile, generateId } from '../../lib/utils'
import { parseGeminiError } from '../../lib/errors'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { BaseCV, Profile } from '../../types'

interface BaseCvBannerProps {
  profile: Profile
  profileId: string
}

type CvLanguage = 'fr' | 'en'

export function BaseCvBanner({ profile, profileId }: BaseCvBannerProps) {
  const [generating, setGenerating] = useState(false)

  const baseCV = useLiveQuery<BaseCV | null>(
    async () => {
      const rows = await db.baseCvs
        .where('profileId')
        .equals(profileId)
        .reverse()
        .sortBy('generatedAt')
      return rows[0] ?? null
    },
    [profileId],
  )

  const appSettings = useLiveQuery(() => db.settings.get('singleton'))
  const hasApiKey = !!appSettings?.geminiApiKey
  const persistedLanguage = appSettings?.defaultLanguage as CvLanguage | undefined
  const [language, setLanguage] = useState<CvLanguage>(() => persistedLanguage ?? 'fr')

  const userOverrodeRef = useRef(false)
  const lastSyncedRef = useRef<string | null>(null)
  useEffect(() => {
    if (userOverrodeRef.current) return
    if (!persistedLanguage) return
    if (lastSyncedRef.current === persistedLanguage) return
    lastSyncedRef.current = persistedLanguage
    setLanguage(persistedLanguage)
  }, [persistedLanguage])

  const profileHash = hashProfile(profile)
  const isStale = baseCV != null && baseCV.profileHash !== profileHash

  async function generate() {
    setGenerating(true)
    try {
      const settings = await getSettings()
      if (!settings.geminiApiKey) {
        toast.error('Clé API Gemini manquante', { description: 'Ouvrez les paramètres pour la configurer.' })
        return
      }
      const data = await generateBaseCV(settings.geminiApiKey, profile, language, profileHash)
      const cv: BaseCV = { kind: 'base', ...data, id: generateId(), templateId: 'ats-clean' }
      await db.baseCvs.put(cv)
      toast.success('CV de base généré')
    } catch (err) {
      toast.error('Échec de la génération', { description: parseGeminiError(err) })
    } finally {
      setGenerating(false)
    }
  }

  function handleLanguageChange(lang: CvLanguage) {
    userOverrodeRef.current = true
    setLanguage(lang)
    db.settings.update('singleton', { defaultLanguage: lang }).catch(() => {
      // settings row may not exist yet; ignore silently
    })
  }

  return (
    <div className="px-4 pt-3 pb-1 shrink-0">
      <Alert className="flex items-center gap-3 py-2.5">
        <span
          className="material-symbols-outlined shrink-0"
          aria-hidden="true"
          style={{ fontSize: 18, color: 'var(--c-accent)', fontVariationSettings: "'FILL' 1" }}
        >
          magic_button
        </span>
        <div className="flex-1 min-w-0">
          <AlertTitle className="flex items-center gap-2 ks-label" style={{ color: 'var(--c-on-surface)' }}>
            <span>CV de base</span>
            <StatusBadge baseCV={baseCV} isStale={isStale} />
          </AlertTitle>
          <AlertDescription className="ks-caption">Mise à jour via extraction IA</AlertDescription>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ToggleGroup
            type="single"
            value={language}
            onValueChange={(v) => v && handleLanguageChange(v as CvLanguage)}
            size="sm"
            variant="outline"
            aria-label="Langue de génération"
          >
            <ToggleGroupItem value="fr" aria-label="Français">FR</ToggleGroupItem>
            <ToggleGroupItem value="en" aria-label="English">EN</ToggleGroupItem>
          </ToggleGroup>
          <Button
            type="button"
            size="sm"
            onClick={generate}
            disabled={!hasApiKey || generating}
            loading={generating}
          >
            {baseCV ? 'Régénérer' : 'Générer'}
          </Button>
        </div>
      </Alert>
    </div>
  )
}

interface StatusBadgeProps {
  baseCV: BaseCV | null | undefined
  isStale: boolean
}

function StatusBadge({ baseCV, isStale }: StatusBadgeProps) {
  if (baseCV == null) {
    return <Badge variant="secondary">Non généré</Badge>
  }
  if (isStale) {
    return <Badge variant="warning">Obsolète</Badge>
  }
  return <Badge variant="success">Généré</Badge>
}
