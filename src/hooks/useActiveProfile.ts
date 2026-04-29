import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getOrCreateActiveProfile, SINGLETON_PROFILE_ID } from '../db'
import type { Profile } from '../types'

/**
 * Returns the active (singleton) profile and its id, auto-creating the seed
 * row on first run.
 *
 * Returns `{ profile: null, id: null, loading: true }` until the first read
 * resolves. After that, both fields are guaranteed populated and the
 * underlying live query keeps `profile` in sync with Dexie writes.
 */
export function useActiveProfile(): { profile: Profile | null; id: string | null; loading: boolean } {
  const [seeded, setSeeded] = useState(false)

  // First effect: create the singleton row if missing. Runs once.
  useEffect(() => {
    let cancelled = false
    getOrCreateActiveProfile().then(() => {
      if (!cancelled) setSeeded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Live query: returns the singleton row, or — for migrated data — the
  // most-recently-updated row if no singleton exists yet.
  const profile = useLiveQuery(async () => {
    const direct = await db.profiles.get(SINGLETON_PROFILE_ID)
    if (direct) return direct
    const all = await db.profiles.toArray()
    if (all.length === 0) return null
    return all.reduce((latest, p) => (p.updatedAt > latest.updatedAt ? p : latest), all[0])
  }, [seeded])

  return {
    profile: profile ?? null,
    id: profile?.id ?? null,
    loading: !seeded || profile === undefined,
  }
}
