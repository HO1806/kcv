import { useId } from 'react'
import clsx from 'clsx'
import { MOROCCO_CITIES } from '../../data/morocco'
import { Label } from '@/components/ui/label'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox'

interface CitySelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  id?: string
}

export function CitySelect({
  value,
  onChange,
  label,
  placeholder = 'Ville',
  className,
  id,
}: CitySelectProps) {
  const uid = useId()
  const inputId = id ?? `city-select-${uid}`

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={inputId} className="text-xs font-medium">
          {label}
        </Label>
      )}
      <Combobox
        items={MOROCCO_CITIES}
        value={value}
        onValueChange={(v) => onChange(typeof v === 'string' ? v : '')}
      >
        <ComboboxInput id={inputId} placeholder={placeholder} />
        <ComboboxContent>
          <ComboboxEmpty>Aucune ville trouvée</ComboboxEmpty>
          <ComboboxList>
            {(city: string) => (
              <ComboboxItem key={city} value={city}>
                {city}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
