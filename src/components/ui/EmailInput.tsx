import { useState, useRef, useId } from 'react'
import clsx from 'clsx'
import { EMAIL_DOMAINS } from '../../data/morocco'
import { Label } from '@/components/ui/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { MailIcon } from 'lucide-react'

interface EmailInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  className?: string
  id?: string
}

export function EmailInput({
  value,
  onChange,
  label,
  placeholder = 'prenom.nom@gmail.com',
  error,
  className,
  id,
}: EmailInputProps) {
  const uid = useId()
  const inputId = id ?? `email-input-${uid}`
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    onChange(v)

    const atIdx = v.indexOf('@')
    if (atIdx !== -1) {
      const typed = v.slice(atIdx + 1)
      const local = v.slice(0, atIdx)
      const matches = EMAIL_DOMAINS.filter((d) => d.startsWith(typed) && d !== typed)
      const next = matches.slice(0, 5).map((d) => `${local}@${d}`)
      setSuggestions(next)
      setOpen(next.length > 0)
    } else {
      setSuggestions([])
      setOpen(false)
    }
  }

  function applySuggestion(s: string) {
    onChange(s)
    setSuggestions([])
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={inputId} className="text-xs font-medium">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <InputGroup aria-invalid={error ? true : undefined}>
            <InputGroupAddon align="inline-start">
              <MailIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              ref={inputRef}
              id={inputId}
              type="email"
              value={value}
              onChange={handleChange}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder={placeholder}
              aria-invalid={error ? true : undefined}
              autoComplete="email"
            />
          </InputGroup>
        </PopoverAnchor>
        {suggestions.length > 0 && (
          <PopoverContent
            align="start"
            className="w-(--radix-popover-trigger-width) min-w-[--radix-popover-trigger-width] p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command shouldFilter={false}>
              <CommandList>
                <CommandEmpty>Aucune suggestion</CommandEmpty>
                {suggestions.map((s) => (
                  <CommandItem
                    key={s}
                    value={s}
                    onMouseDown={(e) => e.preventDefault()}
                    onSelect={() => applySuggestion(s)}
                  >
                    {s}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
