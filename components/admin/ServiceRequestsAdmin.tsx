'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { format, addDays } from 'date-fns'
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
      const normalizedData = Array.isArray(data) 
        ? data.map((req: ServiceRequest) => ({
            ...req,
            status: req.status?.toLowerCase().trim() || 'pending'
          }))
        : []
      setRequests(normalizedData)
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(requestId: string, newStatus: 'approved' | 'rejected') {
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
      const requestBody: any = {
        status: newStatus,
        adminNotes: adminNotes || null,
      }

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
      setAvailableDates([])
      setAvailableTimes([])
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao atualizar solicitação. Tente novamente.')
    }
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

  function getStatusConfig(status: string) {
    const normalizedStatus = status?.toLowerCase().trim() || ''
    switch (normalizedStatus) {
      case 'pending':
        return {
          label: 'Pendente',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      case 'approved':
        return {
          label: 'Aprovada',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        }
      case 'rejected':
        return {
          label: 'Rejeitada',
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        }
      default:
        return {
          label: status,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: null
        }
    }
  }

  const filteredRequests = filterStatus 
    ? requests.filter(r => r.status?.toLowerCase().trim() === filterStatus)
    : requests

  const pendingCount = requests.filter(r => r.status?.toLowerCase().trim() === 'pending').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Carregando solicitações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Solicitações</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pendingCount > 0 && (
              <span className="font-medium text-amber-600">{pendingCount} pendente{pendingCount !== 1 ? 's' : ''}</span>
            )}
            {pendingCount > 0 && requests.length > pendingCount && ' • '}
            {requests.length} total
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          >
            <option value="">Todas</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovadas</option>
            <option value="rejected">Rejeitadas</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhuma solicitação encontrada</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {filterStatus ? 'Tente alterar o filtro' : 'As solicitações aparecerão aqui'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((request) => {
            const statusConfig = getStatusConfig(request.status)
            return (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>

                {/* Service */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Serviço</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{request.service.name}</p>
                </div>

                {/* Client Info */}
                <div className="mb-4 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cliente</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{request.clientName}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{request.clientPhone}</span>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Endereço</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{request.address}</p>
                </div>

                {/* Notes */}
                {request.notes && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Observações</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{request.notes}</p>
                  </div>
                )}

                {/* Admin Notes */}
                {request.adminNotes && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Nota do Admin</p>
                    <p className="text-sm text-blue-900 dark:text-blue-200 line-clamp-2">{request.adminNotes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
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
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Gerenciar
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm({ id: request.id, clientName: request.clientName })}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingRequest && mounted && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gerenciar Solicitação</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aprove ou rejeite a solicitação</p>
                </div>
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
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Request Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cliente</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{editingRequest.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Telefone</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{editingRequest.clientPhone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Serviço</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{editingRequest.service.name}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Endereço</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{editingRequest.address}</p>
                </div>
                {editingRequest.notes && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Observações do Cliente</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{editingRequest.notes}</p>
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações do Admin (opcional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none placeholder-gray-400 dark:placeholder-gray-500"
                  rows={3}
                  placeholder="Adicione observações sobre a aprovação/rejeição..."
                />
              </div>

              {/* Booking Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data do Agendamento *
                </label>
                {loadingAvailability ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">Carregando dias disponíveis...</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    {availableDates.map((dateInfo) => (
                      <button
                        key={dateInfo.date}
                        type="button"
                        onClick={() => handleDateSelect(dateInfo.date)}
                        disabled={!dateInfo.available}
                        className={`px-3 py-2 text-xs rounded-lg transition-all font-medium ${
                          bookingDate === dateInfo.date
                            ? 'bg-emerald-600 text-white shadow-md'
                            : dateInfo.available
                            ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                        }`}
                      >
                        {dateInfo.label}
                      </button>
                    ))}
                  </div>
                )}
                {bookingDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Selecionado: {format(new Date(bookingDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>

              {/* Booking Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Horário do Agendamento *
                </label>
                {availableTimes.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setBookingTime(time)}
                        className={`px-3 py-2 text-xs rounded-lg transition-all font-medium ${
                          bookingTime === time
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : bookingDate ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">Selecione uma data para ver os horários disponíveis</p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">Selecione uma data primeiro</p>
                )}
              </div>

              {/* Booking Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor do Serviço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bookingPrice}
                  onChange={(e) => setBookingPrice(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="0.00"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  * Obrigatório apenas ao aprovar. Um agendamento será criado automaticamente.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleStatusChange(editingRequest.id, 'approved')}
                disabled={!bookingDate || !bookingTime || !bookingPrice || isNaN(parseFloat(bookingPrice)) || parseFloat(bookingPrice) <= 0}
                className="flex-1 px-6 py-3 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Aprovar e Criar Agendamento
              </button>
              <button
                onClick={() => handleStatusChange(editingRequest.id, 'rejected')}
                className="flex-1 px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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
                className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && mounted && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Confirmar Exclusão</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Tem certeza que deseja deletar a solicitação de <span className="font-semibold">{deleteConfirm.clientName}</span>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Error Modal */}
      {errorMessage && mounted && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Erro</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ocorreu um problema</p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">{errorMessage}</p>

              <button
                onClick={() => setErrorMessage(null)}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
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
