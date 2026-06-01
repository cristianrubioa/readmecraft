import { useState, useEffect } from 'react'

const KEY = 'readmecraft-theme'

export function useDarkMode(): [boolean, (v: boolean | ((prev: boolean) => boolean)) => void] {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored) return stored === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try {
      localStorage.setItem(KEY, isDark ? 'dark' : 'light')
    } catch {}
  }, [isDark])

  return [isDark, setIsDark]
}
