import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useActiveProfile } from '../hooks/useActiveProfile'
import { db, getSettings } from '../db'
import { analyzeJobFit, adaptCVToJob, generateCoverLetter, extractJobInfo } from '../services/gemini'
import { fetchJobDescription } from '../services/jobScraper'
import { generateId } from '../lib/utils'
import { computeChangeLog } from '../lib/diff'
import { parseGeminiError } from '../lib/errors'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/Textarea'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Card, CardContent } from '../components/ui/Card'
import { Skeleton } from '../components/ui/skeleton'
import { useCvPanel } from '../contexts/CvPanelContext'

import { AtsScoreMeter } from '../components/apply/AtsScoreMeter'
import { KeywordChipGroup } from '../components/apply/KeywordChipGroup'
import { DiagnosticCard } from '../components/apply/DiagnosticCard'
import { ChangeLogPanel } from '../components/apply/ChangeLogPanel'
import type { BaseCV, JobApplication, FitAnalysis, EnhancedExperience, ChangeEntry } from '../types'

type ApplyStep = 'input' | 'analysis' | 'edit' | 'preview'

type PreviewVariant = 'adapted' | 'original'

interface DraftApp {
  jobTitle: string
  company: string
  adaptedSummary: string
  adaptedExperience: EnhancedExperience[]
  changeLog: ChangeEntry[]
  coverLetter: string
  language: 'fr' | 'en'
  createdAt: number
}

const STEP_LABELS: Record<ApplyStep, string> = {
  input: 'Saisie',
  analysis: 'Analyse',
  edit: 'Adapter',
  preview: 'Aperçu',
}

const STEP_ORDER: readonly ApplyStep[] = ['input', 'analysis', 'edit', 'preview'] as const

