'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ServiceRequestForm } from '@/components/ServiceRequestForm'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SplashScreen } from '@/components/SplashScreen'

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header Minimalista */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image 
                  src="/assets/logotipo.svg" 
                  alt="Senhor Natureza" 
                  width={40} 
                  height={40}
                  className="w-10 h-10"
                />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Senhor Natureza
                  </h1>
                  <p className="text-xs text-gray-500">Jardinagem e Paisagismo</p>
                </div>
              </div>
              <Link 
                href="/admin" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-light text-gray-900">
                Solicite um serviço
              </h2>
              <p className="text-sm text-gray-500">
                Preencha o formulário e entraremos em contato
              </p>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
              <ServiceRequestForm />
            </div>
          </div>
        </main>

        {/* Footer Minimalista */}
        <footer className="border-t border-gray-100 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-xs text-gray-400">
              © 2024 Senhor Natureza. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
