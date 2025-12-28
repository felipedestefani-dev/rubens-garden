'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Só executar no cliente
    if (typeof window === 'undefined') return

    // Ler tema do localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null
    
    let initialTheme: Theme = 'light'
    
    if (savedTheme === 'dark' || savedTheme === 'light') {
      initialTheme = savedTheme
    } else {
      // Se não há tema salvo, usar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      initialTheme = prefersDark ? 'dark' : 'light'
    }
    
    // Aplicar tema inicial no DOM
    const html = document.documentElement
    if (initialTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    
    // Atualizar estado
    setTheme(initialTheme)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (typeof window === 'undefined') return
    
    const html = document.documentElement
    const currentIsDark = html.classList.contains('dark')
    const newIsDark = !currentIsDark
    const newTheme: Theme = newIsDark ? 'dark' : 'light'
    
    // Atualizar DOM imediatamente
    if (newIsDark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    
    // Atualizar estado
    setTheme(newTheme)
    
    // Atualizar localStorage
    try {
      localStorage.setItem('theme', newTheme)
    } catch (e) {
      // Ignorar erros de localStorage
    }
  }

  // Sempre fornecer o contexto
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

