import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useActiveProfile } from '../hooks/useActiveProfile'
import { db, getSettings } from '../db'
import { generateBaseCV } from '../services/gemini'
import { hashProfile, generateId } from '../lib/utils'
import { parseGeminiError } from '../lib/errors'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group'
import { useCvPanel } from '../contexts/CvPanelContext'
import type { BaseCV } from '../types'

export function BaseCvPage() {
  const { profile, id: profileId } = useActiveProfile()
  const { t } = useTranslation()
  const { setPanelCv } = useCvPanel()
  const navigate = useNavigate()
  const baseCV = useLiveQuery<BaseCV | null>(
    async () => {
      if (!profileId) return null
      const rows = await db.baseCvs.where('profileId').equals(profileId).reverse().sortBy('generatedAt')
      return rows[0] ?? null
    },
    [profileId]
  )
  const appSettings = useLiveQuery(() => db.settings.get('singleton'))
  const hasApiKey = !!appSettings?.geminiApiKey

  const [generating, setGenerating] = useState(false)
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')

  // Push the generated CV to the panel when it changes
  useEffect(() => {
    setPanelCv(baseCV ?? null)
    return () => setPanelCv(null)
  }, [baseCV, setPanelCv])

  if (!profile || !profileId) {
    return <div className="p-8 text-(--c-on-surface-muted)">{t('common.loading')}</div>
  }

  const profileHash = hashProfile(profile)
  const isStale = baseCV && baseCV.profileHash !== profileHash

  const profileComplete =
    profile.personal.name && profile.personal.email && profile.personal.summary

  async function generate() {
    setGenerating(true)
    try {
      const settings = await getSettings()
      if (!settings.geminiApiKey) {
        toast.error(t('baseCV.noApiKey'))
        return
      }
      const data = await generateBaseCV(settings.geminiApiKey, profile!, language, profileHash)
      const cv: BaseCV = { kind: 'base', ...data, id: generateId(), templateId: 'ats-clean' }
      await db.baseCvs.put(cv)
      toast.success('CV de base généré')
      navigate('/apply', { replace: true })
    } catch (err) {
      toast.error(parseGeminiError(err))
    } finally {
      setGenerating(false)
    }
  }

  async function approve() {
    if (!baseCV) return
    await db.baseCvs.update(baseCV.id, { approvedAt: Date.now() })
    toast.success('CV approuvé')
  }

  async function exportPdf() {
    const el = document.querySelector<HTMLElement>('.print-cv')
    if (!el) {
      window.print()
      return
    }
    try {
      const { exportElementAsPdf } = await import('../lib/exportPdf')
      const name = profile!.personal.name?.trim().replace(/\s+/g, '_') || 'CV'
      await exportElementAsPdf(el, `${name}.pdf`)
      toast.success('PDF exporté')
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'export PDF."
      toast.error(msg)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-(--c-surface)">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 mb-8 no-print flex-wrap">
        <div>
          <h1 className="ks-display">{t('baseCV.title')}</h1>
          <p className="ks-body-sm mt-1">{t('baseCV.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {isStale && <Badge variant="warning">{t('baseCV.staleWarning')}</Badge>}
          {baseCV?.approvedAt && <Badge variant="success">{t('baseCV.approved')}</Badge>}

          <ToggleGroup
            type="single"
            variant="outline"
            value={language}
            onValueChange={(v) => {
              if (v === 'fr' || v === 'en') setLanguage(v)
            }}
            aria-label="Langue du CV"
          >
            <ToggleGroupItem value="fr">{t('baseCV.french')}</ToggleGroupItem>
            <ToggleGroupItem value="en">{t('baseCV.english')}</ToggleGroupItem>
          </ToggleGroup>

          <Button onClick={generate} loading={generating} disabled={!hasApiKey}>
            {baseCV ? t('baseCV.regenerate') : t('baseCV.generate')}
          </Button>
          {baseCV && !baseCV.approvedAt && (
            <Button variant="secondary" onClick={approve}>
              {t('baseCV.approve')}
            </Button>
          )}
          {baseCV && (
            <Button variant="secondary" onClick={exportPdf}>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              {t('baseCV.exportPDF')}
            </Button>
          )}
        </div>
      </header>

      {/* No API key alert */}
      {!hasApiKey && (
        <Alert className="mb-6 no-print">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 18, color: 'var(--c-warning)' }}
            aria-hidden
          >
            key
          </span>
          <AlertTitle>{t('baseCV.noApiKey')}</AlertTitle>
          <AlertDescription>
            La génération par Gemini nécessite une clé API.{' '}
            <Link to="/settings" className="underline">
              Configurer dans les paramètres →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Generating spinner */}
      {generating && (
        <Card className="text-center py-20 no-print ring-(--c-outline)">
          <CardContent>
            <div className="animate-spin w-10 h-10 border-2 border-(--c-accent) border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm font-medium text-(--c-on-surface-muted)">
              {t('baseCV.generating')}
            </p>
            <p className="text-xs mt-1 text-(--c-on-surface-muted)">
              Gemini améliore votre contenu pour l'ATS…
            </p>
          </CardContent>
        </Card>
      )}

      {/* CV exists — summary card */}
      {baseCV && !generating && (
        <Card className="no-print ring-(--c-outline)">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-(--c-success)/15 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-(--c-success)"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-(--c-on-surface)">
                  {baseCV.approvedAt ? t('baseCV.approved') : t('baseCV.title')} ·{' '}
                  {new Date(baseCV.generatedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-(--c-on-surface-muted) mt-0.5">
                  Aperçu visible dans le panneau de droite
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state — guide */}
      {!baseCV && !generating && (
        <div className="grid md:grid-cols-2 gap-6 no-print">
          <Card className="ring-(--c-outline)">
            <CardContent>
              <p className="ks-section mb-4">Comment ça marche</p>
              <ol className="space-y-4">
                {[
                  {
                    step: '1',
                    text: 'Complétez votre profil',
                    sub: 'Informations personnelles, expériences, compétences',
                    done: !!profileComplete,
                  },
                  {
                    step: '2',
                    text: 'Cliquez sur "Générer le CV"',
                    sub: "Gemini optimise votre contenu pour l'ATS",
                    done: false,
                  },
                  {
                    step: '3',
                    text: 'Approuvez votre CV de base',
                    sub: 'Il servira de base pour toutes vos candidatures',
                    done: false,
                  },
                  {
                    step: '4',
                    text: 'Postulez aux offres',
                    sub: 'Gemini adapte votre CV pour chaque poste',
                    done: false,
                  },
                ].map(({ step, text, sub, done }) => (
                  <li key={step} className="flex items-start gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        done
                          ? 'bg-(--c-success) text-white'
                          : 'bg-(--c-surface-container) text-(--c-on-surface-muted)'
                      }`}
                    >
                      {done ? '✓' : step}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-(--c-on-surface)">{text}</p>
                      <p className="text-xs text-(--c-on-surface-muted)">{sub}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="ring-(--c-outline) flex flex-col">
            <CardContent className="flex flex-col flex-1 gap-4">
              <div>
                <p className="ks-section mb-4">Statut du profil</p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Nom complet', done: !!profile.personal.name },
                    { label: 'Email', done: !!profile.personal.email },
                    { label: 'Ville', done: !!profile.personal.city },
                    { label: 'Résumé professionnel', done: !!profile.personal.summary },
                    { label: 'Expériences', done: profile.experience.length > 0 },
                    { label: 'Formation', done: profile.education.length > 0 },
                    { label: 'Compétences', done: profile.skills.length > 0 },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          done ? 'bg-(--c-success)' : 'bg-(--c-surface-container)'
                        }`}
                      >
                        {done && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          done ? 'text-(--c-on-surface)' : 'text-(--c-on-surface-muted)'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-(--c-outline)">
                {!profileComplete && (
                  <p className="text-xs text-(--c-warning) mb-3">
                    {t('baseCV.noProfileWarning')}
                  </p>
                )}
                {!hasApiKey ? (
                  <Button asChild variant="default" className="w-full">
                    <Link to="/settings">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16 }}
                        aria-hidden
                      >
                        settings
                      </span>
                      Configurer la clé API
                    </Link>
                  </Button>
                ) : (
                  <Button onClick={generate} loading={generating} className="w-full">
                    {t('baseCV.generate')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
