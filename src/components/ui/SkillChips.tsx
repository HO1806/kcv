import { useState } from 'react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { SKILL_SUGGESTIONS } from '../../data/morocco'
import type { Skill } from '../../types'
import { generateId } from '../../lib/utils'

interface SkillChipsProps {
  existingSkills: Skill[]
  onAdd: (skill: Skill) => void
}

type SuggestionCategory = 'commercial' | 'bureautique' | 'digital' | 'soft'

const CATEGORIES: SuggestionCategory[] = ['commercial', 'bureautique', 'digital', 'soft']

export function SkillChips({ existingSkills, onAdd }: SkillChipsProps) {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<SuggestionCategory>('commercial')

  const suggestions = SKILL_SUGGESTIONS[activeCategory] ?? []
  const existingNames = new Set(existingSkills.map((s) => s.name.toLowerCase()))

  function addSkill(name: string, category: Skill['category']) {
    if (existingNames.has(name.toLowerCase())) return
    onAdd({ id: generateId(), name, category })
  }

  return (
    <div className="mt-2">
      <div className="flex gap-1 flex-wrap mb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              'px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] border transition-colors cursor-pointer',
              activeCategory === cat
                ? 'bg-(--c-primary) text-(--c-on-primary) border-(--c-primary)'
                : 'bg-transparent text-(--c-on-surface-muted) border-(--c-outline) hover:text-(--c-on-surface) hover:border-(--c-on-surface-muted)'
            )}
          >
            {t(`profileEdit.skills.suggestions.${cat}`)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s) => {
          const added = existingNames.has(s.name.toLowerCase())
          return (
            <button
              key={s.name}
              type="button"
              disabled={added}
              onClick={() => addSkill(s.name, s.category)}
              className={clsx(
                'inline-flex items-center gap-1 px-2.5 py-1 text-[11px] border transition-colors',
                added
                  ? 'bg-(--c-surface-container) text-(--c-success) border-(--c-success) cursor-default'
                  : 'bg-transparent text-(--c-on-surface-muted) border-(--c-outline) hover:text-(--c-accent) hover:border-(--c-accent) cursor-pointer'
              )}
            >
              <span aria-hidden="true">{added ? '✓' : '+'}</span>
              {s.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