export function ApplyPage() {
  const { profile, id: profileId } = useActiveProfile()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setPanelCv, setBaseCv, setShowDiff } = useCvPanel()
  const [searchParams] = useSearchParams()
  const applicationIdParam = searchParams.get('application')

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

  const [step, setStep] = useState<ApplyStep>('input')
  const [jobUrl, setJobUrl] = useState('')
  const [jobText, setJobText] = useState('')
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [adapting, setAdapting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fitAnalysis, setFitAnalysis] = useState<FitAnalysis | null>(null)
  const [draftApp, setDraftApp] = useState<DraftApp | null>(null)
  const [editedSummary, setEditedSummary] = useState('')
  const [editedExperience, setEditedExperience] = useState<EnhancedExperience[]>([])
  const [application, setApplication] = useState<JobApplication | null>(null)
  const [previewVariant, setPreviewVariant] = useState<PreviewVariant>('adapted')
  const [coverVisible, setCoverVisible] = useState(false)

  // Load existing application from ?application=<id> on mount.
  const seededIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!applicationIdParam) return
    if (seededIdRef.current === applicationIdParam) return
    seededIdRef.current = applicationIdParam
    let cancelled = false
    void (async () => {
      try {
        const existing = await db.applications.get(applicationIdParam)
        if (cancelled) return
        if (!existing) {
          toast.error(t('apply.applicationNotFound'))
          return
        }
        setJobUrl(existing.jobUrl)
        setJobText(existing.jobDescription)
        setFitAnalysis(existing.fitAnalysis)
        setEditedSummary(existing.adaptedSummary)
        setEditedExperience(existing.adaptedExperience)
        setApplication(existing)
        setDraftApp({
          jobTitle: existing.jobTitle,
          company: existing.company,
          adaptedSummary: existing.adaptedSummary,
          adaptedExperience: existing.adaptedExperience,
          changeLog: existing.changeLog,
          coverLetter: existing.coverLetter,
          language: 'fr',
          createdAt: existing.createdAt,
        })
        setStep('preview')
        setPreviewVariant('adapted')
      } catch (err) {
        if (!cancelled) toast.error(parseGeminiError(err))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [applicationIdParam, t])

  // Push CV to the panel based on current step
  useEffect(() => {
    if (step === 'edit' && draftApp && baseCV) {
      setPanelCv({
        id: 'draft',
        profileId: profileId ?? 'me',
        baseCvId: baseCV.id,
        jobUrl,
        jobDescription: jobText,
        jobTitle: draftApp.jobTitle,
        company: draftApp.company,
        fitAnalysis,
        adaptedSummary: editedSummary,
        adaptedExperience: editedExperience,
        changeLog: draftApp.changeLog,
        coverLetter: draftApp.coverLetter,
        templateId: baseCV.templateId,
        status: 'saved',
        createdAt: draftApp.createdAt,
        appliedAt: null,
      })
      setBaseCv(baseCV)
      setShowDiff(true)
    } else if (step === 'preview' && application) {
      setPanelCv(previewVariant === 'adapted' ? application : (baseCV ?? null))
      setBaseCv(null)
      setShowDiff(false)
    } else {
      setPanelCv(null)
      setBaseCv(null)
      setShowDiff(false)
    }
    return () => {
      setPanelCv(null)
      setBaseCv(null)
      setShowDiff(false)
    }
  }, [step, application, previewVariant, draftApp, editedSummary, editedExperience, baseCV, profileId, jobUrl, jobText, fitAnalysis, setPanelCv, setBaseCv, setShowDiff])

  if (!profile || !profileId) {
    return <div className="p-8 text-sm text-(--c-on-surface-muted)">{t('common.loading')}</div>
  }

  async function fetchFromUrl() {
    if (!jobUrl.trim()) return
    setLoadingUrl(true)
    const text = await fetchJobDescription(jobUrl)
    if (text) {
      setJobText(text.slice(0, 5000))
    } else {
      toast.error(t('apply.fetchError'))
    }
    setLoadingUrl(false)
  }

  async function analyze() {
    if (!jobText.trim()) {
      toast.error(t('apply.pasteHint'))
      return
    }
    setAnalyzing(true)
    try {
      const settings = await getSettings()
      if (!settings.geminiApiKey) {
        toast.error(t('apply.noApiKey'))
        return
      }
      const fit = await analyzeJobFit(settings.geminiApiKey, profile!, jobText)
      setFitAnalysis(fit)
      setStep('analysis')
    } catch (err) {
      toast.error(parseGeminiError(err))
    } finally {
      setAnalyzing(false)
    }
  }

  async function adapt() {
    if (!baseCV) {
      toast.error(t('apply.needBaseCv'))
      return
    }
    setAdapting(true)
    try {
      const settings = await getSettings()
      const jobInfo = await extractJobInfo(settings.geminiApiKey, jobText)
      const [adapted, letter] = await Promise.all([
        adaptCVToJob(settings.geminiApiKey, profile!, baseCV, jobText, jobInfo.language),
        generateCoverLetter(settings.geminiApiKey, profile!, jobText, jobInfo.title, jobInfo.company, jobInfo.language),
      ])
      const changeLog = computeChangeLog(baseCV, adapted, profile)
      const draft: DraftApp = {
        jobTitle: jobInfo.title,
        company: jobInfo.company,
        adaptedSummary: adapted.adaptedSummary,
        adaptedExperience: adapted.adaptedExperience,
        changeLog,
        coverLetter: letter,
        language: jobInfo.language,
        createdAt: Date.now(),
      }
      setDraftApp(draft)
      setEditedSummary(adapted.adaptedSummary)
      setEditedExperience(adapted.adaptedExperience)
      setStep('edit')
    } catch (err) {
      toast.error(t('apply.aiFailure', { defaultValue: "L'IA n'a pas pu compléter — réessayez." }))
      // also surface technical detail through console-free path: keep parseGeminiError as a secondary toast
      toast.error(parseGeminiError(err))
    } finally {
      setAdapting(false)
    }
  }

  async function saveApplication() {
    if (!draftApp || !baseCV) return
    setSaving(true)
    try {
      const currentSettings = await db.settings.get('singleton')
      const existingId = applicationIdParam ?? application?.id ?? null
      const app: JobApplication = {
        id: existingId ?? generateId(),
        profileId: profileId!,
        baseCvId: baseCV.id,
        jobUrl,
        jobDescription: jobText,
        jobTitle: draftApp.jobTitle,
        company: draftApp.company,
        fitAnalysis,
        adaptedSummary: editedSummary,
        adaptedExperience: editedExperience,
        changeLog: draftApp.changeLog,
        coverLetter: draftApp.coverLetter,
        templateId: currentSettings?.defaultTemplateId ?? 'ats-clean',
        status: 'saved',
        createdAt: draftApp.createdAt,
        appliedAt: null,
      }
      await db.applications.put(app)
      setApplication(app)
      setPreviewVariant('adapted')
      setStep('preview')
      toast.success('Candidature enregistrée')
    } catch (err) {
      const msg =
        err instanceof Error && err.name && err.name !== 'Error'
          ? t('apply.saveError', { name: err.name })
          : parseGeminiError(err)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  function isStepEnabled(next: ApplyStep): boolean {
    if (next === 'input') return true
    if (next === 'analysis') return !!fitAnalysis
    if (next === 'edit') return !!draftApp
    return !!application
  }

  function handleStepChange(value: string) {
    const next = value as ApplyStep
    if (!isStepEnabled(next)) return
    setStep(next)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-(--c-surface-bright)">
      {/* Header strip */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-(--c-outline)">
        <div>
          <h1 className="ks-section text-(--c-on-surface)">{t('apply.headerTitle')}</h1>
          <p className="ks-caption mt-0.5">{t('apply.headerSubtitle')}</p>
        </div>
        {step === 'preview' && application && (
          <Badge variant="success">{t('apply.savedBadge')}</Badge>
        )}
      </header>

      {/* Step pipeline as Tabs */}
      <Tabs
        value={step}
        onValueChange={handleStepChange}
        className="flex-1 min-h-0 px-4 pt-4 no-print flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-4">
          {STEP_ORDER.map((s, idx) => (
            <TabsTrigger
              key={s}
              value={s}
              disabled={!isStepEnabled(s)}
              aria-current={step === s ? 'step' : undefined}
            >
              <span aria-hidden className="opacity-70 mr-1">
                {idx + 1}.
              </span>
              {STEP_LABELS[s]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
          {!hasApiKey && (
            <>
              <ApiKeyAlert onOpenSettings={() => navigate('/settings')} />
              <p className="text-xs text-(--c-on-surface-muted) -mt-2">
                💡 Vous pouvez quand même coller le texte de l'offre ci-dessous — l'analyse IA se déclenchera dès que la clé sera configurée.
              </p>
            </>
          )}

          <TabsContent value="input">
            <InputStep
              jobUrl={jobUrl}
              onJobUrlChange={setJobUrl}
              jobText={jobText}
              onJobTextChange={setJobText}
              loadingUrl={loadingUrl}
              onFetch={fetchFromUrl}
              hasBaseCV={!!baseCV}
              hasApiKey={hasApiKey}
              t={t}
            />
            {analyzing && <AnalysisSkeleton />}
          </TabsContent>

          <TabsContent value="analysis">
            {fitAnalysis && (
              <AnalysisStep
                fitAnalysis={fitAnalysis}
                jobTitle={draftApp?.jobTitle}
                company={draftApp?.company}
                hasBaseCV={!!baseCV}
              />
            )}
          </TabsContent>

          <TabsContent value="edit">
            {draftApp && (
              <EditStep
                draftApp={draftApp}
                editedSummary={editedSummary}
                onSummaryChange={setEditedSummary}
                editedExperience={editedExperience}
                onExperienceChange={setEditedExperience}
              />
            )}
          </TabsContent>

          <TabsContent value="preview">
            {application && (
              <PreviewStep
                application={application}
                previewVariant={previewVariant}
                onVariantChange={setPreviewVariant}
                coverVisible={coverVisible}
                onToggleCover={() => setCoverVisible((v) => !v)}
                t={t}
              />
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Sticky CTA */}
      <StickyCta
        step={step}
        analyzing={analyzing}
        adapting={adapting}
        saving={saving}
        canAnalyze={!!jobText.trim() && hasApiKey}
        canAdapt={!!fitAnalysis}
        canSave={!!draftApp}
        onAnalyze={analyze}
        onAdapt={adapt}
        onSave={saveApplication}
        onPrint={() => window.print()}
        t={t}
      />
    </div>
  )
}

/* ──────────────────────── Sub-blocks ──────────────────────── */

function AnalysisSkeleton() {
  return (
    <div
      className="mt-4 flex flex-col gap-3 border border-dashed border-(--c-outline) bg-(--c-surface-bright) p-4 rounded-lg"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="ks-caption text-(--c-on-surface-muted)">
        Analyse en cours — Kosove lit l'offre et la compare à votre profil…
      </p>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

interface ApiKeyAlertProps {
  onOpenSettings: () => void
}

function ApiKeyAlert({ onOpenSettings }: ApiKeyAlertProps) {
  const { t } = useTranslation()
  return (
    <Alert variant="default" className="no-print">
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 18, color: 'var(--c-accent)' }}
        aria-hidden
      >
        key
      </span>
      <AlertTitle>{t('apply.apiKey.title')}</AlertTitle>
      <AlertDescription>
        <p>{t('apply.apiKey.body')}</p>
        <Button size="sm" onClick={onOpenSettings} className="mt-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 14 }}
            aria-hidden
          >
            settings
          </span>
          {t('apply.apiKey.openSettings')}
        </Button>
      </AlertDescription>
    </Alert>
  )
}

interface InputStepProps {
  jobUrl: string
  onJobUrlChange: (v: string) => void
  jobText: string
  onJobTextChange: (v: string) => void
  loadingUrl: boolean
  onFetch: () => void
  hasBaseCV: boolean
  hasApiKey: boolean
  t: (key: string) => string
}

function InputStep({
  jobUrl,
  onJobUrlChange,
  jobText,
  onJobTextChange,
  loadingUrl,
  onFetch,
  hasBaseCV,
  hasApiKey,
  t,
}: InputStepProps) {
  return (
    <div className="flex flex-col gap-4">
      {!hasBaseCV && (
        <Alert>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 16, color: 'var(--c-on-surface-muted)' }}
            aria-hidden
          >
            info
          </span>
          <AlertDescription>
            {t('apply.baseCvNeededHint')}{' '}
            <Link to="/cv" className="underline text-(--c-accent)">
              {t('apply.baseCvLink')}
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      {!hasApiKey && (
        <p className="text-xs text-(--c-on-surface-muted)">
          Vous pouvez coller le texte de l’offre maintenant — la clé API est requise pour
          déclencher l’analyse.
        </p>
      )}

      <section className="flex flex-col gap-2">
        <label className="ks-section">{t('apply.jobUrl')}</label>
        <div className="flex gap-2">
          <Input
            value={jobUrl}
            onChange={(e) => onJobUrlChange(e.target.value)}
            placeholder={t('apply.urlPlaceholder')}
            className="flex-1"
          />
          <Button variant="secondary" onClick={onFetch} loading={loadingUrl}>
            {t('apply.fetch')}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <label className="ks-section">{t('apply.orPaste')}</label>
        <Textarea
          value={jobText}
          onChange={(e) => onJobTextChange(e.target.value)}
          rows={12}
          placeholder={t('apply.pasteHint')}
        />
      </section>
    </div>
  )
}

interface AnalysisStepProps {
  fitAnalysis: FitAnalysis
  jobTitle?: string
  company?: string
  hasBaseCV: boolean
}

function AnalysisStep({ fitAnalysis, jobTitle, company, hasBaseCV }: AnalysisStepProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-5">
      <AtsScoreMeter
        score={fitAnalysis.score}
        size="lg"
        jobTitle={jobTitle}
        company={company}
      />
      {!hasBaseCV && (
        <Alert>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 16, color: 'var(--c-on-surface-muted)' }}
            aria-hidden
          >
            info
          </span>
          <AlertDescription>
            {t('apply.adaptCvHint')}{' '}
            <Link to="/cv" className="underline text-(--c-accent)">
              {t('apply.baseCvLink')}
            </Link>{' '}
            {t('apply.adaptCvHintSuffix')}
          </AlertDescription>
        </Alert>
      )}
      <DiagnosticCard summary={fitAnalysis.summary} />
      <KeywordChipGroup
        label={t('apply.matchedKeywords')}
        keywords={fitAnalysis.matchedKeywords}
        tone="matched"
      />
      <KeywordChipGroup
        label={t('apply.missingKeywords')}
        keywords={fitAnalysis.missingKeywords}
        tone="missing"
      />
    </div>
  )
}

interface EditStepProps {
  draftApp: DraftApp
  editedSummary: string
  onSummaryChange: (v: string) => void
  editedExperience: EnhancedExperience[]
  onExperienceChange: (updated: EnhancedExperience[]) => void
}

function EditStep({
  draftApp,
  editedSummary,
  onSummaryChange,
  editedExperience,
  onExperienceChange,
}: EditStepProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-4">
      <Card className="ring-(--c-outline) bg-(--c-surface-container)">
        <CardContent>
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-(--c-accent)"
              style={{ fontSize: 20 }}
              aria-hidden
            >
              edit_document
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-(--c-on-surface)">
                {draftApp.jobTitle || t('apply.jobOfferFallback')}
              </p>
              <p className="text-xs truncate text-(--c-on-surface-muted)">
                {draftApp.company || t('apply.companyFallback')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChangeLogPanel
        changeLog={draftApp.changeLog}
        editedSummary={editedSummary}
        onSummaryChange={onSummaryChange}
        editedExperience={editedExperience}
        onExperienceChange={onExperienceChange}
      />
    </div>
  )
}

interface PreviewStepProps {
  application: JobApplication
  previewVariant: PreviewVariant
  onVariantChange: (v: PreviewVariant) => void
  coverVisible: boolean
  onToggleCover: () => void
  t: (key: string) => string
}

function PreviewStep({
  application,
  previewVariant,
  onVariantChange,
  coverVisible,
  onToggleCover,
  t,
}: PreviewStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="ring-(--c-outline) bg-(--c-surface-container)">
        <CardContent>
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-(--c-success)"
              style={{ fontSize: 20 }}
              aria-hidden
            >
              check_circle
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-(--c-on-surface)">
                {application.jobTitle}
              </p>
              <p className="text-xs truncate text-(--c-on-surface-muted)">
                {application.company}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <VariantTabs variant={previewVariant} onChange={onVariantChange} />

      <section className="flex flex-col">
        <Button
          type="button"
          variant="outline"
          onClick={onToggleCover}
          aria-expanded={coverVisible}
          className="w-full justify-between"
        >
          <span>{t('apply.coverLetterTab')}</span>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 18,
              transform: coverVisible ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms ease-out',
            }}
            aria-hidden
          >
            expand_more
          </span>
        </Button>
        {coverVisible && (
          <pre
            className="whitespace-pre-wrap text-sm leading-relaxed font-sans p-3 border border-t-0 border-(--c-outline) bg-(--c-surface-bright) text-(--c-on-surface) rounded-b-lg"
          >
            {application.coverLetter}
          </pre>
        )}
      </section>
    </div>
  )
}

interface VariantTabsProps {
  variant: PreviewVariant
  onChange: (v: PreviewVariant) => void
}

function VariantTabs({ variant, onChange }: VariantTabsProps) {
  const { t } = useTranslation()
  return (
    <Tabs value={variant} onValueChange={(v) => onChange(v as PreviewVariant)}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="original">{t('apply.variantOriginal')}</TabsTrigger>
        <TabsTrigger value="adapted">{t('apply.variantAdapted')}</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

interface StickyCtaProps {
  step: ApplyStep
  analyzing: boolean
  adapting: boolean
  saving: boolean
  canAnalyze: boolean
  canAdapt: boolean
  canSave: boolean
  onAnalyze: () => void
  onAdapt: () => void
  onSave: () => void
  onPrint: () => void
  t: (key: string) => string
}

function StickyCta({
  step,
  analyzing,
  adapting,
  saving,
  canAnalyze,
  canAdapt,
  canSave,
  onAnalyze,
  onAdapt,
  onSave,
  onPrint,
  t,
}: StickyCtaProps) {
  let label = ''
  let action: (() => void) | null = null
  let loading = false
  let disabled = false

  if (step === 'input') {
    label = analyzing ? t('apply.analyzing') : t('apply.analyze')
    action = onAnalyze
    loading = analyzing
    disabled = !canAnalyze
  } else if (step === 'analysis') {
    label = adapting ? t('apply.adapting') : t('apply.adapt')
    action = onAdapt
    loading = adapting
    disabled = !canAdapt
  } else if (step === 'edit') {
    label = saving ? t('apply.saving') : t('apply.saveAction')
    action = onSave
    loading = saving
    disabled = !canSave
  } else if (step === 'preview') {
    label = t('apply.exportPDF')
    action = onPrint
  }

  if (!action) return null

  return (
    <div className="border-t border-(--c-outline) px-4 py-3 no-print shrink-0 bg-(--c-surface-bright)">
      <Button
        type="button"
        onClick={action}
        disabled={disabled}
        loading={loading}
        className="w-full"
      >
        {label}
      </Button>
    </div>
  )
}
