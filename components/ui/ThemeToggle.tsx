'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'

type Theme = 'dark' | 'light' | 'system'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) {
      setTheme(stored)
      applyTheme(stored)
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', systemDark)
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
  }

  const cycleTheme = () => {
    const themes: Theme[] = ['dark', 'light', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    applyTheme(nextTheme)
  }

  if (!mounted) return null

  const icons = {
    dark: <Moon className="w-4 h-4" />,
    light: <Sun className="w-4 h-4" />,
    system: <Monitor className="w-4 h-4" />
  }

  const labels = {
    dark: 'Dark mode',
    light: 'Light mode',
    system: 'System theme'
  }

  return (
    <button
      onClick={cycleTheme}
      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
      title={labels[theme]}
    >
      {icons[theme]}
    </button>
  )
}

export default ThemeToggle
