import { useState, useEffect } from 'react'
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
import { generateId } from '../../lib/utils'
import { EducationEditModal } from './EducationEditModal'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Profile, Education } from '../../types'

interface EducationTabProps {
  profile: Profile
  onSave: (updates: Partial<Profile>) => void
}

export function EducationTab({ profile, onSave }: EducationTabProps) {
  const [items, setItems] = useState<Education[]>(profile.education)
  const [editing, setEditing] = useState<Education | null | 'new'>()

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setItems(profile.education), [profile.education])
  useAutoSave(items, (v) => onSave({ education: v }))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleSave(item: Education) {
    setItems((prev) => {
      const exists = prev.some((e) => e.id === item.id)
      return exists ? prev.map((e) => (e.id === item.id ? item : e)) : [...prev, item]
    })
    setEditing(undefined)
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((e) => e.id !== id))
    setEditing(undefined)
  }

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

  return (
    <section className="flex flex-col gap-3">
      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Aucune formation</EmptyTitle>
            <EmptyDescription>Ajoutez vos diplômes pour étoffer votre profil.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            {items.map((edu) => (
              <SortableEducationCard
                key={edu.id}
                edu={edu}
                onEdit={() => setEditing(edu)}
                onDelete={() => handleDelete(edu.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setEditing('new')}
        className="self-start"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">add</span>
        Ajouter une formation
      </Button>

      {editing !== undefined && (
        <EducationEditModal
          item={editing === 'new' ? null : editing}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(undefined)}
          generateId={generateId}
        />
      )}
    </section>
  )
}

interface SortableEducationCardProps {
  edu: Education
  onEdit: () => void
  onDelete: () => void
}

function SortableEducationCard({ edu, onEdit, onDelete }: SortableEducationCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: edu.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const subtitle = [edu.institution, edu.city].filter(Boolean).join(' · ')
    + (edu.startDate ? ` · ${edu.startDate.slice(0, 7)}` : '')

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

      <button type="button" onClick={onEdit} className="flex-1 min-w-0 text-left cursor-pointer">
        <p className="ks-body-sm font-semibold truncate">
          {edu.diploma || <span className="text-muted-foreground">Diplôme non renseigné</span>}
        </p>
        {subtitle && <p className="ks-caption truncate">{subtitle}</p>}
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
