import { useEffect } from 'react'
import { useThemeStore } from '@/stores/themeStore'

export function useTheme() {
  const { dark, toggle } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return { dark, toggle }
}
