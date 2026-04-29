import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Profile, BaseCV, EnhancedExperience, FitAnalysis } from '../types'
import { generateId } from '../lib/utils'
import {
  baseCvAiResponseSchema,
  fitAnalysisSchema,
  adaptedCvAiResponseSchema,
  jobInfoExtractionSchema,
  parseAiJson,
} from '../lib/aiSchemas'

const COVER_LETTER_MAX_CHARS = 4000

async function incrementGeminiQuota(): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD UTC
    const { db } = await import('../db')
    const settings = await db.settings.get('singleton')
    if (!settings) return
    const sameDay = settings.geminiQuotaResetAt === today
    const next: typeof settings = {
      ...settings,
      geminiQuotaResetAt: today,
      geminiQuotaUsed: (sameDay ? (settings.geminiQuotaUsed ?? 0) : 0) + 1,
    }
    await db.settings.put(next)
  } catch {
    // best-effort — ignore failures
  }
}

function getClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })
}

function buildProfileContext(profile: Profile): string {
  const { personal, experience, education, skills, languages, aiContext } = profile
  return `
CANDIDATE PROFILE:
Name: ${personal.name}
Location: ${personal.city}
Languages: ${languages.map((l) => `${l.name} (${l.level})`).join(', ')}

EDUCATION:
${education.map((e) => `- ${e.diploma} — ${e.institution} (${e.startDate} to ${e.endDate})`).join('\n')}

EXPERIENCE:
${experience.map((e) => `- ${e.role} at ${e.company} (${e.startDate} to ${e.current ? 'Present' : e.endDate})\n  Tasks: ${e.bullets.join('; ')}`).join('\n')}

SKILLS:
Technical: ${skills.filter((s) => s.category === 'technical').map((s) => s.name).join(', ')}
Tools: ${skills.filter((s) => s.category === 'tool').map((s) => s.name).join(', ')}
Soft skills: ${skills.filter((s) => s.category === 'soft').map((s) => s.name).join(', ')}

RAW SUMMARY: ${personal.summary}

AI CONTEXT (hidden, never print on CV — use only to improve tone/emphasis):
Personality: ${aiContext.personality}
Career Goals: ${aiContext.careerGoals}
Informal Background: ${aiContext.informalBackground}
Preferences: ${aiContext.preferences}
`.trim()
}

export async function generateBaseCV(
  apiKey: string,
  profile: Profile,
  language: 'fr' | 'en',
  profileHash: string
): Promise<Omit<BaseCV, 'id' | 'templateId'>> {
  const model = getClient(apiKey)
  const lang = language === 'fr' ? 'French' : 'English'

  const prompt = `
You are an expert CV writer specializing in Moroccan job market (Rabat region).
Write an ATS-optimized CV in ${lang} for this candidate.

${buildProfileContext(profile)}

SACRED FIELDS (never change): company names, job titles held, diploma names, institutions, dates, city names, personal contact details.

TASK: Return JSON with this exact structure:
{
  "enhancedSummary": "2-3 sentence professional profile statement. Strong, specific, keyword-rich for B2C/retail/FMCG/sales roles.",
  "enhancedExperience": [
    {
      "experienceId": "<copy exact id from profile>",
      "enhancedBullets": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ]
}

Rules:
- Write 3-5 strong action-verb bullets per experience
- Use keywords: vente, prospection, fidélisation, client, objectifs, terrain, merchandising, animation commerciale, CRM (when appropriate)
- Quantify achievements even with estimates (e.g. "géré +20 clients/jour")
- Keep bullets under 15 words each
- Match language to ${lang}
- Never invent companies, titles, or dates
- Use AI Context to improve emphasis and tone, not to add fake facts
`

  await incrementGeminiQuota()
  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const parsed = parseAiJson(text, baseCvAiResponseSchema, 'base CV')

  return {
    kind: 'base' as const,
    profileId: profile.id,
    profileHash,
    language,
    enhancedSummary: parsed.enhancedSummary,
    enhancedExperience: parsed.enhancedExperience,
    generatedAt: Date.now(),
    approvedAt: null,
  }
}

