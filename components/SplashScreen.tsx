'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onComplete()
      }, 300) // Aguarda a animação de fade out
    }, 2000) // Mostra por 2 segundos

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/assets/logotipo.svg"
          alt="Senhor Natureza"
          width={120}
          height={120}
          className="w-24 h-24 sm:w-32 sm:h-32"
          priority
        />
        <div className="h-1 w-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gray-500 dark:bg-gray-400 rounded-full animate-progress" />
        </div>
      </div>
    </div>
  )
}

