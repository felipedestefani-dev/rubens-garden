'use client'

import { useState, useEffect } from 'react'
import { DateSelection } from './DateSelection'
import { TimeSelection } from './TimeSelection'
import { BookingForm } from './BookingForm'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  active: boolean
}

export function ServiceSelection() {
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
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

  if (loading) {
    return <div className="text-center py-8">Carregando serviços...</div>
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Nenhum serviço disponível no momento.
      </div>
    )
  }

  if (!selectedService) {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Selecione o serviço desejado:
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
            >
              <h4 className="font-semibold text-lg text-gray-800 mb-2">
                {service.name}
              </h4>
              {service.description && (
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Duração: {service.duration} min
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (!selectedDate) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => {
              setSelectedService(null)
              setSelectedDate(null)
              setSelectedTime(null)
            }}
            className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center"
          >
            ← Voltar
          </button>
          <h3 className="text-xl font-semibold text-gray-700">
            Serviço selecionado: {selectedService.name}
          </h3>
        </div>
        <DateSelection
          serviceId={selectedService.id}
          onDateSelect={setSelectedDate}
        />
      </div>
    )
  }

  if (!selectedTime) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => {
              setSelectedDate(null)
              setSelectedTime(null)
            }}
            className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center"
          >
            ← Voltar
          </button>
          <h3 className="text-xl font-semibold text-gray-700">
            Data selecionada: {selectedDate.toLocaleDateString('pt-BR')}
          </h3>
        </div>
        <TimeSelection
          serviceId={selectedService.id}
          date={selectedDate}
          duration={selectedService.duration}
          onTimeSelect={setSelectedTime}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => {
            setSelectedTime(null)
          }}
          className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center"
        >
          ← Voltar
        </button>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Finalizar agendamento
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Serviço: {selectedService.name}</p>
          <p>Data: {selectedDate.toLocaleDateString('pt-BR')}</p>
          <p>Horário: {selectedTime}</p>
        </div>
      </div>
      <BookingForm
        serviceId={selectedService.id}
        date={selectedDate}
        time={selectedTime}
        onSuccess={() => {
          alert('Agendamento realizado com sucesso!')
          setSelectedService(null)
          setSelectedDate(null)
          setSelectedTime(null)
        }}
      />
    </div>
  )
}

