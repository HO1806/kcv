import { createContext, useContext } from 'react'
import type { AppSettings } from '../types'

export interface SettingsContextValue {
  settings: AppSettings | undefined
}

export const SettingsContext = createContext<SettingsContextValue>({
  settings: undefined,
})

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext)
}
