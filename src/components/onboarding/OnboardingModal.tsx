import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileTextIcon, EditIcon } from 'lucide-react'

export interface OnboardingModalProps {
  onBuild: () => void
  onDismiss: () => void
}

export function OnboardingModal({ onBuild, onDismiss }: OnboardingModalProps) {
  const location = useLocation()
  const initialPathRef = useRef(location.pathname)

  // Auto-dismiss when user navigates away (e.g. clicks nav link above the modal)
  useEffect(() => {
    if (location.pathname !== initialPathRef.current) {
      onDismiss()
    }
  }, [location.pathname, onDismiss])

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onDismiss() }}>
      <DialogContent className="sm:max-w-md gap-5 p-6">
        <DialogHeader className="items-center text-center gap-3">
          <span
            className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <FileTextIcon className="size-6" />
          </span>
          <DialogTitle className="ks-display text-center">
            Créez votre CV de base
          </DialogTitle>
          <DialogDescription className="ks-body text-center">
            Avant de postuler, construisez votre profil. Kosove CV générera ensuite votre CV de base
            en français et en anglais — prêt à être adapté pour chaque offre.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:justify-center bg-transparent border-0 p-0 m-0">
          <Button type="button" variant="default" size="lg" onClick={onBuild} className="w-full">
            <EditIcon aria-hidden="true" />
            Construire mon profil
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={onDismiss} className="w-full">
            Plus tard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
