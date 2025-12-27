'use client'

import { useState, useEffect } from 'react'
import { getNextWeekdays, isToday, isTomorrow, formatDate, getDayNameShort } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DateSelectionProps {
  serviceId: string
  onDateSelect: (date: Date) => void
}

export function DateSelection({ serviceId, onDateSelect }: DateSelectionProps) {
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(true)
  const [customDate, setCustomDate] = useState('')
  const [showCustomDate, setShowCustomDate] = useState(false)

  useEffect(() => {
    fetchAvailableDates()
  }, [serviceId])

  async function fetchAvailableDates() {
    try {
      const weekdays = getNextWeekdays()
      const dates: Date[] = []
      
      for (const date of weekdays) {
        const dateStr = format(date, 'yyyy-MM-dd')
        const response = await fetch(`/api/availability?serviceId=${serviceId}&date=${dateStr}`)
        const data = await response.json()
        
        if (data.available && data.hasSlots) {
          dates.push(date)
        }
      }
      
      setAvailableDates(dates)
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCustomDateSelect() {
    if (!customDate) return
    
    const selectedDate = new Date(customDate)
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    
    try {
      const response = await fetch(`/api/availability?serviceId=${serviceId}&date=${dateStr}`)
      const data = await response.json()
      
      if (data.available && data.hasSlots) {
        onDateSelect(selectedDate)
      } else {
        alert('Esta data não está disponível para agendamento.')
      }
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error)
      alert('Erro ao verificar disponibilidade. Tente novamente.')
    }
  }

  function getDateLabel(date: Date): string {
    if (isToday(date)) return 'Hoje'
    if (isTomorrow(date)) return 'Amanhã'
    return getDayNameShort(date)
  }

  if (loading) {
    return <div className="text-center py-4">Verificando disponibilidade...</div>
  }

  return (
    <div>
      <h4 className="text-lg font-medium mb-4 text-gray-700">
        Selecione uma data disponível:
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {availableDates.map((date) => (
          <button
            key={date.toISOString()}
            onClick={() => onDateSelect(date)}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center"
          >
            <div className="font-semibold text-gray-800">{getDateLabel(date)}</div>
            <div className="text-sm text-gray-600 mt-1">{formatDate(date)}</div>
          </button>
        ))}
      </div>

      <div className="border-t pt-4">
        <button
          onClick={() => setShowCustomDate(!showCustomDate)}
          className="text-green-600 hover:text-green-700 font-medium mb-3"
        >
          {showCustomDate ? 'Ocultar' : 'Outras datas'}
        </button>
        
        {showCustomDate && (
          <div className="flex gap-3">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleCustomDateSelect}
              disabled={!customDate}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Verificar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

