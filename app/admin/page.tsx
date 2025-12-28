'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ServicesAdmin } from '@/components/admin/ServicesAdmin'
import { WorkingHoursAdmin } from '@/components/admin/WorkingHoursAdmin'
import { DayOffsAdmin } from '@/components/admin/DayOffsAdmin'
import { BookingsAdmin } from '@/components/admin/BookingsAdmin'
import { ServiceRequestsAdmin } from '@/components/admin/ServiceRequestsAdmin'
import { FinanceiroAdmin } from '@/components/admin/FinanceiroAdmin'
import Link from 'next/link'

type Tab = 'services' | 'hours' | 'dayoffs' | 'bookings' | 'requests' | 'financeiro'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('requests')
  const router = useRouter()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold animated-gradient">
                Senhor Natureza
              </h1>
              <p className="text-sm text-gray-400">Área Administrativa</p>
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 font-medium transition-colors text-sm"
              >
                Sair
              </button>
              <Link
                href="/"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                ← Voltar ao site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                  activeTab === 'requests'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                Solicitações
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                  activeTab === 'bookings'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                Agendamentos
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                  activeTab === 'services'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                Serviços
              </button>
              <button
                onClick={() => setActiveTab('hours')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                  activeTab === 'hours'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                Horários
              </button>
              <button
                onClick={() => setActiveTab('dayoffs')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                  activeTab === 'dayoffs'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                Dias de Folga
              </button>
              <button
                onClick={() => setActiveTab('financeiro')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                  activeTab === 'financeiro'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                Financeiro
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'requests' && <ServiceRequestsAdmin />}
            {activeTab === 'bookings' && <BookingsAdmin />}
            {activeTab === 'services' && <ServicesAdmin />}
            {activeTab === 'hours' && <WorkingHoursAdmin />}
            {activeTab === 'dayoffs' && <DayOffsAdmin />}
            {activeTab === 'financeiro' && <FinanceiroAdmin />}
          </div>
        </div>
      </main>
    </div>
  )
}

