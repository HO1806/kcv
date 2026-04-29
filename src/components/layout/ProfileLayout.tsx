import { useMemo, useRef, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Eye } from 'lucide-react'
import { db } from '../../db'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { useActiveProfile } from '../../hooks/useActiveProfile'
import { useCvPanel } from '../../contexts/CvPanelContext'
import { CvPanelProvider } from '../../contexts/CvPanelProvider'
import { useSettings } from '../../contexts/SettingsContext'
import { CvPreviewPanel } from './CvPreviewPanel'
import { CvStatusFooter } from './CvStatusFooter'
import { MobilePreviewDrawer } from './MobilePreviewDrawer'
import type { BaseCV, TemplateId } from '../../types'

// A4 aspect ratio: 210mm / 297mm ≈ 0.7071
const A4_RATIO = 210 / 297

function ProfileLayoutInner() {
  const { profile } = useActiveProfile()
  const containerRef = useRef<HTMLDivElement>(null)
  const [previewWidth, setPreviewWidth] = useState<number>(0)
  const [previewVisible, setPreviewVisible] = useState(true)

  const baseCV = useLiveQuery<BaseCV | null>(
    async () => {
      if (!profile) return null
      const rows = await db.baseCvs
        .where('profileId')
        .equals(profile.id)
        .reverse()
        .sortBy('generatedAt')
      return rows[0] ?? null
    },
    [profile?.id]
  )

  const { settings: appSettings } = useSettings()
  const activeTemplateId: TemplateId = appSettings?.defaultTemplateId ?? 'ats-clean'
  const { panelCv } = useCvPanel()

  // Calculate preview panel width from available height (A4 ratio)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const h = entry.contentRect.height
      const w = entry.contentRect.width
      const idealWidth = Math.round(h * A4_RATIO)
      // Hide preview below 1024px viewport width
      if (w < 1024) {
        setPreviewVisible(false)
        setPreviewWidth(0)
      } else {
        setPreviewVisible(true)
        // Cap at 45% of total width so the form always has room
        setPreviewWidth(Math.min(idealWidth, Math.round(w * 0.45)))
      }
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  const livePreviewCv = useMemo<BaseCV | null>(() => {
    if (!profile) return null
    return {
      id: 'live-preview',
      profileId: profile.id,
      profileHash: '',
      templateId: activeTemplateId,
      language: 'fr',
      enhancedSummary: profile.personal.summary,
      enhancedExperience: profile.experience.map((exp) => ({
        experienceId: exp.id,
        enhancedBullets: exp.bullets,
      })),
      generatedAt: 0,
      approvedAt: null,
    }
  }, [profile, activeTemplateId])

  const location = useLocation()
  const requireExplicitCv = location.pathname.startsWith('/applications')

  const displayCv = requireExplicitCv ? panelCv : panelCv ?? baseCV ?? livePreviewCv

  const showPreview = previewVisible && profile && displayCv

  return (
    <>
      <div ref={containerRef} className="flex h-full">
        {/* Form panel — takes remaining width */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <Outlet />
        </div>

        {/* CV Preview Panel — dynamic width based on A4 ratio from container height */}
        {showPreview && (
          <div
            className="hidden md:flex flex-col overflow-hidden shrink-0 border-l"
            style={{
              width: previewWidth || undefined,
              borderColor: 'var(--c-outline)',
            }}
          >
            <CvPreviewPanel profile={profile} displayCv={displayCv} />
          </div>
        )}

        {/* Toggle button to show/hide preview on narrow desktops */}
        {!previewVisible && profile && displayCv && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setPreviewVisible(true)}
                className="hidden md:flex items-center justify-center px-2 py-3 border-l cursor-pointer transition-colors hover:bg-(--c-surface-container)"
                style={{ borderColor: 'var(--c-outline)', color: 'var(--c-on-surface-muted)' }}
                aria-label="Afficher l'aperçu CV"
              >
                <Eye className="w-4 h-4" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Afficher l'aperçu</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Full-width status footer */}
      {profile && displayCv && (
        <CvStatusFooter profile={profile} cv={displayCv} />
      )}

      {/* Mobile bottom-sheet drawer */}
      {profile && displayCv && (
        <MobilePreviewDrawer profile={profile} displayCv={displayCv} />
      )}
    </>
  )
}

export function ProfileLayout() {
  return (
    <CvPanelProvider>
      <ProfileLayoutInner />
    </CvPanelProvider>
  )
}
