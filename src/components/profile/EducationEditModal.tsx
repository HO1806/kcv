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
import { Checkbox } from '@/components/ui/checkbox'
import { Select } from '../ui/Select'
import { CitySelect } from '../ui/CitySelect'
import { EDUCATION_LEVELS, OFPPT_SECTORS, OTHER_INSTITUTIONS } from '../../data/morocco'
import { Trash2Icon } from 'lucide-react'
import type { Education } from '../../types'

interface EducationEditModalProps {
  item: Education | null
  onSave: (item: Education) => void
  onDelete: (id: string) => void
  onClose: () => void
  generateId: () => string
}

const INSTITUTION_OPTIONS = ['OFPPT', ...OTHER_INSTITUTIONS]

export function EducationEditModal({
  item,
  onSave,
  onDelete,
  onClose,
  generateId,
}: EducationEditModalProps) {
  const isNew = item === null

  const [diploma, setDiploma] = useState(item?.diploma ?? '')
  const [institution, setInstitution] = useState(item?.institution ?? '')
  const [city, setCity] = useState(item?.city ?? '')
  const [startDate, setStartDate] = useState(item?.startDate ?? '')
  const [endDate, setEndDate] = useState(item?.endDate ?? '')
  const [level, setLevel] = useState(item?.description ?? '')
  const [isOfppt, setIsOfppt] = useState(() =>
    OFPPT_SECTORS.some((s) => s.specializations.includes(item?.diploma ?? '')),
  )
  const [ofpptSector, setOfpptSector] = useState('')

  const sectorOptions = OFPPT_SECTORS.map((s) => s.label)
  const specOptions = ofpptSector
    ? OFPPT_SECTORS.find((s) => s.label === ofpptSector)?.specializations ?? []
    : []

  function handleSave() {
    onSave({
      id: item?.id ?? generateId(),
      diploma,
      institution,
      city,
      startDate,
      endDate,
      description: level,
    })
  }

  function handleDelete() {
    if (item) onDelete(item.id)
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[480px] gap-5">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Ajouter une formation' : 'Modifier la formation'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Renseignez les détails de la formation
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Niveau</Label>
            <Select
              value={level}
              onChange={setLevel}
              options={EDUCATION_LEVELS}
              placeholder="Sélectionner le niveau..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Établissement</Label>
            <Select
              value={institution}
              onChange={setInstitution}
              options={INSTITUTION_OPTIONS}
              placeholder="Sélectionner l'établissement..."
              searchable
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Ville</Label>
            <CitySelect value={city} onChange={setCity} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edu-start" className="text-xs">Date de début</Label>
              <Input
                id="edu-start"
                type="month"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edu-end" className="text-xs">Date de fin</Label>
              <Input
                id="edu-end"
                type="month"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <Label className="flex items-center gap-2 text-sm font-normal">
            <Checkbox
              checked={isOfppt}
              onCheckedChange={(c) => {
                const next = c === true
                setIsOfppt(next)
                if (!next) {
                  setOfpptSector('')
                  setDiploma('')
                }
              }}
            />
            Formation OFPPT
          </Label>

          {isOfppt ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Secteur</Label>
                <Select
                  value={ofpptSector}
                  onChange={(v) => {
                    setOfpptSector(v)
                    setDiploma('')
                  }}
                  options={sectorOptions}
                  placeholder="Sélectionner le secteur..."
                  searchable
                />
              </div>
              {ofpptSector && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Spécialisation</Label>
                  <Select
                    value={diploma}
                    onChange={setDiploma}
                    options={specOptions}
                    placeholder="Sélectionner la spécialisation..."
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edu-diploma" className="text-xs">Diplôme</Label>
              <Input
                id="edu-diploma"
                type="text"
                value={diploma}
                onChange={(e) => setDiploma(e.target.value)}
                placeholder="Ex: Licence en Informatique"
              />
            </div>
          )}
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
