import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { cn } from '../../lib/utils'
import type { JobApplication } from '../../types'

interface InspectorRailProps {
  applications: JobApplication[]
  className?: string
}

interface Reminder {
  whenLabel: string
  date: string
  title: string
  subtitle: string
}

const DAY_MS = 1000 * 60 * 60 * 24

function buildReminders(applications: JobApplication[]): Reminder[] {
  const interviews = applications.filter((a) => a.status === 'interview').slice(0, 1)
  const applied = applications.filter((a) => a.status === 'applied').slice(0, 2)

  const out: Reminder[] = []

  applied.forEach((a, i) => {
    const dueIn = (i + 1) * 3
    const date = new Date(Date.now() + dueIn * DAY_MS)
    out.push({
      whenLabel: i === 0 ? "Aujourd'hui" : 'Demain',
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      title: a.company || '—',
      subtitle: `Relance ${a.company || ''}`.trim(),
    })
  })

  interviews.forEach((a) => {
    out.push({
      whenLabel: 'Demain',
      date: new Date(Date.now() + DAY_MS).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
      }),
      title: a.company || '—',
      subtitle: `Préparation entretien ${a.company || ''}`.trim(),
    })
  })

  return out.slice(0, 4)
}

export function InspectorRail({ applications, className }: InspectorRailProps) {
  const reminders = buildReminders(applications)

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="border-b border-(--c-outline) pb-3">
        <CardTitle className="ks-section">Activité</CardTitle>
        <p className="text-xs text-(--c-on-surface-muted)">
          {applications.length} candidatures
        </p>
      </CardHeader>

      <CardContent>
        <h3 className="ks-section mb-3">Prochaines actions</h3>
        {reminders.length === 0 ? (
          <p
            className="text-sm italic text-(--c-on-surface-muted)"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Tout est à jour. Postulez à une nouvelle offre pour démarrer un nouveau suivi.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reminders.map((r, idx) => (
              <li key={idx} className="flex flex-col gap-0.5">
                <span className="ks-caption text-(--c-accent)">
                  {r.whenLabel} · {r.date}
                </span>
                <span className="text-sm font-semibold text-(--c-on-surface) truncate">
                  {r.title}
                </span>
                <span className="text-xs text-(--c-on-surface-muted) truncate">
                  {r.subtitle}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
