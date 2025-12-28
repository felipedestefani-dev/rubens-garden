'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ServicesAdmin } from '@/components/admin/ServicesAdmin'
import { WorkingHoursAdmin } from '@/components/admin/WorkingHoursAdmin'
import { DayOffsAdmin } from '@/components/admin/DayOffsAdmin'
import { BookingsAdmin } from '@/components/admin/BookingsAdmin'
import { ServiceRequestsAdmin } from '@/components/admin/ServiceRequestsAdmin'
import { FinanceiroAdmin } from '@/components/admin/FinanceiroAdmin'
import { useTheme } from '@/components/ThemeProvider'
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

interface DashboardStats {
  pendingRequests: number
  totalRequests: number
  todayBookings: number
  confirmedBookings: number
  totalRevenue: number
  activeServices: number
  totalServices: number
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchDashboardStats()
    }
  }, [activeSection])

  async function fetchDashboardStats() {
    try {
      setLoadingStats(true)
      
      // Buscar solicitações
      const requestsRes = await fetch('/api/admin/requests')
      const requests = requestsRes.ok ? await requestsRes.json() : []
      
      // Buscar agendamentos
      const bookingsRes = await fetch('/api/admin/bookings')
      const bookings = bookingsRes.ok ? await bookingsRes.json() : []
      
      // Buscar serviços
      const servicesRes = await fetch('/api/admin/services')
      const services = servicesRes.ok ? await servicesRes.json() : []
      
      // Calcular estatísticas
      const pendingRequests = Array.isArray(requests) ? requests.filter((r: any) => r.status === 'pending').length : 0
      const totalRequests = Array.isArray(requests) ? requests.length : 0
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const todayBookings = Array.isArray(bookings) 
        ? bookings.filter((b: any) => {
            const bookingDate = new Date(b.date)
            return bookingDate >= today && bookingDate < tomorrow
          }).length 
        : 0
      
      const confirmedBookings = Array.isArray(bookings) 
        ? bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'completed').length 
        : 0
      
      const totalRevenue = Array.isArray(bookings)
        ? bookings
            .filter((b: any) => b.status === 'completed' || b.status === 'confirmed')
            .reduce((sum: number, b: any) => sum + (b.price || 0), 0)
        : 0
      
      const activeServices = Array.isArray(services) 
        ? services.filter((s: any) => s.active).length 
        : 0
      const totalServices = Array.isArray(services) ? services.length : 0
      
      setStats({
        pendingRequests,
        totalRequests,
        todayBookings,
        confirmedBookings,
        totalRevenue,
        activeServices,
        totalServices,
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const dashboardCards: DashboardCard[] = [
    {
      id: 'requests',
      title: 'Solicitações',
      description: 'Gerenciar solicitações de serviços dos clientes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-gray-700',
      bgColor: 'bg-white hover:bg-gray-50',
    },
    {
      id: 'bookings',
      title: 'Agendamentos',
      description: 'Visualizar e gerenciar agendamentos confirmados',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-gray-700',
      bgColor: 'bg-white hover:bg-gray-50',
    },
    {
      id: 'services',
      title: 'Serviços',
      description: 'Cadastrar e editar serviços oferecidos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-gray-700',
      bgColor: 'bg-white hover:bg-gray-50',
    },
    {
      id: 'hours',
      title: 'Horários',
      description: 'Configurar horários de funcionamento',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-gray-700',
      bgColor: 'bg-white hover:bg-gray-50',
    },
    {
      id: 'dayoffs',
      title: 'Folgas',
      description: 'Gerenciar dias de folga e feriados',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-gray-700',
      bgColor: 'bg-white hover:bg-gray-50',
    },
    {
      id: 'financeiro',
      title: 'Financeiro',
      description: 'Acompanhar receitas e finanças',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-gray-700',
      bgColor: 'bg-white hover:bg-gray-50',
    },
  ]

  const getSectionTitle = () => {
    const card = dashboardCards.find(c => c.id === activeSection)
    return card?.title || 'Dashboard'
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image 
                src="/assets/logotipo.svg" 
                alt="Senhor Natureza" 
                width={36} 
                height={36}
                className="w-9 h-9"
              />
              <div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {activeSection === 'dashboard' ? 'Dashboard' : getSectionTitle()}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Senhor Natureza</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              {activeSection !== 'dashboard' && (
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Voltar
                </button>
              )}
              <Link
                href="/"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Site
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeSection === 'dashboard' ? (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Visão Geral</h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">Resumo do seu negócio</p>
              </div>
            </div>

            {/* Stats Cards - Modern Design */}
            {loadingStats ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-32 mb-2 sm:mb-4"></div>
                    <div className="h-6 sm:h-8 lg:h-10 bg-gray-200 rounded w-16 sm:w-24"></div>
                  </div>
                ))}
              </div>
            ) : stats && (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {/* Solicitações Pendentes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group cursor-pointer" onClick={() => setActiveSection('requests')}>
                  <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">Solicitações Pendentes</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1">{stats.pendingRequests}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">de {stats.totalRequests} total</p>
                  </div>
                </div>

                {/* Agendamentos Hoje */}
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group cursor-pointer" onClick={() => setActiveSection('bookings')}>
                  <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">Agendamentos Hoje</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1">{stats.todayBookings}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stats.confirmedBookings} confirmados</p>
                  </div>
                </div>

                {/* Receita Total */}
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group cursor-pointer" onClick={() => setActiveSection('financeiro')}>
                  <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">Receita Total</p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1 leading-tight">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Confirmados + Concluídos</p>
                  </div>
                </div>

                {/* Serviços Ativos */}
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group cursor-pointer" onClick={() => setActiveSection('services')}>
                  <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">Serviços Ativos</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1">{stats.activeServices}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">de {stats.totalServices} cadastrados</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Section */}
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Ações Rápidas</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">Acesse rapidamente as principais áreas</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {dashboardCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setActiveSection(card.id)}
                    className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors">
                        {card.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                          {card.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {card.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6">
              {activeSection === 'requests' && <ServiceRequestsAdmin />}
              {activeSection === 'bookings' && <BookingsAdmin />}
              {activeSection === 'services' && <ServicesAdmin />}
              {activeSection === 'hours' && <WorkingHoursAdmin />}
              {activeSection === 'dayoffs' && <DayOffsAdmin />}
              {activeSection === 'financeiro' && <FinanceiroAdmin />}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
