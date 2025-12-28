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
        throw new Error(errorData.error || 'Erro ao carregar serviços')
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
      // Não mostrar erro ao usuário aqui, apenas logar
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
    return <div className="text-center py-8 text-gray-300">Carregando serviços...</div>
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Nenhum serviço disponível no momento.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-1">
          Serviço *
        </label>
        <select
          id="service"
          required
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        >
          <option value="">Selecione um serviço</option>
          {services.map((service) => (
            <option key={service.id} value={service.id} className="bg-gray-700">
              {service.name} ({service.duration} min)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-gray-300 mb-1">
          Nome completo *
        </label>
        <input
          type="text"
          id="clientName"
          required
          value={formData.clientName}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-300 mb-1">
          Telefone *
        </label>
        <input
          type="tel"
          id="clientPhone"
          required
          value={formData.clientPhone}
          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
          Endereço onde o serviço será realizado *
        </label>
        <textarea
          id="address"
          required
          rows={3}
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
          placeholder="Ex: Rua das Flores, 123 - Centro - São Paulo/SP"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
          Observações
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
          placeholder="Informações adicionais sobre o serviço desejado..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-emerald-500/50"
      >
        {submitting ? 'Enviando...' : 'Enviar Solicitação'}
      </button>
    </form>
  )
}

