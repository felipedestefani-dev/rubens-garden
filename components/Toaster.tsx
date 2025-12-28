'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-center" 
      richColors 
      closeButton 
      toastOptions={{
        classNames: {
          toast: 'bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800',
          title: 'text-gray-900 dark:text-gray-100',
          description: 'text-gray-500 dark:text-gray-400',
          actionButton: 'bg-emerald-600 hover:bg-emerald-700',
          cancelButton: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
        },
      }}
    />
  )
}

