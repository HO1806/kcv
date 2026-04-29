import { useId } from 'react'
import clsx from 'clsx'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/Input'

interface EditorialFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  label: string
  hint?: string
  error?: string
  /**
   * Optional id for an internal slot control. Forwarded to FieldLabel's `htmlFor`
   * so screen readers can associate the label with custom controls. The caller
   * is responsible for setting the same id on the inner control.
   */
  controlId?: string
  children?: React.ReactNode
}

export function EditorialField({
  label,
  hint,
  error,
  className,
  id,
  children,
  controlId,
  ...inputProps
}: EditorialFieldProps) {
  const fallbackId = useId()
  const inputId = id ?? fallbackId
  const labelFor = children ? controlId : inputId

  return (
    <Field className={clsx(className)} data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={labelFor} className="text-xs font-medium">
        {label}
      </FieldLabel>
      {children ?? (
        <Input
          id={inputId}
          {...inputProps}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint && !error ? `${inputId}-hint` : undefined}
        />
      )}
      {hint && !error && (
        <FieldDescription id={`${inputId}-hint`}>{hint}</FieldDescription>
      )}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
