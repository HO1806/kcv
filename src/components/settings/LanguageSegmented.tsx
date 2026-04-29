import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface LanguageSegmentedProps {
  value: 'fr' | 'en'
  onChange: (lang: 'fr' | 'en') => void
}

/**
 * Two-up segmented control built on shadcn ToggleGroup.
 */
export function LanguageSegmented({ value, onChange }: LanguageSegmentedProps) {
  const options: ReadonlyArray<{ value: 'fr' | 'en'; label: string }> = [
    { value: 'fr', label: 'FR' },
    { value: 'en', label: 'EN' },
  ]

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(v) => {
        if (v === 'fr' || v === 'en') onChange(v)
      }}
      aria-label="Langue de l'interface"
      className="w-fit"
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          aria-label={opt.label}
          className="px-6"
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
