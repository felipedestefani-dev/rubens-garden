'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ServiceRequestForm } from '@/components/ServiceRequestForm'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SplashScreen } from '@/components/SplashScreen'
import { useTheme } from '@/components/ThemeProvider'

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const { theme, toggleTheme } = useTheme()

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-black flex flex-col transition-colors">
        {/* Header Minimalista - Mobile Optimized */}
        <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-900 transition-colors">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Image 
                  src="/assets/logotipo.svg" 
                  alt="Senhor Natureza" 
                  width={48} 
                  height={48}
                  className="w-12 h-12 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    Senhor Natureza
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Jardinagem e Paisagismo</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  aria-label="Alternar tema"
                >
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Admin</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Mobile Optimized */}
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 lg:px-8 py-8 lg:py-12">
          <div className="space-y-6 lg:space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100">
                Solicite um serviço
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Preencha o formulário e entraremos em contato
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 lg:p-8 shadow-sm">
              <ServiceRequestForm />
            </div>
          </div>
        </main>

        {/* Footer Minimalista - Mobile Optimized */}
        <footer className="border-t border-gray-100 dark:border-gray-900 mt-auto">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              © 2024 Senhor Natureza. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
