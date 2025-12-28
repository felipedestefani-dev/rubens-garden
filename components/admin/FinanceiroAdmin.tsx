'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Booking {
  id: string
  clientName: string
  date: string
  time: string
  status: string
  price: number | null
  service: {
    id: string
    name: string
  }
}

export function FinanceiroAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterDate, setFilterDate] = useState<string>('')

  useEffect(() => {
    fetchBookings()
  }, [filterStatus, filterDate])

  async function fetchBookings() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus) params.append('status', filterStatus)
      if (filterDate) params.append('date', filterDate)

      const response = await fetch(`/api/admin/bookings?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar agendamentos')
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setBookings(data)
      } else {
        console.error('Resposta da API não é um array:', data)
        setBookings([])
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  function getStatusConfig(status: string) {
    switch (status) {
      case 'pending':
        return {
          label: 'Pendente',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
        }
      case 'confirmed':
        return {
          label: 'Confirmado',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
        }
      case 'cancelled':
        return {
          label: 'Cancelado',
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
        }
      case 'completed':
        return {
          label: 'Concluído',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
        }
      default:
        return {
          label: status,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
        }
    }
  }

  function formatCurrency(value: number | null): string {
    if (!value) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const safeBookings = Array.isArray(bookings) ? bookings : []
  
  const totalRevenue = safeBookings
    .filter((b) => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.price || 0), 0)

  const pendingRevenue = safeBookings
    .filter((b) => b.status === 'pending')
    .reduce((sum, b) => sum + (b.price || 0), 0)

  const completedCount = safeBookings.filter((b) => b.status === 'completed').length
  const confirmedCount = safeBookings.filter((b) => b.status === 'confirmed').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-500 text-sm">Carregando dados financeiros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Financeiro</h2>
        <p className="text-sm text-gray-500 mt-1">Acompanhe receitas e agendamentos</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-emerald-700">Receita Total</p>
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-emerald-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-emerald-600 mt-1">Confirmados + Concluídos</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-amber-700">Receita Pendente</p>
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-amber-900">{formatCurrency(pendingRevenue)}</p>
          <p className="text-xs text-amber-600 mt-1">Aguardando confirmação</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-700">Concluídos</p>
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-blue-900">{completedCount}</p>
          <p className="text-xs text-blue-600 mt-1">Serviços concluídos</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-700">Confirmados</p>
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-purple-900">{confirmedCount}</p>
          <p className="text-xs text-purple-600 mt-1">Aguardando conclusão</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Agendamentos com Valores</h3>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="cancelled">Cancelado</option>
            <option value="completed">Concluído</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Bookings Cards */}
      {safeBookings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 font-medium">Nenhum agendamento encontrado</p>
          <p className="text-gray-400 text-sm mt-1">
            {filterStatus || filterDate ? 'Tente alterar os filtros' : 'Os agendamentos aparecerão aqui'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status)
            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 hover:border-gray-300"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Service */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Serviço</p>
                  <p className="text-sm font-semibold text-gray-900">{booking.service.name}</p>
                </div>

                {/* Client */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Cliente</p>
                  <p className="text-sm font-medium text-gray-900">{booking.clientName}</p>
                </div>

                {/* Date & Time */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Data e Horário</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {format(new Date(booking.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{booking.time}</p>
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Valor</p>
                  <p className={`text-lg font-bold ${
                    booking.price ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {booking.price ? formatCurrency(booking.price) : 'Não informado'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
