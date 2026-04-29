import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutoSave } from '../../hooks/useAutoSave'
import { CitySelect } from '../ui/CitySelect'
import { EmailInput } from '../ui/EmailInput'
import { PhoneInput } from '../ui/PhoneInput'
import { RefinableTextarea } from '../ui/RefinableTextarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { UserIcon } from 'lucide-react'
import { EditorialField } from './EditorialField'
import { SectionSuggestion } from './SectionSuggestion'
import type { Profile } from '../../types'

interface PersonalTabProps {
  profile: Profile
  onSave: (updates: Partial<Profile>) => void
}

const MAX_PHOTO_BYTES = 2_000_000
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export function PersonalTab({ profile, onSave }: PersonalTabProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState(profile.personal)
  const [photoError, setPhotoError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setForm(profile.personal), [profile.personal])
  useAutoSave(form, (v) => onSave({ personal: v }))

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError('')
    if (!ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])) {
      setPhotoError('Format non supporté. Utilisez JPG, PNG ou WebP.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Photo trop lourde (max 2 Mo). Compressez-la avant l'import.")
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return
      setForm((f) => ({ ...f, photo: reader.result as string }))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const summaryHasNumbers = /\d/.test(form.summary)

  return (
    <div className="flex flex-col gap-6 pt-2">
      <AvatarBlock
        photo={form.photo}
        name={form.name}
        onUpload={handlePhotoUpload}
        onRemove={() => setForm((f) => ({ ...f, photo: undefined }))}
        fileRef={fileInputRef}
        error={photoError}
      />

      <FieldGroup label="Identité">
        <EditorialField
          label={t('profileEdit.personal.fullName')}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Prénom Nom"
        />
      </FieldGroup>

      <Separator />

      <FieldGroup label="Contact">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <EditorialField label={t('profileEdit.personal.email')}>
            <EmailInput value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
          </EditorialField>
          <EditorialField label={t('profileEdit.personal.phone')}>
            <PhoneInput value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          </EditorialField>
        </div>
        <EditorialField label={t('profileEdit.personal.city')}>
          <CitySelect value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
        </EditorialField>
      </FieldGroup>

      <Separator />

      <FieldGroup label="Présence en ligne">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <EditorialField
            label={t('profileEdit.personal.linkedin')}
            value={form.linkedin}
            onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
            placeholder={t('profileEdit.personal.linkedinPlaceholder')}
          />
          <EditorialField
            label={t('profileEdit.personal.website')}
            value={form.website}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            placeholder={t('profileEdit.personal.websitePlaceholder')}
          />
        </div>
      </FieldGroup>

      <Separator />

      <FieldGroup label="Résumé professionnel">
        <RefinableTextarea
          label=""
          value={form.summary}
          onChange={(v) => setForm((f) => ({ ...f, summary: v }))}
          rows={5}
          hint={t('profileEdit.personal.summaryHint')}
          refineContext="Professional CV summary for Moroccan job market"
        />
      </FieldGroup>

      {form.summary.length > 40 && !summaryHasNumbers && (
        <SectionSuggestion>
          Considérez d'ajouter des chiffres concrets dans vos réussites — un résumé qui contient des
          métriques performe nettement mieux à l'embauche.
        </SectionSuggestion>
      )}
    </div>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="ks-section">{label}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

interface AvatarBlockProps {
  photo: string | undefined
  name: string
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  fileRef: React.RefObject<HTMLInputElement | null>
  error?: string
}

function AvatarBlock({ photo, name, onUpload, onRemove, fileRef, error }: AvatarBlockProps) {
  const initials = (name || '').trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')

  return (
    <div className="flex items-center gap-4">
      <Avatar size="lg" className="size-16 rounded-md">
        {photo ? (
          <AvatarImage src={photo} alt="" />
        ) : null}
        <AvatarFallback className="text-base rounded-md">
          {initials || <UserIcon className="size-6 text-muted-foreground" aria-hidden="true" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
          >
            {photo ? 'Modifier' : 'Téléverser'}
          </Button>
          {photo && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onRemove}
            >
              Retirer
            </Button>
          )}
        </div>
        <p className="ks-caption">JPG, PNG, WebP — max 2 Mo</p>
        {error && (
          <p className="ks-caption" role="alert" style={{ color: 'var(--c-danger)' }}>
            {error}
          </p>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onUpload}
        className="hidden"
      />
    </div>
  )
}
