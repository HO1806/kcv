import { useEffect, useState } from 'react'
import type { Profile, BaseCV, JobApplication } from '../../types'
import { isJobApplication } from '../../types'
import { sectionCompletion } from '../profile/completion'
import { Separator } from '../ui/separator'

interface CvStatusFooterProps {
  profile: Profile
  cv: BaseCV | JobApplication | null
}

const ALL_SECTIONS = ['personal', 'experience', 'education', 'skills', 'languages', 'certifications', 'aiContext'] as const

function relativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `il y a ${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `il y a ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

function computeCompleteness(profile: Profile): number {
  const scores = ALL_SECTIONS.map((s) => sectionCompletion(profile, s))
  const sum = scores.reduce((a, b) => a + b, 0)
  return Math.round(sum / scores.length)
}

export function CvStatusFooter({ profile, cv }: CvStatusFooterProps) {
  // Re-render every 15s so relative timestamps stay current
  const [, force] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 15_000)
    return () => window.clearInterval(id)
  }, [])

  const savedLabel = profile.updatedAt ? relativeTime(profile.updatedAt) : '—'

  // Unused currently but kept for future Gemini-generated timestamp display
  void (cv && !isJobApplication(cv) && cv.profileHash)

  const completeness = computeCompleteness(profile)
  const completenessColor = completeness >= 80 ? '#10b981' : completeness >= 50 ? '#f59e0b' : '#6b7280'

  return (
    <footer
      role="status"
      aria-label="CV status"
      aria-live="polite"
      aria-atomic="false"
      className="shrink-0 h-8 border-t flex items-center justify-between px-6 no-print z-30"
      style={{ background: '#070c14', borderColor: '#1a1f2f' }}
    >
      {/* Left: auto-save indicator */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium tracking-normal truncate" style={{ color: '#9ca3af' }}>
            Sauvegarde automatique active
          </span>
        </div>
        <Separator orientation="vertical" className="h-3.5 bg-[#1a1f2f]" />
        <span className="text-[11px] font-medium tracking-normal tabular-nums shrink-0" style={{ color: '#6b7280' }}>
          {savedLabel}
        </span>
      </div>

      {/* Right: completeness */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[11px] font-medium tracking-normal" style={{ color: '#9ca3af' }}>
          Complétude du CV
        </span>
        <div
          className="w-24 h-1.5 rounded-full overflow-hidden"
          style={{ background: '#2f3445' }}
          role="progressbar"
          aria-valuenow={completeness}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completeness}%`,
              background: completenessColor,
            }}
          />
        </div>
        <span
          className="text-[11px] tabular-nums font-medium w-8 text-right tracking-normal"
          style={{ color: completenessColor }}
        >
          {completeness}%
        </span>
      </div>
    </footer>
  )
}
