import type { ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { SettingsContext } from './SettingsContext'

interface Props {
  children: ReactNode
}

export function SettingsProvider({ children }: Props) {
  const settings = useLiveQuery(() => db.settings.get('singleton'), [])

  return (
    <SettingsContext.Provider value={{ settings }}>
      {children}
    </SettingsContext.Provider>
  )
}
