import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'
type Language = 'fr' | 'en'
export type EditorSection = 'personal' | 'experience' | 'education' | 'skills' | 'languages' | 'certifications' | 'aiContext'

interface AppState {
  activeProfileId: string | null
  theme: Theme
  language: Language
  editorSection: EditorSection
  setActiveProfileId: (id: string | null) => void
  setTheme: (theme: Theme) => void
  setLanguage: (lang: Language) => void
  setEditorSection: (s: EditorSection) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeProfileId: null,
      theme: 'system',
      language: 'fr',
      editorSection: 'personal',
      setActiveProfileId: (id) => set({ activeProfileId: id }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setEditorSection: (editorSection) => set({ editorSection }),
    }),
    { name: 'cv-builder-ui' }
  )
)
