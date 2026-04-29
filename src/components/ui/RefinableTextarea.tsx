import { useId, useState } from 'react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSettings } from '../../db'
import { parseGeminiError } from '../../lib/errors'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/Textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SparklesIcon } from 'lucide-react'

interface RefinableTextareaProps {
  value: string
  onChange: (value: string) => void
  label?: string
  hint?: string
  placeholder?: string
  rows?: number
  error?: string
  className?: string
  refineContext?: string
}

export function RefinableTextarea({
  value,
  onChange,
  label,
  hint,
  placeholder,
  rows = 4,
  error,
  className,
  refineContext = '',
}: RefinableTextareaProps) {
  const { t } = useTranslation()
  const [refining, setRefining] = useState(false)
  const [refineError, setRefineError] = useState<string | null>(null)
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  async function handleRefine() {
    if (!value.trim() || refining) return
    setRefining(true)
    setRefineError(null)
    try {
      const settings = await getSettings()
      if (!settings.geminiApiKey) {
        setRefineError(t('common.noApiKey'))
        return
      }
      const model = new GoogleGenerativeAI(settings.geminiApiKey).getGenerativeModel({
        model: 'gemini-2.5-flash',
      })
      const prompt = `Rewrite the following text to make it more professional, concise, and impactful for a Moroccan job market CV. Keep the same language (French or English). Preserve all factual information. Return only the improved text, no explanation.${refineContext ? `\n\nContext: ${refineContext}` : ''}\n\nText to improve:\n${value}`
      const result = await model.generateContent(prompt)
      const improved = result.response.text().trim()
      if (improved) onChange(improved)
    } catch (err) {
      setRefineError(parseGeminiError(err))
    } finally {
      setRefining(false)
    }
  }

  const describedBy = [error || refineError ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ') || undefined

  const hasError = !!(error || refineError)

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        {label && (
          <Label htmlFor={id} className="text-xs font-medium">
            {label}
          </Label>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleRefine}
              loading={refining}
              disabled={refining || !value.trim()}
              aria-label={t('common.refine')}
            >
              {!refining && <SparklesIcon className="size-3.5" aria-hidden="true" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {refining ? t('common.refining') : t('common.refine')}
          </TooltipContent>
        </Tooltip>
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        aria-label={label ? undefined : t('profileEdit.personal.summary')}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
        className={clsx('resize-y', refining && 'opacity-60')}
      />
      {hint && (
        <p id={hintId} className="ks-caption">
          {hint}
        </p>
      )}
      {hasError && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error || refineError}
        </p>
      )}
    </div>
  )
}
