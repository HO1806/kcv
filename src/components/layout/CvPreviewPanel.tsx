import { memo, useRef, useEffect, useState, useCallback, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  LayoutTemplate,
  Languages,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  FileText,
} from 'lucide-react'
import type { Profile, BaseCV, JobApplication, TemplateId } from '../../types'
import { useCvPanel } from '../../contexts/CvPanelContext'
import { db } from '../../db'
import { useSettings } from '../../contexts/SettingsContext'
import { TEMPLATES, getTemplateMeta } from '../cv/templates/registry'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Button } from '../ui/button'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty'

interface Props {
  profile: Profile
  displayCv: BaseCV | JobApplication
}

/** A renderable CV with its templateId overridden by the active carousel pick. */
function withTemplate<T extends BaseCV | JobApplication>(cv: T, templateId: TemplateId): T {
  return cv.templateId === templateId ? cv : { ...cv, templateId }
}

const NATURAL_WIDTH = 794
const A4_HEIGHT = 1123  // px at 96 dpi


// Lazy template components, keyed by id. Initial bundle stays small.
const LAZY = {
  'ats-clean': lazy(() => import('../cv/templates/AtsClean').then(m => ({ default: m.AtsClean }))),
  'bronzor':   lazy(() => import('../cv/templates/Bronzor').then(m => ({ default: m.Bronzor }))),
  'onyx':      lazy(() => import('../cv/templates/Onyx').then(m => ({ default: m.Onyx }))),
  'pikachu':   lazy(() => import('../cv/templates/Pikachu').then(m => ({ default: m.Pikachu }))),
  'azurill':   lazy(() => import('../cv/templates/Azurill').then(m => ({ default: m.Azurill }))),
  'leafish':   lazy(() => import('../cv/templates/Leafish').then(m => ({ default: m.Leafish }))),
} as const

function TemplateRenderer({ templateId, profile, cv, baseCv, showDiff }: {
  templateId: TemplateId
  profile: Profile
  cv: BaseCV | JobApplication
  baseCv?: BaseCV | null
  showDiff?: boolean
}) {
  // Only ats-clean supports diff highlighting today; the other templates
  // accept the standard CVData props only.
  if (templateId === 'ats-clean') {
    const Component = LAZY['ats-clean']
    return <Component profile={profile} cv={cv} baseCv={baseCv ?? null} showDiff={!!showDiff} />
  }
  const Component = LAZY[templateId as keyof typeof LAZY] ?? LAZY['ats-clean']
  return <Component profile={profile} cv={cv} />
}

const ScaledCv = memo(function ScaledCv({ profile, cv, templateId, baseCv, showDiff }: {
  profile: Profile
  cv: BaseCV | JobApplication
  templateId: TemplateId
  baseCv?: BaseCV | null
  showDiff?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [fitScale, setFitScale] = useState(1)
  const [innerHeight, setInnerHeight] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return

    const ro = new ResizeObserver(() => {
      const availableWidth = container.getBoundingClientRect().width
      const s = availableWidth / NATURAL_WIDTH
      const h = inner.getBoundingClientRect().height
      setFitScale(s)
      setInnerHeight(h)
    })
    ro.observe(container)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [])

  void innerHeight
  const scale = fitScale
  const containerHeight = A4_HEIGHT * fitScale || 'auto'

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        overflow: 'hidden',
        height: containerHeight,
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: NATURAL_WIDTH,
          height: A4_HEIGHT,
          overflow: 'hidden',
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
        }}
      >
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontFamily: 'sans-serif' }}>Chargement…</div>}>
          <TemplateRenderer templateId={templateId} profile={profile} cv={cv} baseCv={baseCv} showDiff={showDiff} />
        </Suspense>
      </div>
    </div>
  )
})

/** Mounts inside Suspense; runs the given action after the template renders, then calls onDone. */
function DeferredAction({ action, onDone }: { action: () => void | Promise<void>; onDone: () => void }) {
  useEffect(() => {
    void Promise.resolve(action()).then(onDone)
  }, [action, onDone])
  return null
}

interface ToolbarProps {
  activeId: TemplateId
  onExport: () => void
  onPrint: () => void
}

function TemplatePicker({ activeId }: { activeId: TemplateId }) {
  const meta = getTemplateMeta(activeId)
  const idx = Math.max(0, TEMPLATES.findIndex((t) => t.id === activeId))
  const prev = TEMPLATES[(idx - 1 + TEMPLATES.length) % TEMPLATES.length]
  const next = TEMPLATES[(idx + 1) % TEMPLATES.length]

  const commit = useCallback(async (id: TemplateId) => {
    if (id === activeId) return
    const s = await db.settings.get('singleton')
    if (s) {
      await db.settings.put({ ...s, defaultTemplateId: id })
    } else {
      await db.settings.put({
        id: 'singleton',
        geminiApiKey: '',
        defaultLanguage: 'fr',
        defaultTemplateId: id,
        geminiQuotaUsed: 0,
        geminiQuotaResetAt: '',
      })
    }
  }, [activeId])

  return (
    <div className="inline-flex items-center gap-1" aria-label="Modèle de CV">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => { void commit(prev.id) }}
            aria-label="Modèle précédent"
          >
            <ChevronLeft className="size-3.5" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Modèle précédent</TooltipContent>
      </Tooltip>
      <div className="flex items-center gap-2 px-2 min-w-[120px] justify-center">
        <LayoutTemplate className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium tabular-nums truncate">{meta.name}</span>
        {meta.atsFriendly && (
          <span className="text-[10px] font-medium" style={{ color: 'var(--c-success)' }}>ATS</span>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => { void commit(next.id) }}
            aria-label="Modèle suivant"
          >
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Modèle suivant</TooltipContent>
      </Tooltip>
    </div>
  )
}

