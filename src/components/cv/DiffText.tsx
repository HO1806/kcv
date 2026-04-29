import { diffWords } from 'diff'

interface DiffTextProps {
  before: string
  after: string
}

/**
 * Renders an inline word-level diff between `before` and `after`.
 * - Added words: green-tinted background, accent color.
 * - Removed words: red-tinted background, danger color, strikethrough.
 * - Unchanged words: rendered as-is.
 *
 * Falls back to plain `after` rendering when there is nothing to diff
 * (empty `before` or strings already equal) to avoid wrapping every
 * character in spans for the common no-diff case.
 */
export function DiffText({ before, after }: DiffTextProps) {
  if (!before || before === after) {
    return <>{after}</>
  }
  const parts = diffWords(before, after)
  return (
    <>
      {parts.map((p, i) => {
        if (p.added) {
          return (
            <span
              key={i}
              className="bg-(--c-accent)/15 text-(--c-accent)"
            >
              {p.value}
            </span>
          )
        }
        if (p.removed) {
          return (
            <span
              key={i}
              className="bg-(--c-danger)/10 text-(--c-danger) line-through"
            >
              {p.value}
            </span>
          )
        }
        return <span key={i}>{p.value}</span>
      })}
    </>
  )
}
