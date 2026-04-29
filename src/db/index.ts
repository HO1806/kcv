import Dexie, { type EntityTable } from 'dexie'
import type { Profile, BaseCV, JobApplication, AppSettings, CustomTemplate } from '../types'
import { backupPayloadSchema } from '../lib/aiSchemas'

/** Stable id for the singleton profile (single-profile architecture). */
export const SINGLETON_PROFILE_ID = 'me'

/** A blank profile used as the seed for the singleton row on first run. */
function blankProfile(id: string): Profile {
  const now = Date.now()
  return {
    id,
    displayName: 'Mon profil',
    createdAt: now,
    updatedAt: now,
    personal: {
      name: '',
      email: '',
      phone: '',
      city: '',
      linkedin: '',
      website: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    aiContext: { personality: '', careerGoals: '', informalBackground: '', preferences: '' },
  }
}

class CvDatabase extends Dexie {
  profiles!: EntityTable<Profile, 'id'>
  baseCvs!: EntityTable<BaseCV, 'id'>
  applications!: EntityTable<JobApplication, 'id'>
  settings!: EntityTable<AppSettings, 'id'>
  customTemplates!: EntityTable<CustomTemplate, 'id'>

  constructor() {
    super('cv-builder')
    this.version(1).stores({
      profiles: 'id, displayName, createdAt',
      baseCvs: 'id, profileId, generatedAt',
      applications: 'id, profileId, baseCvId, status, createdAt',
      settings: 'id',
      customTemplates: 'id, name',
    })
    this.version(2)
      .stores({
        profiles: 'id, displayName, createdAt',
        baseCvs: 'id, profileId, generatedAt',
        applications: 'id, profileId, baseCvId, status, createdAt',
        settings: 'id',
        customTemplates: 'id, name',
      })
      .upgrade(async (tx) => {
        // Backfill geminiQuotaUsed and geminiQuotaResetAt on existing settings rows
        // so the now-required fields are always present. Never drops user data.
        await tx
          .table('settings')
          .toCollection()
          .modify((row: Record<string, unknown>) => {
            if (row['geminiQuotaUsed'] === undefined || row['geminiQuotaUsed'] === null) {
              row['geminiQuotaUsed'] = 0
            }
            if (row['geminiQuotaResetAt'] === undefined || row['geminiQuotaResetAt'] === null) {
              row['geminiQuotaResetAt'] = ''
            }
          })
      })
  }
}

export const db = new CvDatabase()

/**
 * Returns the active (singleton) profile, creating it if missing.
 * Migration-friendly: if older multi-profile data exists, returns the most recently
 * updated row instead of creating a new singleton — avoids losing user data.
 */
export async function getOrCreateActiveProfile(): Promise<Profile> {
  // Prefer the well-known singleton id when it exists.
  const singleton = await db.profiles.get(SINGLETON_PROFILE_ID)
  if (singleton) return singleton

  // Migration path: existing multi-profile users keep their most recent profile.
  const all = await db.profiles.toArray()
  if (all.length > 0) {
    return all.reduce((latest, p) => (p.updatedAt > latest.updatedAt ? p : latest), all[0])
  }

  // Brand new install — seed the singleton.
  const seed = blankProfile(SINGLETON_PROFILE_ID)
  await db.profiles.put(seed)
  return seed
}

/** Returns the active profile id without creating one if it doesn't exist. */
export async function peekActiveProfileId(): Promise<string | null> {
  const singleton = await db.profiles.get(SINGLETON_PROFILE_ID)
  if (singleton) return singleton.id
  const all = await db.profiles.toArray()
  if (all.length === 0) return null
  return all.reduce((latest, p) => (p.updatedAt > latest.updatedAt ? p : latest), all[0]).id
}

export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('singleton')
  if (existing) return existing
  const defaults: AppSettings = {
    id: 'singleton',
    geminiApiKey: '',
    defaultLanguage: 'fr',
    defaultTemplateId: 'ats-clean',
    geminiQuotaUsed: 0,
    geminiQuotaResetAt: '',
  }
  await db.settings.put(defaults)
  return defaults
}

export async function exportAllData(): Promise<string> {
  const [profiles, baseCvs, applications, settingsRaw, customTemplates] = await Promise.all([
    db.profiles.toArray(),
    db.baseCvs.toArray(),
    db.applications.toArray(),
    db.settings.toArray(),
    db.customTemplates.toArray(),
  ])
  // API key never travels in backups
  const settings = settingsRaw.map((row) => ({ ...row, geminiApiKey: '' }))
  return JSON.stringify({ profiles, baseCvs, applications, settings, customTemplates }, null, 2)
}

export async function importAllData(json: string): Promise<void> {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('Backup file structure invalid')
  }
  const validation = backupPayloadSchema.safeParse(raw)
  if (!validation.success) {
    throw new Error('Backup file structure invalid')
  }
  const data = validation.data as {
    profiles?: Profile[]
    baseCvs?: BaseCV[]
    applications?: JobApplication[]
    settings?: AppSettings[]
    customTemplates?: CustomTemplate[]
  }
  await db.transaction('rw', [db.profiles, db.baseCvs, db.applications, db.settings, db.customTemplates], async () => {
    await Promise.all([
      db.profiles.bulkPut(data.profiles ?? []),
      db.baseCvs.bulkPut(data.baseCvs ?? []),
      db.applications.bulkPut(data.applications ?? []),
      db.settings.bulkPut(data.settings ?? []),
      db.customTemplates.bulkPut(data.customTemplates ?? []),
    ])
  })
}
