import { useState, useCallback } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSettings } from '../../db'
import { parseGeminiError } from '../../lib/errors'
import { MonthYearPicker } from '../ui/MonthYearPicker'
import { CitySelect } from '../ui/CitySelect'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Trash2Icon,
  SparklesIcon,
  PlusIcon,
  XIcon,
  GripVerticalIcon,
  Loader2Icon,
} from 'lucide-react'
import type { Experience } from '../../types'

interface ExperienceEditModalProps {
  exp: Experience
  onSave: (exp: Experience) => void
  onDelete: () => void
  onClose: () => void
}

export function ExperienceEditModal({ exp, onSave, onDelete, onClose }: ExperienceEditModalProps) {
  const [draft, setDraft] = useState<Experience>({ ...exp, bullets: [...exp.bullets] })
  const [refiningAll, setRefiningAll] = useState(false)
  const [refiningIdx, setRefiningIdx] = useState<number | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  const set = useCallback(<K extends keyof Experience>(key: K, value: Experience[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
  }, [])

  function setBullet(idx: number, value: string) {
    setDraft((d) => {
      const bullets = [...d.bullets]
      bullets[idx] = value
      return { ...d, bullets }
    })
  }

  function addBullet() {
    setDraft((d) => ({ ...d, bullets: [...d.bullets, ''] }))
  }

  function removeBullet(idx: number) {
    setDraft((d) => ({ ...d, bullets: d.bullets.filter((_, i) => i !== idx) }))
  }

  async function refineOneBullet(idx: number) {
    const text = draft.bullets[idx]
    if (!text.trim() || refiningIdx !== null || refiningAll) return
    setRefiningIdx(idx)
    setAiError(null)
    try {
      const refined = await callGeminiRefine(
        text,
        `Experience at ${draft.company} as ${draft.role}`,
      )
      if (refined) setBullet(idx, refined)
    } catch (err) {
      setAiError(parseGeminiError(err))
    } finally {
      setRefiningIdx(null)
    }
  }

  async function refineAllBullets() {
    const filled = draft.bullets.filter((b) => b.trim())
    if (!filled.length || refiningAll || refiningIdx !== null) return
    setRefiningAll(true)
    setAiError(null)
    try {
      const context = `Experience at ${draft.company} as ${draft.role}`
      const results = await Promise.all(
        draft.bullets.map((b) => b.trim() ? callGeminiRefine(b, context) : Promise.resolve(b)),
      )
      setDraft((d) => ({ ...d, bullets: results.map((r, i) => r || d.bullets[i]) }))
    } catch (err) {
      setAiError(parseGeminiError(err))
    } finally {
      setRefiningAll(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[560px] gap-5">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;expérience</DialogTitle>
          <DialogDescription className="sr-only">
            Renseignez les détails de l&apos;expérience professionnelle
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Row 1: Role + Company */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exp-role" className="text-xs">Poste / titre</Label>
              <Input
                id="exp-role"
                type="text"
                value={draft.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="Développeur Frontend"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exp-company" className="text-xs">Entreprise</Label>
              <Input
                id="exp-company"
                type="text"
                value={draft.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
          </div>

          {/* Row 2: Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Date de début</Label>
              <MonthYearPicker
                value={draft.startDate}
                onChange={(v) => set('startDate', v)}
                placeholder="Mois/Année"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Date de fin</Label>
              <MonthYearPicker
                value={draft.endDate}
                onChange={(v) => set('endDate', v)}
                disabled={draft.current}
                placeholder="Mois/Année"
              />
            </div>
          </div>

          {/* Current toggle */}
          <Label className="flex items-center gap-3 text-sm font-normal">
            <Switch
              checked={draft.current}
              onCheckedChange={(v) => set('current', v)}
            />
            Poste actuel
          </Label>

          {/* Lieu */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Lieu</Label>
            <CitySelect value={draft.city} onChange={(v) => set('city', v)} />
          </div>

          {/* Bullets */}
          <BulletsSection
            bullets={draft.bullets}
            refiningAll={refiningAll}
            refiningIdx={refiningIdx}
            aiError={aiError}
            onRefineAll={refineAllBullets}
            onRefineBullet={refineOneBullet}
            onChangeBullet={setBullet}
            onAddBullet={addBullet}
            onRemoveBullet={removeBullet}
          />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
            <Trash2Icon aria-hidden="true" />
            Supprimer
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button type="button" variant="default" size="sm" onClick={() => onSave(draft)}>
              Sauvegarder
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface BulletsSectionProps {
  bullets: string[]
  refiningAll: boolean
  refiningIdx: number | null
  aiError: string | null
  onRefineAll: () => void
  onRefineBullet: (idx: number) => void
  onChangeBullet: (idx: number, value: string) => void
  onAddBullet: () => void
  onRemoveBullet: (idx: number) => void
}

function BulletsSection({
  bullets, refiningAll, refiningIdx, aiError,
  onRefineAll, onRefineBullet, onChangeBullet, onAddBullet, onRemoveBullet,
}: BulletsSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Points clés</Label>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onRefineAll}
          disabled={refiningAll || refiningIdx !== null}
        >
          {refiningAll ? (
            <Loader2Icon className="animate-spin" aria-hidden="true" />
          ) : (
            <SparklesIcon aria-hidden="true" />
          )}
          {refiningAll ? 'Amélioration…' : 'Améliorer tous les points'}
        </Button>
      </div>

      {bullets.map((bullet, idx) => (
        <BulletRow
          key={idx}
          bullet={bullet}
          refining={refiningIdx === idx}
          disabled={refiningAll || (refiningIdx !== null && refiningIdx !== idx)}
          onChange={(v) => onChangeBullet(idx, v)}
          onRefine={() => onRefineBullet(idx)}
          onRemove={() => onRemoveBullet(idx)}
        />
      ))}

      {aiError && (
        <p className="text-xs text-destructive" role="alert">{aiError}</p>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onAddBullet}
        className="self-start"
      >
        <PlusIcon aria-hidden="true" />
        Ajouter un point
      </Button>
    </div>
  )
}

interface BulletRowProps {
  bullet: string
  refining: boolean
  disabled: boolean
  onChange: (v: string) => void
  onRefine: () => void
  onRemove: () => void
}

function BulletRow({ bullet, refining, disabled, onChange, onRefine, onRemove }: BulletRowProps) {
  return (
    <div className="flex items-start gap-2 group/bullet">
      <GripVerticalIcon
        className="mt-3 size-4 shrink-0 text-muted-foreground opacity-0 group-hover/bullet:opacity-100 cursor-grab transition-opacity"
        aria-hidden="true"
      />
      <Textarea
        value={bullet}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        disabled={disabled || refining}
        placeholder="Décrivez une réalisation clé..."
        className={`flex-1${refining ? ' ks-ai-generated' : ''}`}
      />
      <div className="flex flex-col gap-1 mt-1 opacity-0 group-hover/bullet:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onRefine}
          disabled={disabled || refining || !bullet.trim()}
          aria-label="Améliorer ce point"
        >
          {refining ? (
            <Loader2Icon className="animate-spin" aria-hidden="true" />
          ) : (
            <SparklesIcon aria-hidden="true" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          aria-label="Supprimer ce point"
        >
          <XIcon aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

async function callGeminiRefine(text: string, context: string): Promise<string> {
  const settings = await getSettings()
  if (!settings.geminiApiKey) throw new Error('NO_API_KEY')
  const model = new GoogleGenerativeAI(settings.geminiApiKey).getGenerativeModel({
    model: 'gemini-2.5-flash',
  })
  const prompt = `Rewrite the following CV bullet point to make it more professional, concise, and impactful for a Moroccan job market CV. Keep the same language (French or English). Preserve all factual information. Return only the improved text, no explanation.\n\nContext: ${context}\n\nBullet to improve:\n${text}`
  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}