export async function analyzeJobFit(
  apiKey: string,
  profile: Profile,
  jobDescription: string
): Promise<FitAnalysis> {
  const model = getClient(apiKey)

  const prompt = `
Analyze the fit between this candidate and job description.

${buildProfileContext(profile)}

JOB DESCRIPTION:
${jobDescription}

Return JSON:
{
  "score": <0-100 integer>,
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "summary": "2 sentences explaining the fit and main gaps."
}
`

  await incrementGeminiQuota()
  const result = await model.generateContent(prompt)
  return parseAiJson(result.response.text(), fitAnalysisSchema, 'fit analysis') satisfies FitAnalysis
}

export async function adaptCVToJob(
  apiKey: string,
  profile: Profile,
  baseCV: BaseCV,
  jobDescription: string,
  language: 'fr' | 'en'
): Promise<{ adaptedSummary: string; adaptedExperience: EnhancedExperience[] }> {
  const model = getClient(apiKey)
  const lang = language === 'fr' ? 'French' : 'English'

  const baseBullets = baseCV.enhancedExperience
    .map((e) => {
      const exp = profile.experience.find((x) => x.id === e.experienceId)
      return `Experience: ${exp?.role} at ${exp?.company}\nBullets: ${e.enhancedBullets.join('; ')}`
    })
    .join('\n\n')

  const prompt = `
You are adapting an existing CV for a specific job. Make ONLY minor changes to maximize fit.

BASE CV SUMMARY: ${baseCV.enhancedSummary}

BASE CV EXPERIENCE BULLETS:
${baseBullets}

JOB DESCRIPTION:
${jobDescription}

SACRED (never change): company names, job titles, diploma names, institutions, dates, cities, contact info.

ALLOWED changes:
- Reorder bullet points to lead with most relevant ones
- Swap synonyms for job-specific keywords (e.g. "client" → "clientèle", "vente" → "prospection")
- Tweak phrasing to echo exact terms from the job description
- Adjust the summary to reflect the target role title

NOT allowed:
- Add new experiences, companies, or skills that don't exist in the profile
- Change dates or locations
- Invent metrics not present in the original

Return JSON:
{
  "adaptedSummary": "updated summary string",
  "adaptedExperience": [
    {
      "experienceId": "<same id>",
      "enhancedBullets": ["bullet 1", "bullet 2"]
    }
  ]
}

Language: ${lang}
`

  await incrementGeminiQuota()
  const result = await model.generateContent(prompt)
  const parsed = parseAiJson(result.response.text(), adaptedCvAiResponseSchema, 'adapted CV')
  return {
    adaptedSummary: parsed.adaptedSummary,
    adaptedExperience: parsed.adaptedExperience satisfies EnhancedExperience[],
  }
}

export async function generateCoverLetter(
  apiKey: string,
  profile: Profile,
  jobDescription: string,
  jobTitle: string,
  company: string,
  language: 'fr' | 'en'
): Promise<string> {
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-2.5-flash' })

  const lang = language === 'fr' ? 'French' : 'English'
  const today = new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })

  const prompt = `
Write a professional cover letter in ${lang} for this candidate applying to: ${jobTitle} at ${company}.
Today's date: ${today}. Use this exact date in the letter header. Do NOT emit any placeholder like [Date actuelle] or [Today's Date].

${buildProfileContext(profile)}

JOB DESCRIPTION:
${jobDescription}

Rules:
- 3 paragraphs: hook + why I fit + call to action
- Natural, professional tone — not robotic
- Reference 2-3 specific details from the job description
- Under 250 words
- Return plain text only (no JSON, no markdown)
`

  await incrementGeminiQuota()
  const result = await model.generateContent(prompt)
  const text = result.response.text()
  if (text.length > COVER_LETTER_MAX_CHARS) {
    if (import.meta.env.DEV) {
      console.warn(`Cover letter truncated from ${text.length} to ${COVER_LETTER_MAX_CHARS} chars`)
    }
    return text.slice(0, COVER_LETTER_MAX_CHARS)
  }
  return text
}

export async function extractJobInfo(
  apiKey: string,
  text: string
): Promise<{ title: string; company: string; language: 'fr' | 'en' }> {
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const prompt = `
Extract from this job posting text:
- Job title
- Company name
- Language (fr or en)

Text: ${text.slice(0, 2000)}

Return JSON: { "title": "...", "company": "...", "language": "fr" | "en" }
`

  await incrementGeminiQuota()
  const result = await model.generateContent(prompt)
  return parseAiJson(result.response.text(), jobInfoExtractionSchema, 'job info extraction')
}

export { generateId }
