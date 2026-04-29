import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface DangerZoneProps {
  title: string
  description: string
  buttonLabel: string
  onReset: () => void
}

/**
 * Destructive-variant Alert with a reset action.
 */
export function DangerZone({ title, description, buttonLabel, onReset }: DangerZoneProps) {
  return (
    <Alert variant="destructive" className="flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 18 }}
        aria-hidden
      >
        warning
      </span>
      <div className="flex-1">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </div>
      <Button type="button" variant="destructive" onClick={onReset}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden>
          delete_forever
        </span>
        {buttonLabel}
      </Button>
    </Alert>
  )
}
