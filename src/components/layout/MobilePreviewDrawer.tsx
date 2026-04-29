import type { Profile, BaseCV, JobApplication } from '../../types'
import { CvPreviewPanel } from './CvPreviewPanel'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { EyeIcon } from 'lucide-react'

interface MobilePreviewDrawerProps {
  profile: Profile
  displayCv: BaseCV | JobApplication
}

export function MobilePreviewDrawer({ profile, displayCv }: MobilePreviewDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="default"
          size="icon-lg"
          aria-label="Voir l'aperçu du CV"
          className="md:hidden fixed right-4 z-30 size-14 rounded-full shadow-lg"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
        >
          <EyeIcon className="size-6" aria-hidden="true" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="md:hidden h-[90vh] max-h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>Aperçu CV</DrawerTitle>
          <DrawerDescription className="sr-only">
            Aperçu du CV en cours
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 min-h-0 overflow-hidden">
          <CvPreviewPanel profile={profile} displayCv={displayCv} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
