'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { format, addDays, startOfDay } from 'date-fns'
import { isToday, isTomorrow, getDayNameShort } from '@/lib/utils'
import { ptBR } from 'date-fns/locale'

interface ServiceRequest {
  id: string
  clientName: string
  clientPhone: string
  address: string
  notes: string | null
  status: string
  adminNotes: string | null
  createdAt: string
  service: {
    id: string
    name: string
  }
}

export function ServiceRequestsAdmin() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [bookingPrice, setBookingPrice] = useState('')
  const [mounted, setMounted] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; clientName: string } | null>(null)
  const [availableDates, setAvailableDates] = useState<Array<{ date: string; label: string; available: boolean }>>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchRequests()
    }
  }, [filterStatus, mounted])

  async function fetchAvailableDates(serviceId: string) {
    setLoadingAvailability(true)
    try {
      const dates: Array<{ date: string; label: string; available: boolean }> = []
      const today = new Date()
      
      // Verificar próximos 30 dias
      for (let i = 1; i <= 30; i++) {
        const checkDate = addDays(today, i)
        const dateStr = format(checkDate, 'yyyy-MM-dd')
        
        try {
          const response = await fetch(`/api/availability?serviceId=${serviceId}&date=${dateStr}`)
          const data = await response.json()
          
          let label = ''
          if (isToday(checkDate)) {
            label = 'Hoje'
          } else if (isTomorrow(checkDate)) {
            label = 'Amanhã'
          } else {
            label = getDayNameShort(checkDate)
          }
          
          dates.push({
            date: dateStr,
            label: `${label} (${format(checkDate, 'dd/MM')})`,
            available: data.available && data.hasSlots,
          })
        } catch (error) {
          console.error(`Erro ao verificar data ${dateStr}:`, error)
        }
      }
      
      setAvailableDates(dates)
    } catch (error) {
      console.error('Erro ao buscar dias disponíveis:', error)
    } finally {
      setLoadingAvailability(false)
    }
  }

  async function handleDateSelect(dateStr: string) {
    if (!editingRequest) return
    
    setBookingDate(dateStr)
    setBookingTime('')
    setAvailableTimes([])
    
    try {
      const response = await fetch(`/api/availability?serviceId=${editingRequest.service.id}&date=${dateStr}`)
      const data = await response.json()
      
      if (data.available && data.hasSlots && data.timeSlots) {
        setAvailableTimes(data.timeSlots)
      } else {
        setAvailableTimes([])
        setErrorMessage('Nenhum horário disponível para esta data.')
      }
    } catch (error) {
      console.error('Erro ao buscar horários:', error)
      setAvailableTimes([])
    }
  }

  async function fetchRequests() {
    if (!mounted) return
    
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus) params.append('status', filterStatus)

      const response = await fetch(`/api/admin/requests?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || 'Erro ao buscar solicitações')
      }

      const data = await response.json()
      // Garantir que sempre seja um array e normalizar status
      const normalizedData = Array.isArray(data) 
        ? data.map((req: ServiceRequest) => ({
            ...req,
            status: req.status?.toLowerCase().trim() || 'pending'
          }))
        : []
      setRequests(normalizedData)
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error)
      setRequests([]) // Garantir que seja um array vazio em caso de erro
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(requestId: string, newStatus: 'approved' | 'rejected') {
    // Se for aprovar, validar data, hora e valor
    if (newStatus === 'approved') {
      if (!bookingDate || !bookingTime) {
        setErrorMessage('Por favor, selecione a data e horário para o agendamento.')
        return
      }
      
      const priceValue = parseFloat(bookingPrice)
      if (!bookingPrice || isNaN(priceValue) || priceValue <= 0) {
        setErrorMessage('Por favor, informe um valor válido para o serviço (maior que zero).')
        return
      }
    }

    try {
      // Preparar dados para envio
      const requestBody: any = {
        status: newStatus,
        adminNotes: adminNotes || null,
      }

      // Se for aprovar, incluir dados do agendamento
      if (newStatus === 'approved') {
        const priceValue = parseFloat(bookingPrice)
        if (isNaN(priceValue) || priceValue <= 0) {
          setErrorMessage('Por favor, informe um valor válido para o serviço (maior que zero).')
          return
        }
        
        requestBody.bookingDate = bookingDate
        requestBody.bookingTime = bookingTime
        requestBody.bookingPrice = priceValue
      }

      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || 'Erro ao atualizar solicitação'
        const errorDetails = errorData.details ? `\n\nDetalhes: ${JSON.stringify(errorData.details)}` : ''
        throw new Error(`${errorMessage}${errorDetails}`)
      }

      await fetchRequests()
      setEditingRequest(null)
      setAdminNotes('')
      setBookingDate('')
      setBookingTime('')
      setBookingPrice('')
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao atualizar solicitação. Tente novamente.')
    }
  }

  function handleDeleteClick(requestId: string, clientName: string) {
    setDeleteConfirm({ id: requestId, clientName })
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm) return

    try {
      const response = await fetch(`/api/admin/requests/${deleteConfirm.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao deletar solicitação')

      await fetchRequests()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Erro ao deletar solicitação:', error)
      setErrorMessage('Erro ao deletar solicitação. Tente novamente.')
      setDeleteConfirm(null)
    }
  }

  function getStatusColor(status: string): string {
    const normalizedStatus = status?.toLowerCase().trim() || ''
    switch (normalizedStatus) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      case 'approved':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  function getStatusLabel(status: string): string {
    const normalizedStatus = status?.toLowerCase().trim() || ''
    switch (normalizedStatus) {
      case 'pending':
        return 'Pendente'
      case 'approved':
        return 'Aprovada'
      case 'rejected':
        return 'Rejeitada'
      default:
        return status
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-300">Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-100">Solicitações de Serviço</h2>
          {requests.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              {requests.filter(r => r.status?.toLowerCase().trim() === 'pending').length} pendente(s) de {requests.length} total
            </p>
          )}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="approved">Aprovada</option>
          <option value="rejected">Rejeitada</option>
        </select>
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
                Endereço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                  Nenhuma solicitação encontrada
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-100">{request.clientName}</div>
                    <div className="text-sm text-gray-400">{request.clientPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                    {request.service.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 max-w-xs">
                    <div className="truncate" title={request.address}>
                      {request.address}
                    </div>
                    {request.notes && (
                      <div className="text-xs text-gray-500 mt-1 truncate" title={request.notes}>
                        Obs: {request.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {getStatusLabel(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {format(new Date(request.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      {request.status?.toLowerCase().trim() === 'pending' && (
                        <button
                          onClick={() => {
                            setEditingRequest(request)
                            setAdminNotes(request.adminNotes || '')
                            setBookingDate('')
                            setBookingTime('')
                            setBookingPrice('')
                            setAvailableTimes([])
                            fetchAvailableDates(request.service.id)
                          }}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Gerenciar
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(request.id, request.clientName)}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all text-sm font-medium"
                      >
                        Deletar
                      </button>
                      {request.status?.toLowerCase().trim() !== 'pending' && request.adminNotes && (
                        <div className="text-xs text-gray-500 max-w-xs truncate" title={request.adminNotes}>
                          {request.adminNotes}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingRequest && mounted && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full shadow-2xl my-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Gerenciar Solicitação</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-2">
                <strong className="text-gray-400">Cliente:</strong> {editingRequest.clientName}
              </p>
              <p className="text-sm text-gray-300 mb-2">
                <strong className="text-gray-400">Serviço:</strong> {editingRequest.service.name}
              </p>
              <p className="text-sm text-gray-300 mb-2">
                <strong className="text-gray-400">Endereço:</strong> {editingRequest.address}
              </p>
              {editingRequest.notes && (
                <p className="text-sm text-gray-300 mb-4">
                  <strong className="text-gray-400">Observações:</strong> {editingRequest.notes}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Observações do Admin (opcional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                rows={3}
                placeholder="Adicione observações sobre a aprovação/rejeição..."
              />
            </div>
            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data do Agendamento *
                </label>
                {loadingAvailability ? (
                  <div className="text-center py-4 text-gray-400 text-sm">Carregando dias disponíveis...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-700/50 rounded-lg border border-gray-600">
                      {availableDates.map((dateInfo) => (
                        <button
                          key={dateInfo.date}
                          type="button"
                          onClick={() => handleDateSelect(dateInfo.date)}
                          disabled={!dateInfo.available}
                          className={`px-3 py-2 text-xs rounded-lg transition-all ${
                            bookingDate === dateInfo.date
                              ? 'bg-emerald-500 text-white border-2 border-emerald-400'
                              : dateInfo.available
                              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                              : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {dateInfo.label}
                        </button>
                      ))}
                    </div>
                    {bookingDate && (
                      <div className="mt-2 text-xs text-gray-400">
                        Data selecionada: {format(new Date(bookingDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Horário do Agendamento *
                </label>
                {availableTimes.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-700/50 rounded-lg border border-gray-600">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setBookingTime(time)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          bookingTime === time
                            ? 'bg-emerald-500 text-white border-2 border-emerald-400'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : bookingDate ? (
                  <div className="text-xs text-gray-400 py-2">
                    Selecione uma data para ver os horários disponíveis
                  </div>
                ) : (
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Valor do Serviço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bookingPrice}
                  onChange={(e) => setBookingPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="0.00"
                  required
                />
              </div>
              <p className="text-xs text-gray-400">
                * Obrigatório apenas ao aprovar. Ao aprovar, um agendamento será criado automaticamente.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleStatusChange(editingRequest.id, 'approved')}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-emerald-500/50"
                disabled={!bookingDate || !bookingTime || !bookingPrice || isNaN(parseFloat(bookingPrice)) || parseFloat(bookingPrice) <= 0}
              >
                Aprovar e Criar Agendamento
              </button>
              <button
                onClick={() => handleStatusChange(editingRequest.id, 'rejected')}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-red-500/50"
              >
                Rejeitar
              </button>
              <button
                onClick={() => {
                  setEditingRequest(null)
                  setAdminNotes('')
                  setBookingDate('')
                  setBookingTime('')
                  setBookingPrice('')
                  setAvailableDates([])
                  setAvailableTimes([])
                }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {deleteConfirm && mounted && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-400 mt-1">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300">
                Tem certeza que deseja deletar a solicitação de <span className="font-semibold text-gray-100">{deleteConfirm.clientName}</span>?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-red-500/50 font-medium"
              >
                Sim, Deletar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {errorMessage && mounted && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">Erro</h3>
                <p className="text-sm text-gray-400 mt-1">Ocorreu um problema</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 whitespace-pre-line">{errorMessage}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setErrorMessage(null)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-emerald-500/50 font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

