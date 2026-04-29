import { z } from 'zod'

/**
 * Runtime validators for Gemini responses. All AI output is treated as untrusted —
 * we narrow `unknown` into a typed shape before persisting or rendering.
 */

export const enhancedExperienceSchema = z.object({
  experienceId: z.string(),
  enhancedBullets: z.array(z.string()),
})

export const baseCvAiResponseSchema = z.object({
  enhancedSummary: z.string(),
  enhancedExperience: z.array(enhancedExperienceSchema),
})

export const fitAnalysisSchema = z.object({
  score: z.number(),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  summary: z.string(),
})

export const adaptedCvAiResponseSchema = z.object({
  adaptedSummary: z.string(),
  adaptedExperience: z.array(enhancedExperienceSchema),
})

export const jobInfoExtractionSchema = z.object({
  title: z.string(),
  company: z.string(),
  language: z.union([z.literal('fr'), z.literal('en')]),
})

export type BaseCvAiResponse = z.infer<typeof baseCvAiResponseSchema>
export type AdaptedCvAiResponse = z.infer<typeof adaptedCvAiResponseSchema>
export type JobInfoExtraction = z.infer<typeof jobInfoExtractionSchema>

/** Backup file payload schema, used by importAllData. */
export const backupPayloadSchema = z.object({
  profiles: z.array(z.unknown()).optional(),
  baseCvs: z.array(z.unknown()).optional(),
  applications: z.array(z.unknown()).optional(),
  settings: z.array(z.unknown()).optional(),
  customTemplates: z.array(z.unknown()).optional(),
})

/**
 * Parse a JSON string with a Zod schema, throwing a descriptive Error
 * suitable for parseGeminiError() to format for the UI.
 */
export function parseAiJson<T>(rawText: string, schema: z.ZodType<T>, label: string): T {
  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(rawText)
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    throw new Error(`AI response shape invalid: ${label} — JSON parse failed (${detail})`, { cause: err })
  }
  const result = schema.safeParse(parsedJson)
  if (!result.success) {
    const issue = result.error.issues[0]
    const path = issue?.path?.join('.') || '<root>'
    const message = issue?.message || 'unknown validation error'
    throw new Error(`AI response shape invalid: ${label} — ${path}: ${message}`)
  }
  return result.data
}
