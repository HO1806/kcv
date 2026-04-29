interface SectionSuggestionProps {
  children: React.ReactNode
  /** Optional override for the eyebrow tag. Default: "Suggestion". */
  tag?: string
}

/**
 * Editorial emerald hint card used at the bottom of section forms.
 * Sentence-case eyebrow, matches the rest of the editor surface.
 */
export function SectionSuggestion({ children, tag = 'Suggestion' }: SectionSuggestionProps) {
  return (
    <aside
      role="note"
      className="flex items-start gap-2 px-3 py-2.5 border-l-2 rounded-sm"
      style={{
        background: 'rgba(52, 211, 153, 0.08)',
        borderColor: 'var(--c-success)',
      }}
    >
      <span
        className="material-symbols-outlined shrink-0"
        aria-hidden="true"
        style={{ color: 'var(--c-success)', fontSize: '16px' }}
      >
        lightbulb
      </span>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="ks-eyebrow" style={{ color: 'var(--c-success)' }}>
          {tag}
        </span>
        <p className="ks-body-sm leading-snug">{children}</p>
      </div>
    </aside>
  )
}
