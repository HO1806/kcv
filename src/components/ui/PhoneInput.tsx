import { useId } from 'react'
import clsx from 'clsx'
import { Label } from '@/components/ui/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  className?: string
  id?: string
}

export function PhoneInput({ value, onChange, label, error, className, id }: PhoneInputProps) {
  const uid = useId()
  const inputId = id ?? `phone-input-${uid}`

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^\d\s]/g, '')
    onChange(digits)
  }

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={inputId} className="text-xs font-medium">
          {label}
        </Label>
      )}
      <InputGroup aria-invalid={error ? true : undefined}>
        <InputGroupAddon align="inline-start">
          <InputGroupText className="font-medium tracking-wide">MA +212</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          id={inputId}
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder="6 12 34 56 78"
          aria-invalid={error ? true : undefined}
        />
      </InputGroup>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
