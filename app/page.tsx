import Link from 'next/link'
import { ServiceRequestForm } from '@/components/ServiceRequestForm'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function Home() {
  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold animated-gradient">
            Senhor Natureza
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Jardinagem e Paisagismo</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-100 mb-4 sm:mb-6">
            Solicite um serviço
          </h2>
          <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
            Preencha o formulário abaixo para solicitar um serviço. O autônomo avaliará sua solicitação e entrará em contato.
          </p>
          <ServiceRequestForm />
        </div>
      </main>

      <footer className="mt-8 sm:mt-16 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center text-gray-400">
          <p className="text-sm sm:text-base">© 2024 Senhor Natureza. Todos os direitos reservados.</p>
          <Link href="/admin" className="text-emerald-400 hover:text-emerald-300 mt-2 inline-block transition-colors text-sm sm:text-base">
            Área Administrativa
          </Link>
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  )
}

