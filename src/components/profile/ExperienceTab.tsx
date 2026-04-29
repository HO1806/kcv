import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAutoSave } from '../../hooks/useAutoSave'
import { generateId, formatDate } from '../../lib/utils'
import { KeywordDensity } from './KeywordDensity'
import { ExperienceEditModal } from './ExperienceEditModal'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Profile, Experience } from '../../types'

interface ExperienceTabProps {
  profile: Profile
  onSave: (updates: Partial<Profile>) => void
}

export function ExperienceTab({ profile, onSave }: ExperienceTabProps) {
  const [items, setItems] = useState<Experience[]>(profile.experience)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showKeywords, setShowKeywords] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setItems(profile.experience), [profile.experience])
  useAutoSave(items, (v) => onSave({ experience: v }))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const add = useCallback(() => {
    const newExp: Experience = {
      id: generateId(),
      company: '',
      role: '',
      city: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [''],
    }
    setItems((prev) => [...prev, newExp])
    setEditingId(newExp.id)
  }, [])

  const saveEdit = useCallback((updated: Experience) => {
    setItems((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    setEditingId(null)
  }, [])

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((e) => e.id !== id))
    setEditingId(null)
  }, [])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setItems((prev) => {
      const oldIndex = prev.findIndex((e) => e.id === active.id)
      const newIndex = prev.findIndex((e) => e.id === over.id)
      if (oldIndex < 0 || newIndex < 0) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const editingExp = editingId ? items.find((e) => e.id === editingId) ?? null : null

  return (
    <section className="flex flex-col gap-3">
      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Aucune expérience</EmptyTitle>
            <EmptyDescription>
              Ajoutez votre première expérience professionnelle pour commencer.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            {items.map((exp) => (
              <SortableExperienceCard
                key={exp.id}
                exp={exp}
                onEdit={() => setEditingId(exp.id)}
                onDelete={() => deleteItem(exp.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <Button type="button" variant="outline" size="sm" onClick={add} className="self-start">
        <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">add</span>
        Ajouter une expérience
      </Button>

      {items.length > 0 && (
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowKeywords((v) => !v)}
            className="ks-caption"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }} aria-hidden="true">
              {showKeywords ? 'expand_less' : 'expand_more'}
            </span>
            Mots-clés
          </Button>
          {showKeywords && (
            <div className="mt-2">
              <KeywordDensity
                bullets={items.flatMap((e) => e.bullets)}
                skills={profile.skills}
              />
            </div>
          )}
        </div>
      )}

      {editingExp && (
        <ExperienceEditModal
          exp={editingExp}
          onSave={saveEdit}
          onDelete={() => deleteItem(editingExp.id)}
          onClose={() => setEditingId(null)}
        />
      )}
    </section>
  )
}

interface SortableExperienceCardProps {
  exp: Experience
  onEdit: () => void
  onDelete: () => void
}

function SortableExperienceCard({ exp, onEdit, onDelete }: SortableExperienceCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: exp.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const dateRange = buildDateRange(exp)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-2 rounded-xl bg-card ring-1 ring-foreground/10 px-3 py-3 shadow-sm hover:bg-muted/40 transition-colors"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity touch-none text-muted-foreground"
            style={{ cursor: 'grab' }}
            aria-label="Réordonner"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">
              drag_indicator
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">Glisser pour réordonner</TooltipContent>
      </Tooltip>

      <button
        type="button"
        onClick={onEdit}
        className="flex-1 min-w-0 text-left cursor-pointer"
        aria-label={`Modifier ${exp.role || 'expérience'} chez ${exp.company || '…'}`}
      >
        <p className="ks-body-sm font-semibold truncate">
          {exp.role || <span className="text-muted-foreground">Poste non défini</span>}
        </p>
        {exp.company && (
          <p className="ks-caption truncate" style={{ color: 'var(--c-accent)' }}>{exp.company}</p>
        )}
        {dateRange && <p className="ks-caption">{dateRange}</p>}
      </button>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button type="button" variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Modifier">
          <span className="material-symbols-outlined" style={{ fontSize: 15 }} aria-hidden="true">edit</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label="Supprimer"
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 15 }} aria-hidden="true">delete</span>
        </Button>
      </div>
    </div>
  )
}

function buildDateRange(exp: Experience): string {
  const start = exp.startDate ? formatDate(exp.startDate) : ''
  const end = exp.current ? 'Présent' : exp.endDate ? formatDate(exp.endDate) : ''
  if (!start && !end) return ''
  if (!end) return start
  if (!start) return end
  return `${start} – ${end}`
}
