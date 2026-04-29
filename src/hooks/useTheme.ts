import { useEffect } from 'react'
import { useAppStore } from '../store'

export function useTheme() {
  const { theme, setTheme } = useAppStore()

  useEffect(() => {
    const root = document.documentElement

    const apply = (dark: boolean) => {
      root.classList.toggle('dark', dark)
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches)
      const handler = (e: MediaQueryListEvent) => apply(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }

    apply(theme === 'dark')
  }, [theme])

  return { theme, setTheme }
}
