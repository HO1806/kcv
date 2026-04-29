import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { toast } from 'sonner'
import { useAutoSave } from '../../hooks/useAutoSave'
import { getSettings } from '../../db'
import { parseGeminiError } from '../../lib/errors'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/Textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Profile } from '../../types'

interface AiContextTabProps {
  profile: Profile
  onSave: (updates: Partial<Profile>) => void
}

type AiContextField = 'personality' | 'careerGoals' | 'informalBackground' | 'preferences'

interface FieldDef {
  key: AiContextField
  labelKey: string
  hintKey: string
  rows: number
  context: string
}

const FIELDS: FieldDef[] = [
  {
    key: 'personality',
    labelKey: 'profileEdit.aiContext.personality',
    hintKey: 'profileEdit.aiContext.personalityHint',
    rows: 3,
    context: 'Personality description for CV AI context',
  },
  {
    key: 'careerGoals',
    labelKey: 'profileEdit.aiContext.careerGoals',
    hintKey: 'profileEdit.aiContext.careerGoalsHint',
    rows: 3,
    context: 'Career goals for CV AI context',
  },
  {
    key: 'informalBackground',
    labelKey: 'profileEdit.aiContext.informalBackground',
    hintKey: 'profileEdit.aiContext.informalBackground2Hint',
    rows: 3,
    context: 'Informal background for CV AI context',
  },
  {
    key: 'preferences',
    labelKey: 'profileEdit.aiContext.preferences',
    hintKey: 'profileEdit.aiContext.preferencesHint',
    rows: 2,
    context: 'Work preferences for CV AI context',
  },
]

async function refineSingleField(value: string, fieldContext: string): Promise<string> {
  const settings = await getSettings()
  if (!settings.geminiApiKey) {
    throw new Error('Clé API Gemini manquante')
  }
  const model = new GoogleGenerativeAI(settings.geminiApiKey).getGenerativeModel({
    model: 'gemini-2.5-flash',
  })
  const prompt = `Rewrite the following text to make it more professional, concise, and impactful for a Moroccan job market CV. Keep the same language (French or English). Preserve all factual information. Return only the improved text, no explanation.\n\nContext: ${fieldContext}\n\nText to improve:\n${value}`
  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

export function AiContextTab({ profile, onSave }: AiContextTabProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState(profile.aiContext)
  const [refiningKey, setRefiningKey] = useState<AiContextField | null>(null)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setForm(profile.aiContext), [profile.aiContext])
  useAutoSave(form, (v) => onSave({ aiContext: v }))

  const setField = (key: AiContextField) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function refineField(field: FieldDef) {
    const current = form[field.key]
    if (!current.trim()) return
    setRefiningKey(field.key)
    try {
      const improved = await refineSingleField(current, field.context)
      if (improved) {
        setForm((f) => ({ ...f, [field.key]: improved }))
        toast.success('Champ amélioré')
      }
    } catch (err) {
      toast.error("Échec de l'amélioration", { description: parseGeminiError(err) })
    } finally {
      setRefiningKey(null)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <PrivacyNote />

      <div className="flex flex-col gap-1">
        <h3 className="ks-section">{t('profileEdit.aiContext.title')}</h3>
        <p className="ks-caption">{t('profileEdit.aiContext.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-5">
        {FIELDS.slice(0, 2).map((field) => (
          <RefineableField
            key={field.key}
            field={field}
            value={form[field.key]}
            onChange={setField(field.key)}
            refining={refiningKey === field.key}
            onRefine={() => refineField(field)}
            t={t}
          />
        ))}
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <h3 className="ks-section">Contexte supplémentaire</h3>
        <div className="flex flex-col gap-5">
          {FIELDS.slice(2).map((field) => (
            <RefineableField
              key={field.key}
              field={field}
              value={form[field.key]}
              onChange={setField(field.key)}
              refining={refiningKey === field.key}
              onRefine={() => refineField(field)}
              t={t}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

interface RefineableFieldProps {
  field: FieldDef
  value: string
  onChange: (value: string) => void
  refining: boolean
  onRefine: () => void
  t: (key: string) => string
}

function RefineableField({ field, value, onChange, refining, onRefine, t }: RefineableFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`ai-${field.key}`}>{t(field.labelKey)}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onRefine}
              loading={refining}
              disabled={refining || !value.trim()}
              aria-label="Améliorer ce champ"
            >
              {!refining && (
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zm6 11l.9 2.7L21 16.5l-2.1.8L18 20l-.9-2.7L15 16.5l2.1-.8L18 13zm-12 4l.6 1.8L8 19.4l-1.4.5L6 21l-.6-1.1L4 19.4l1.4-.5L6 17z" />
                </svg>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Améliorer ce champ</TooltipContent>
        </Tooltip>
      </div>
      <Textarea
        id={`ai-${field.key}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={field.rows}
        disabled={refining}
      />
      <p className="ks-caption">{t(field.hintKey)}</p>
    </div>
  )
}

function PrivacyNote() {
  return (
    <aside
      role="note"
      className="flex items-start gap-2 px-3 py-2.5 border-l-2 rounded-sm"
      style={{ background: 'rgba(180, 83, 9, 0.08)', borderColor: 'var(--c-warning)' }}
    >
      <span
        className="material-symbols-outlined shrink-0"
        aria-hidden="true"
        style={{ color: 'var(--c-warning)', fontSize: 16 }}
      >
        warning
      </span>
      <p className="ks-caption leading-snug" style={{ color: 'var(--c-on-surface)' }}>
        <strong>Confidentialité&nbsp;:</strong> les informations de cette section sont envoyées à
        Google Gemini pour personnaliser votre CV. Sur le tier gratuit, Google peut conserver et
        faire examiner vos prompts par des humains. Évitez les données très personnelles, médicales,
        ou sensibles.
      </p>
    </aside>
  )
}
