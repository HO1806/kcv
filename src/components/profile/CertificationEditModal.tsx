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
import { Trash2Icon } from 'lucide-react'
import type { Certification } from '../../types'

interface CertificationEditModalProps {
  item: Certification | null
  onSave: (item: Certification) => void
  onDelete: (id: string) => void
  onClose: () => void
  generateId: () => string
}

export function CertificationEditModal({
  item,
  onSave,
  onDelete,
  onClose,
  generateId,
}: CertificationEditModalProps) {
  const isNew = item === null
  const [name, setName] = useState(item?.name ?? '')
  const [issuer, setIssuer] = useState(item?.issuer ?? '')
  const [date, setDate] = useState(item?.date ?? '')

  function handleSave() {
    onSave({ id: item?.id ?? generateId(), name, issuer, date })
  }

  function handleDelete() {
    if (item) onDelete(item.id)
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[480px] gap-5">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Ajouter une certification' : 'Modifier la certification'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Renseignez les détails de la certification
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cert-name" className="text-xs">Nom de la certification</Label>
            <Input
              id="cert-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: AWS Certified Solutions Architect"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cert-issuer" className="text-xs">Organisme / Émetteur</Label>
            <Input
              id="cert-issuer"
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="Ex: Amazon Web Services"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cert-date" className="text-xs">Date d&apos;obtention</Label>
            <Input
              id="cert-date"
              type="month"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
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
