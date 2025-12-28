'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ServicesAdmin } from '@/components/admin/ServicesAdmin'
import { WorkingHoursAdmin } from '@/components/admin/WorkingHoursAdmin'
import { DayOffsAdmin } from '@/components/admin/DayOffsAdmin'
import { BookingsAdmin } from '@/components/admin/BookingsAdmin'
import { ServiceRequestsAdmin } from '@/components/admin/ServiceRequestsAdmin'
import { FinanceiroAdmin } from '@/components/admin/FinanceiroAdmin'
import Link from 'next/link'

type Section = 'dashboard' | 'services' | 'hours' | 'dayoffs' | 'bookings' | 'requests' | 'financeiro'

interface DashboardCard {
  id: Section
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard')
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

  const dashboardCards: DashboardCard[] = [
    {
      id: 'requests',
      title: 'Solicitações',
      description: 'Gerenciar solicitações de serviços dos clientes',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      id: 'bookings',
      title: 'Agendamentos',
      description: 'Visualizar e gerenciar agendamentos confirmados',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    },
    {
      id: 'services',
      title: 'Serviços',
      description: 'Cadastrar e editar serviços oferecidos',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
    {
      id: 'hours',
      title: 'Horários',
      description: 'Configurar horários de funcionamento',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
    },
    {
      id: 'dayoffs',
      title: 'Folgas',
      description: 'Gerenciar dias de folga e feriados',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
    },
    {
      id: 'financeiro',
      title: 'Financeiro',
      description: 'Acompanhar receitas e finanças',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
  ]

  const getSectionTitle = () => {
    const card = dashboardCards.find(c => c.id === activeSection)
    return card?.title || 'Dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
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
                  {activeSection === 'dashboard' ? 'Dashboard' : getSectionTitle()}
                </h1>
                <p className="text-xs text-gray-500">Senhor Natureza</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {activeSection !== 'dashboard' && (
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Voltar
                </button>
              )}
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Site
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'dashboard' ? (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo ao Painel Admin</h2>
              <p className="text-gray-600">Selecione uma opção para gerenciar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setActiveSection(card.id)}
                  className={`${card.bgColor} ${card.color} p-6 rounded-2xl border-2 border-transparent hover:border-current transition-all transform hover:scale-105 shadow-sm hover:shadow-md text-left group`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${card.color} flex-shrink-0`}>
                      {card.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform">
                        {card.title}
                      </h3>
                      <p className="text-sm opacity-80">
                        {card.description}
                      </p>
                    </div>
                    <div className={`${card.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            {activeSection === 'requests' && <ServiceRequestsAdmin />}
            {activeSection === 'bookings' && <BookingsAdmin />}
            {activeSection === 'services' && <ServicesAdmin />}
            {activeSection === 'hours' && <WorkingHoursAdmin />}
            {activeSection === 'dayoffs' && <DayOffsAdmin />}
            {activeSection === 'financeiro' && <FinanceiroAdmin />}
          </div>
        )}
      </main>
    </div>
  )
}
