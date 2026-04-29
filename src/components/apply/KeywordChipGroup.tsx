import { Badge } from '@/components/ui/Badge'

type Tone = 'matched' | 'missing'

interface KeywordChipGroupProps {
  label: string
  keywords: string[]
  tone: Tone
}

export function KeywordChipGroup({ label, keywords, tone }: KeywordChipGroupProps) {
  if (keywords.length === 0) return null
  const variant = tone === 'matched' ? 'success' : 'destructive'
  return (
    <section className="flex flex-col gap-2.5">
      <header className="flex items-center justify-between">
        <h3 className="ks-section">{label}</h3>
        <Badge variant={variant}>{keywords.length}</Badge>
      </header>
      <ul className="flex flex-wrap gap-1.5">
        {keywords.map((keyword) => (
          <li key={keyword}>
            <Badge variant={variant} className="px-2.5 py-1 text-xs">
              {keyword}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  )
}
