'use client'

import { useState, useEffect } from 'react'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  active: boolean
}

export function ServiceRequestForm() {
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string>('')
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    address: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    try {
      setLoading(true)
      const response = await fetch('/api/services')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || `Erro ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Verificar se é um array antes de usar filter
      if (Array.isArray(data)) {
        setServices(data.filter((s: Service) => s.active))
      } else {
        console.error('Resposta da API não é um array:', data)
        setServices([])
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedService) {
      alert('Por favor, selecione um serviço')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedService,
          ...formData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || error.error || 'Erro ao criar solicitação')
      }

      alert('Solicitação enviada com sucesso! Aguarde a aprovação do autônomo.')
      setFormData({
        clientName: '',
        clientPhone: '',
        address: '',
        notes: '',
      })
      setSelectedService('')
    } catch (error) {
      console.error('Erro ao criar solicitação:', error)
      alert(error instanceof Error ? error.message : 'Erro ao criar solicitação. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Carregando serviços...</div>
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Nenhum serviço disponível no momento.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Serviço
        </label>
        <select
          id="service"
          required
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
        >
          <option value="">Selecione um serviço</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({service.duration} min)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nome completo
        </label>
        <input
          type="text"
          id="clientName"
          required
          value={formData.clientName}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Seu nome completo"
        />
      </div>

      <div>
        <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Telefone
        </label>
        <input
          type="tel"
          id="clientPhone"
          required
          value={formData.clientPhone}
          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
          className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="(00) 00000-0000"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Endereço
        </label>
        <textarea
          id="address"
          required
          rows={3}
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Rua, número, bairro, cidade - Estado"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Observações <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Informações adicionais sobre o serviço..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
      >
        {submitting ? 'Enviando...' : 'Enviar Solicitação'}
      </button>
    </form>
  )
}

