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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  const tabs = [
    { id: 'requests' as Tab, label: 'Solicitações' },
    { id: 'bookings' as Tab, label: 'Agendamentos' },
    { id: 'services' as Tab, label: 'Serviços' },
    { id: 'hours' as Tab, label: 'Horários' },
    { id: 'dayoffs' as Tab, label: 'Dias de Folga' },
    { id: 'financeiro' as Tab, label: 'Financeiro' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold animated-gradient truncate">
                Senhor Natureza
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">Área Administrativa</p>
            </div>
            <div className="flex gap-2 sm:gap-4 items-center flex-shrink-0">
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 font-medium transition-colors text-xs sm:text-sm px-2 sm:px-0"
              >
                <span className="hidden sm:inline">Sair</span>
                <span className="sm:hidden">Sair</span>
              </button>
              <Link
                href="/"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">← Voltar ao site</span>
                <span className="sm:hidden">← Site</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
          {/* Mobile Menu Button */}
          <div className="lg:hidden border-b border-gray-700">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-gray-300 hover:text-gray-100 transition-colors"
            >
              <span className="font-medium">
                {tabs.find(t => t.id === activeTab)?.label || 'Menu'}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
              <div className="border-t border-gray-700 bg-gray-800/80">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full px-4 py-3 text-left font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'text-emerald-400 bg-gray-700/50'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Tabs */}
          <div className="hidden lg:block border-b border-gray-700">
            <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 xl:px-6 py-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
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

