interface SectionHeadingProps {
  /** Material icon name */
  icon: string
  /** Sentence-case label text */
  label: string
}

/**
 * Inline section header used inside Settings sections.
 * Accent icon + ks-section typography utility.
 */
export function SectionHeading({ icon, label }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span
        className="material-symbols-outlined text-(--c-accent)"
        style={{ fontSize: 18 }}
        aria-hidden
      >
        {icon}
      </span>
      <span className="ks-section text-(--c-on-surface)">{label}</span>
    </div>
  )
}