function LangToggle({ activeId }: { activeId: TemplateId }) {
  const { settings } = useSettings()
  const activeLang = settings?.defaultLanguage ?? 'fr'

  const setLang = useCallback(async (lang: 'fr' | 'en') => {
    try {
      const s = await db.settings.get('singleton')
      if (s) {
        await db.settings.put({ ...s, defaultLanguage: lang })
      } else {
        await db.settings.put({
          id: 'singleton',
          geminiApiKey: '',
          defaultLanguage: lang,
          defaultTemplateId: activeId,
          geminiQuotaUsed: 0,
          geminiQuotaResetAt: '',
        })
      }
    } catch (err) {
      console.error('Failed to update language', err)
    }
  }, [activeId])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <ToggleGroup
            type="single"
            size="sm"
            value={activeLang}
            onValueChange={(v) => { if (v === 'fr' || v === 'en') void setLang(v) }}
            aria-label="Langue du CV"
          >
            <ToggleGroupItem value="fr" aria-label="Français" className="px-2.5">
              <Languages className="size-3.5" aria-hidden="true" />
              FR
            </ToggleGroupItem>
            <ToggleGroupItem value="en" aria-label="Anglais" className="px-2.5">
              EN
            </ToggleGroupItem>
          </ToggleGroup>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom">Langue</TooltipContent>
    </Tooltip>
  )
}

/** Top-of-preview toolbar — single row: template paginator | FR/EN center | export actions. */
function PreviewToolbar({ activeId, onExport, onPrint }: ToolbarProps) {
  return (
    <div
      className="grid grid-cols-3 items-center gap-2 px-3 py-2 border-b no-print"
      style={{ background: 'var(--c-surface)', borderColor: 'var(--c-outline)', minHeight: '50px' }}
    >
      <div className="justify-self-start">
        <TemplatePicker activeId={activeId} />
      </div>
      <div className="justify-self-center">
        <LangToggle activeId={activeId} />
      </div>
      <div className="flex items-center gap-2 justify-self-end shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" onClick={onExport} aria-label="Exporter en PDF">
              <Download className="size-3.5" aria-hidden="true" />
              Export PDF
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Télécharger en PDF</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={onPrint} aria-label="Imprimer">
              <Printer className="size-3.5" aria-hidden="true" />
              Print
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Imprimer</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

function PreviewEmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Empty className="border bg-(--c-surface)">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Aperçu du CV indisponible</EmptyTitle>
          <EmptyDescription>
            Complétez votre profil pour générer un aperçu en direct.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild size="sm">
            <Link to="/edit">Compléter le profil</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

export function CvPreviewPanel({ profile, displayCv }: Props) {
  // Always render the template skeleton so users see a live preview as they type.
  // Only hide it when the profile is completely empty.
  const hasContent = Boolean(
    profile.personal.name?.trim() ||
      profile.personal.summary?.trim() ||
      profile.experience.length > 0
  )

  const [pendingAction, setPendingAction] = useState(false)
  const printDivRef = useRef<HTMLDivElement>(null)

  const handlePrint  = useCallback(() => { window.print() }, [])
  const handleExport = useCallback(() => setPendingAction(true), [])
  const handleActionDone = useCallback(() => setPendingAction(false), [])

  const exportAction = useCallback(async () => {
    if (!printDivRef.current) return
    const { exportElementAsPdf } = await import('../../lib/exportPdf')
    const name = profile.personal.name?.trim().replace(/\s+/g, '_') || 'CV'
    await exportElementAsPdf(printDivRef.current, `${name}.pdf`)
  }, [profile.personal.name])

  const { settings } = useSettings()
  const { baseCv: panelBaseCv, showDiff } = useCvPanel()
  const activeTemplateId = (settings?.defaultTemplateId ?? displayCv.templateId ?? 'ats-clean') as TemplateId
  const effectiveCv = withTemplate(displayCv, activeTemplateId)

  return (
    <div className="flex flex-col h-full">
      <PreviewToolbar
        activeId={activeTemplateId}
        onExport={handleExport}
        onPrint={handlePrint}
      />

      <div
        tabIndex={0}
        role="region"
        aria-label="CV preview"
        className="flex-1 overflow-y-auto focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--c-accent)"
        style={{ background: 'var(--c-surface-container)' }}
      >
        {hasContent ? (
          <ScaledCv
            profile={profile}
            cv={effectiveCv}
            templateId={activeTemplateId}
            baseCv={panelBaseCv}
            showDiff={showDiff}
          />
        ) : (
          <PreviewEmptyState />
        )}
      </div>

      {/* Render target: portal to body, ref used by html2canvas export */}
      {hasContent && createPortal(
        <div className="print-cv" ref={printDivRef}>
          <Suspense fallback={null}>
            <TemplateRenderer
              templateId={activeTemplateId}
              profile={profile}
              cv={effectiveCv}
              baseCv={panelBaseCv}
              showDiff={showDiff}
            />
            {pendingAction && (
              <DeferredAction
                action={exportAction}
                onDone={handleActionDone}
              />
            )}
          </Suspense>
        </div>,
        document.body
      )}
    </div>
  )
}
