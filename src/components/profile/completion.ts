import type { Profile } from '../../types'
import type { EditorSection } from '../../store'

/**
 * Computes a 0–100 completion percentage for a given inspector section.
 *
 * Each section has a fixed list of "filled" signals; completion is the share
 * of signals satisfied. Used by `InspectorHeader` to render the meter bar.
 */
export function sectionCompletion(profile: Profile, section: EditorSection): number {
  const signals: boolean[] = (() => {
    switch (section) {
      case 'personal': {
        const p = profile.personal
        return [
          Boolean(p.name),
          Boolean(p.email),
          Boolean(p.phone),
          Boolean(p.city),
          Boolean(p.linkedin || p.website),
          Boolean(p.summary && p.summary.length > 40),
        ]
      }
      case 'experience': {
        if (profile.experience.length === 0) return [false, false, false]
        const allComplete = profile.experience.every(
          (e) => e.role && e.company && e.startDate && e.bullets.filter(Boolean).length > 0,
        )
        return [
          true,
          profile.experience.length >= 2,
          allComplete,
        ]
      }
      case 'education': {
        if (profile.education.length === 0) return [false, false]
        const allComplete = profile.education.every((e) => e.diploma && e.institution)
        return [true, allComplete]
      }
      case 'skills': {
        return [
          profile.skills.length >= 1,
          profile.skills.length >= 5,
          profile.skills.some((s) => s.category === 'technical'),
          profile.skills.some((s) => s.category === 'soft'),
        ]
      }
      case 'languages': {
        return [profile.languages.length >= 1, profile.languages.length >= 2]
      }
      case 'certifications': {
        return [profile.certifications.length >= 1]
      }
      case 'aiContext': {
        const a = profile.aiContext
        return [
          Boolean(a.personality && a.personality.length > 20),
          Boolean(a.careerGoals && a.careerGoals.length > 20),
          Boolean(a.preferences || a.informalBackground),
        ]
      }
    }
  })()

  if (signals.length === 0) return 0
  return Math.round((signals.filter(Boolean).length / signals.length) * 100)
}
