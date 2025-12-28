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
      const params = new URLSearchParams()
      if (filterStatus) params.append('status', filterStatus)
      if (filterDate) params.append('date', filterDate)

      const response = await fetch(`/api/admin/bookings?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar agendamentos')
      }
      
      const data = await response.json()
      
      // Garantir que sempre seja um array
      if (Array.isArray(data)) {
        setBookings(data)
      } else {
        console.error('Resposta da API não é um array:', data)
        setBookings([])
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      setBookings([]) // Garantir que seja um array vazio em caso de erro
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border border-red-500/30'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'confirmed':
        return 'Confirmado'
      case 'cancelled':
        return 'Cancelado'
      case 'completed':
        return 'Concluído'
      default:
        return status
    }
  }

  function formatCurrency(value: number | null): string {
    if (!value) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Garantir que bookings seja um array antes de usar métodos de array
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
    return <div className="text-center py-8 text-gray-300">Carregando...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-100 mb-6">Financeiro</h2>
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/30 rounded-xl p-4">
            <div className="text-sm text-emerald-400 mb-1">Receita Total</div>
            <div className="text-2xl font-bold text-emerald-300">{formatCurrency(totalRevenue)}</div>
            <div className="text-xs text-gray-400 mt-1">Confirmados + Concluídos</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="text-sm text-yellow-400 mb-1">Receita Pendente</div>
            <div className="text-2xl font-bold text-yellow-300">{formatCurrency(pendingRevenue)}</div>
            <div className="text-xs text-gray-400 mt-1">Aguardando confirmação</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
            <div className="text-sm text-blue-400 mb-1">Serviços Concluídos</div>
            <div className="text-2xl font-bold text-blue-300">{completedCount}</div>
            <div className="text-xs text-gray-400 mt-1">Total de serviços</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4">
            <div className="text-sm text-purple-400 mb-1">Serviços Confirmados</div>
            <div className="text-2xl font-bold text-purple-300">{confirmedCount}</div>
            <div className="text-xs text-gray-400 mt-1">Aguardando conclusão</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-100">Agendamentos com Valores</h3>
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
            className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Serviço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Valor
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700">
            {!Array.isArray(bookings) || bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                  Nenhum agendamento encontrado
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-100">{booking.clientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                    {booking.service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div>
                      {format(new Date(booking.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                    <div className="font-medium text-gray-300">{booking.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${
                      booking.price ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      {booking.price ? formatCurrency(booking.price) : 'Não informado'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


