import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutoSave } from '../../hooks/useAutoSave'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select } from '../ui/Select'
import { SkillChips } from '../ui/SkillChips'
import { generateId } from '../../lib/utils'
import type { Profile, Skill, SkillCategory } from '../../types'

interface SkillsTabProps {
  profile: Profile
  onSave: (updates: Partial<Profile>) => void
}

interface CategoryDef {
  value: SkillCategory
  labelKey: string
  shortLabel: string
}

const SKILL_CATEGORIES: CategoryDef[] = [
  { value: 'technical', labelKey: 'profileEdit.skills.categories.technical', shortLabel: 'Techniques' },
  { value: 'tool', labelKey: 'profileEdit.skills.categories.tool', shortLabel: 'Outils' },
  { value: 'soft', labelKey: 'profileEdit.skills.categories.soft', shortLabel: 'Soft skills' },
]

export function SkillsTab({ profile, onSave }: SkillsTabProps) {
  const { t } = useTranslation()
  const [items, setItems] = useState<Skill[]>(profile.skills)
  const [newName, setNewName] = useState('')
  const [activeCat, setActiveCat] = useState<SkillCategory>('technical')

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setItems(profile.skills), [profile.skills])
  useAutoSave(items, (v) => onSave({ skills: v }))

  function add(category: SkillCategory) {
    const trimmed = newName.trim()
    if (!trimmed) return
    if (items.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewName('')
      return
    }
    setItems((prev) => [...prev, { id: generateId(), name: trimmed, category }])
    setNewName('')
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((s) => s.id !== id))
  }

  function addChip(skill: Skill) {
    setItems((prev) => {
      if (prev.some((s) => s.name.toLowerCase() === skill.name.toLowerCase())) return prev
      return [...prev, skill]
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <Tabs value={activeCat} onValueChange={(v) => setActiveCat(v as SkillCategory)}>
        <TabsList>
          {SKILL_CATEGORIES.map((c) => (
            <TabsTrigger key={c.value} value={c.value}>
              {c.shortLabel}
            </TabsTrigger>
          ))}
        </TabsList>

        {SKILL_CATEGORIES.map((cat) => {
          const catSkills = items.filter((s) => s.category === cat.value)
          return (
            <TabsContent key={cat.value} value={cat.value} className="flex flex-col gap-3 pt-3">
              <div className="flex flex-wrap gap-1.5">
                {catSkills.length === 0 ? (
                  <p className="ks-caption italic">{t('profileEdit.skills.noEntries')}</p>
                ) : (
                  catSkills.map((s) => (
                    <Badge
                      key={s.id}
                      variant="secondary"
                      className="gap-1 text-[11px] py-1 pr-1"
                    >
                      {s.name}
                      <button
                        type="button"
                        onClick={() => remove(s.id)}
                        aria-label={`Retirer ${s.name}`}
                        className="cursor-pointer leading-none px-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && add(cat.value)}
                  placeholder={t('profileEdit.skills.skillPlaceholder')}
                  className="w-full bg-transparent border-0 border-b px-0 py-1.5 text-sm outline-none transition-colors focus:border-b-2"
                  style={{ color: 'var(--c-on-surface)', borderBottomColor: 'var(--c-outline)' }}
                />
                <div className="flex gap-2 items-end">
                  <Select<SkillCategory>
                    value={activeCat}
                    onChange={(v) => setActiveCat(v)}
                    options={SKILL_CATEGORIES.map((c) => ({ value: c.value, label: t(c.labelKey) }))}
                    className="flex-1 min-w-0"
                  />
                  <Button type="button" size="sm" onClick={() => add(activeCat)} className="shrink-0">
                    {t('common.add')}
                  </Button>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: 'var(--c-outline)' }}>
        <h3 className="ks-section">Suggestions rapides</h3>
        <SkillChips existingSkills={items} onAdd={addChip} />
      </div>
    </section>
  )
}
