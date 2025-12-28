import Link from 'next/link'
import { ServiceRequestForm } from '@/components/ServiceRequestForm'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function Home() {
  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
          <h1 className="text-xl sm:text-3xl font-bold animated-gradient">
            Senhor Natureza
          </h1>
          <p className="text-gray-600 mt-0.5 text-xs sm:text-base">Jardinagem e Paisagismo</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-12 flex-1 w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 sm:p-8">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-4">
            Solicite um serviço
          </h2>
          <p className="text-gray-600 mb-3 sm:mb-6 text-xs sm:text-base">
            Preencha o formulário abaixo para solicitar um serviço.
          </p>
          <ServiceRequestForm />
        </div>
      </main>

      <footer className="mt-4 sm:mt-8 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 text-center text-gray-600">
          <p className="text-xs sm:text-base">© 2024 Senhor Natureza</p>
          <Link href="/admin" className="text-emerald-600 hover:text-emerald-700 mt-1 inline-block transition-colors text-xs sm:text-base">
            Área Administrativa
          </Link>
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  )
}

