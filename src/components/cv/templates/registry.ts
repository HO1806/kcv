import type { ComponentType } from 'react'
import type { Profile, BaseCV, JobApplication, TemplateId } from '../../../types'

export interface CVTemplateProps {
  profile: Profile
  cv: BaseCV | JobApplication
  targetJob?: string
}

export interface TemplateMeta {
  id: TemplateId
  name: string
  description: string
  /** True if this template renders well even without a photo. */
  photoOptional: boolean
  /** True if it is single-column without color blocks (good ATS pass-through). */
  atsFriendly: boolean
  tag: 'recommended' | 'new' | 'creative' | 'classic'
}

/**
 * Canonical list of built-in CV templates, in carousel order.
 * Order matters — keep ATS-friendly first, photo-required last.
 */
export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'ats-clean',
    name: 'ATS Clean',
    description: 'Single-column, sans couleur, compatibilité ATS maximale. Corporate, FMCG, public.',
    photoOptional: true,
    atsFriendly: true,
    tag: 'recommended',
  },
  {
    id: 'bronzor',
    name: 'Bronzor',
    description: 'Single-column conservateur avec accent violet. Finance, conseil, banque.',
    photoOptional: true,
    atsFriendly: true,
    tag: 'classic',
  },
  {
    id: 'onyx',
    name: 'Onyx',
    description: 'Typographie audacieuse, blocs nets. Marketing, vente, retail.',
    photoOptional: true,
    atsFriendly: false,
    tag: 'creative',
  },
  {
    id: 'pikachu',
    name: 'Pikachu',
    description: 'Deux colonnes compactes avec sidebar. Tech, startup — accueille la photo.',
    photoOptional: true,
    atsFriendly: false,
    tag: 'new',
  },
  {
    id: 'azurill',
    name: 'Azurill',
    description: 'Sidebar + frise chronologique. Mid-career, project-heavy — accueille la photo.',
    photoOptional: true,
    atsFriendly: false,
    tag: 'new',
  },
  {
    id: 'leafish',
    name: 'Leafish',
    description: 'Single-column avec photo prééminente, style français/marocain.',
    photoOptional: false,
    atsFriendly: false,
    tag: 'classic',
  },
]

export const TEMPLATE_BY_ID: Partial<Record<TemplateId, TemplateMeta>> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t])
)

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id)

export function getTemplateMeta(id: TemplateId | undefined | null): TemplateMeta {
  if (id && TEMPLATE_BY_ID[id]) return TEMPLATE_BY_ID[id]
  return TEMPLATES[0]
}

export function getTemplateAt(idOrIndex: TemplateId | number): TemplateMeta {
  if (typeof idOrIndex === 'number') {
    const idx = ((idOrIndex % TEMPLATES.length) + TEMPLATES.length) % TEMPLATES.length
    return TEMPLATES[idx]
  }
  return getTemplateMeta(idOrIndex)
}

/** Returns the meta one slot ahead (`+1`) or behind (`-1`), wrapping around. */
export function shiftTemplate(id: TemplateId | undefined | null, direction: 1 | -1): TemplateMeta {
  const idx = TEMPLATES.findIndex((t) => t.id === id)
  const current = idx === -1 ? 0 : idx
  const next = (current + direction + TEMPLATES.length) % TEMPLATES.length
  return TEMPLATES[next]
}

/** Dynamic loader — keeps templates out of the initial bundle. */
export async function loadTemplate(id: TemplateId): Promise<ComponentType<CVTemplateProps>> {
  switch (id) {
    case 'bronzor': {
      const m = await import('./Bronzor')
      return m.Bronzor
    }
    case 'onyx': {
      const m = await import('./Onyx')
      return m.Onyx
    }
    case 'pikachu': {
      const m = await import('./Pikachu')
      return m.Pikachu
    }
    case 'azurill': {
      const m = await import('./Azurill')
      return m.Azurill
    }
    case 'leafish': {
      const m = await import('./Leafish')
      return m.Leafish
    }
    case 'ats-clean':
    default: {
      const m = await import('./AtsClean')
      return m.AtsClean
    }
  }
}
