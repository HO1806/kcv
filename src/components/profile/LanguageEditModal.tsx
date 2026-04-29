import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Trash2Icon } from 'lucide-react'
import type { Language, LanguageLevel } from '../../types'

interface LanguageEditModalProps {
  item: Language | null
  onSave: (item: Language) => void
  onDelete: (id: string) => void
  onClose: () => void
  generateId: () => string
}

const LEVELS: { value: LanguageLevel; label: string }[] = [
  { value: 'Native', label: 'Natif' },
  { value: 'Fluent', label: 'Courant' },
  { value: 'Advanced', label: 'Avancé' },
  { value: 'Intermediate', label: 'Intermédiaire' },
  { value: 'Basic', label: 'Basique' },
]

export function LanguageEditModal({
  item,
  onSave,
  onDelete,
  onClose,
  generateId,
}: LanguageEditModalProps) {
  const isNew = item === null
  const [name, setName] = useState(item?.name ?? '')
  const [level, setLevel] = useState<LanguageLevel>(item?.level ?? 'Intermediate')

  function handleSave() {
    onSave({ id: item?.id ?? generateId(), name, level })
  }

  function handleDelete() {
    if (item) onDelete(item.id)
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[480px] gap-5">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Ajouter une langue' : 'Modifier la langue'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Renseignez la langue et son niveau
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lang-name" className="text-xs">Langue</Label>
            <Input
              id="lang-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Français, Anglais, Arabe"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs">Niveau</Label>
            <ToggleGroup
              type="single"
              value={level}
              onValueChange={(v) => { if (v) setLevel(v as LanguageLevel) }}
              variant="outline"
              spacing={1}
              className="flex-wrap"
            >
              {LEVELS.map((l) => (
                <ToggleGroupItem key={l.value} value={l.value} size="sm">
                  {l.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          {!isNew ? (
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2Icon aria-hidden="true" />
              Supprimer
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button type="button" variant="default" size="sm" onClick={handleSave}>
              Sauvegarder
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
