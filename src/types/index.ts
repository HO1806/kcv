export type TemplateId =
  | 'ats-clean'
  | 'bronzor'
  | 'pikachu'
  | 'onyx'
  | 'azurill'
  | 'leafish'

export type LanguageLevel = 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic'
export type SkillCategory = 'technical' | 'tool' | 'soft'
export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
export type AppLanguage = 'fr' | 'en'

export interface Personal {
  name: string
  email: string
  phone: string
  city: string
  linkedin: string
  website: string
  summary: string
  /** Optional headshot, stored as a data URL (base64). Common on Moroccan/French CVs. */
  photo?: string
}

export interface Experience {
  id: string
  company: string
  role: string
  city: string
  startDate: string
  endDate: string
  current: boolean
  bullets: string[]
}

export interface Education {
  id: string
  institution: string
  diploma: string
  city: string
  startDate: string
  endDate: string
  description: string
}

export interface Skill {
  id: string
  name: string
  category: SkillCategory
}

export interface Language {
  id: string
  name: string
  level: LanguageLevel
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
}

export interface AiContext {
  personality: string
  careerGoals: string
  informalBackground: string
  preferences: string
}

export interface Profile {
  id: string
  displayName: string
  createdAt: number
  updatedAt: number
  personal: Personal
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  languages: Language[]
  certifications: Certification[]
  aiContext: AiContext
}

export interface EnhancedExperience {
  experienceId: string
  enhancedBullets: string[]
}

export interface BaseCV {
  kind?: 'base'
  id: string
  profileId: string
  profileHash: string
  templateId: TemplateId
  language: 'fr' | 'en'
  enhancedSummary: string
  enhancedExperience: EnhancedExperience[]
  generatedAt: number
  approvedAt: number | null
}

export interface FitAnalysis {
  score: number
  matchedKeywords: string[]
  missingKeywords: string[]
  summary: string
}

export type ChangeEntry =
  | { field: 'summary'; before: string; after: string }
  | { field: 'bullets'; experienceId: string; role?: string; company?: string; before: string; after: string }

export interface JobApplication {
  kind?: 'application'
  id: string
  profileId: string
  baseCvId: string
  jobUrl: string
  jobDescription: string
  jobTitle: string
  company: string
  fitAnalysis: FitAnalysis | null
  adaptedSummary: string
  adaptedExperience: EnhancedExperience[]
  /** Client-side diff of what Gemini changed vs the base CV. */
  changeLog: ChangeEntry[]
  coverLetter: string
  templateId: TemplateId
  status: ApplicationStatus
  createdAt: number
  appliedAt: number | null
}

export function isJobApplication(cv: BaseCV | JobApplication): cv is JobApplication {
  // Prefer the explicit discriminator when present; fall back to structural check
  // for records created before the kind field was introduced.
  if (cv.kind !== undefined) return cv.kind === 'application'
  return 'adaptedExperience' in cv
}

export interface CustomTemplate {
  id: string
  name: string
  html: string
  createdAt: number
}

export interface AppSettings {
  id: 'singleton'
  geminiApiKey: string
  defaultLanguage: AppLanguage
  defaultTemplateId: TemplateId
  /** Number of Gemini API calls made today. Resets when the day rolls over (see geminiQuotaResetAt). */
  geminiQuotaUsed: number
  /** Day-bucket marker (YYYY-MM-DD in UTC). When the current day differs, geminiQuotaUsed resets to 0. */
  geminiQuotaResetAt: string
}
