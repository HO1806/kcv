import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { cn } from '../../lib/utils'
import type { ApplicationStatus } from '../../types'

interface StatusPillProps {
  status: ApplicationStatus
  className?: string
}

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning'

const STATUS_VARIANT: Record<ApplicationStatus, BadgeVariant> = {
  saved: 'secondary',
  applied: 'success',
  interview: 'warning',
  offer: 'success',
  rejected: 'destructive',
}

/** Material Symbols icon name per status. Provides a non-color indicator (SC 1.4.1). */
const STATUS_ICON: Record<ApplicationStatus, string> = {
  saved: 'bookmark',
  applied: 'send',
  interview: 'forum',
  offer: 'verified',
  rejected: 'cancel',
}

export function StatusPill({ status, className }: StatusPillProps) {
  const { t } = useTranslation()
  return (
    <Badge variant={STATUS_VARIANT[status]} className={cn('gap-1', className)}>
      <span className="material-symbols-outlined" style={{ fontSize: 12 }} aria-hidden="true">
        {STATUS_ICON[status]}
      </span>
      <span>{t(`applications.status.${status}`)}</span>
    </Badge>
  )
}
