'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface TimeSelectionProps {
  serviceId: string
  date: Date
  duration: number
  onTimeSelect: (time: string) => void
}

export function TimeSelection({ serviceId, date, duration, onTimeSelect }: TimeSelectionProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailableSlots()
  }, [serviceId, date])

  async function fetchAvailableSlots() {
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const response = await fetch(`/api/availability?serviceId=${serviceId}&date=${dateStr}`)
      const data = await response.json()
      
      if (data.available && data.timeSlots) {
        setAvailableSlots(data.timeSlots)
      } else {
        setAvailableSlots([])
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Carregando horários disponíveis...</div>
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Não há horários disponíveis para esta data.
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-lg font-medium mb-4 text-gray-700">
        Selecione um horário disponível:
      </h4>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {availableSlots.map((time) => (
          <button
            key={time}
            onClick={() => onTimeSelect(time)}
            className="p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center font-medium"
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  )
}


