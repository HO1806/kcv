import type { BaseCV, ChangeEntry, EnhancedExperience, Profile } from '../types'

/**
 * Computes a list of changed fields between a base CV and its Gemini-adapted version.
 * Pure client-side diff — no extra Gemini call required.
 */
export function computeChangeLog(
  baseCV: BaseCV,
  adapted: { adaptedSummary: string; adaptedExperience: EnhancedExperience[] },
  profile?: Profile | null
): ChangeEntry[] {
  const entries: ChangeEntry[] = []

  // Summary diff
  if (baseCV.enhancedSummary.trim() !== adapted.adaptedSummary.trim()) {
    entries.push({
      field: 'summary',
      before: baseCV.enhancedSummary,
      after: adapted.adaptedSummary,
    })
  }

  // Experience bullets diff (per-experience)
  for (const adaptedExp of adapted.adaptedExperience) {
    const base = baseCV.enhancedExperience.find(
      (e) => e.experienceId === adaptedExp.experienceId
    )
    if (!base) continue

    const baseBullets = base.enhancedBullets.join('\n')
    const adaptedBullets = adaptedExp.enhancedBullets.join('\n')

    if (baseBullets !== adaptedBullets) {
      const exp = profile?.experience.find((e) => e.id === adaptedExp.experienceId)
      entries.push({
        field: 'bullets',
        experienceId: adaptedExp.experienceId,
        role: exp?.role,
        company: exp?.company,
        before: baseBullets,
        after: adaptedBullets,
      })
    }
  }

  return entries
}
