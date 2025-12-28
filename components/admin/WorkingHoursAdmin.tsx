'use client'

import { useState, useEffect } from 'react'

interface WorkingHours {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

const DAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

export function WorkingHoursAdmin() {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([])
  const [loading, setLoading] = useState(true)
  const [timeInputs, setTimeInputs] = useState<Record<number, { startTime: string; endTime: string }>>({})

  useEffect(() => {
    fetchWorkingHours()
  }, [])

  useEffect(() => {
    const inputs: Record<number, { startTime: string; endTime: string }> = {}
    DAYS.forEach((_, dayOfWeek) => {
      const existing = workingHours.find((wh) => wh.dayOfWeek === dayOfWeek)
      inputs[dayOfWeek] = {
        startTime: existing?.startTime || '08:00',
        endTime: existing?.endTime || '18:00',
      }
    })
    setTimeInputs(inputs)
  }, [workingHours])

  async function fetchWorkingHours() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/working-hours')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao carregar horários')
      }
      
      const data = await response.json()
      
      // Verificar se é um array antes de usar
      if (Array.isArray(data)) {
        setWorkingHours(data)
      } else {
        console.error('Resposta da API não é um array:', data)
        setWorkingHours([])
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
      setWorkingHours([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(dayOfWeek: number, startTime: string, endTime: string) {
    try {
      const response = await fetch('/api/admin/working-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek,
          startTime,
          endTime,
          isActive: true,
        }),
      })

      if (!response.ok) throw new Error('Erro ao salvar horário')

      await fetchWorkingHours()
      alert('Horário salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar horário:', error)
      alert('Erro ao salvar horário. Tente novamente.')
    }
  }

  async function handleToggle(dayOfWeek: number, isActive: boolean) {
    const existing = workingHours.find((wh) => wh.dayOfWeek === dayOfWeek)
    if (!existing) return

    try {
      const response = await fetch('/api/admin/working-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek,
          startTime: existing.startTime,
          endTime: existing.endTime,
          isActive: !isActive,
        }),
      })

      if (!response.ok) throw new Error('Erro ao atualizar horário')

      await fetchWorkingHours()
    } catch (error) {
      console.error('Erro ao atualizar horário:', error)
      alert('Erro ao atualizar horário. Tente novamente.')
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-300">Carregando...</div>
  }

  function updateTimeInput(dayOfWeek: number, field: 'startTime' | 'endTime', value: string) {
    setTimeInputs((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value,
      },
    }))
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-100 mb-6">Horários de Funcionamento</h2>

      <div className="space-y-4">
        {DAYS.map((dayName, dayOfWeek) => {
          const existing = workingHours.find((wh) => wh.dayOfWeek === dayOfWeek)
          const currentInputs = timeInputs[dayOfWeek] || { startTime: '08:00', endTime: '18:00' }

          return (
            <div
              key={dayOfWeek}
              className="p-4 border border-gray-700 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h3 className="font-medium text-gray-100 w-32">{dayName}</h3>

                    {existing?.isActive ? (
                      <>
                        <input
                          type="time"
                          value={currentInputs.startTime}
                          onChange={(e) => updateTimeInput(dayOfWeek, 'startTime', e.target.value)}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                        <span className="text-gray-400">até</span>
                        <input
                          type="time"
                          value={currentInputs.endTime}
                          onChange={(e) => updateTimeInput(dayOfWeek, 'endTime', e.target.value)}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                        <button
                          onClick={() => handleSave(dayOfWeek, currentInputs.startTime, currentInputs.endTime)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 text-sm transition-all shadow-lg hover:shadow-emerald-500/50 font-medium"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => handleToggle(dayOfWeek, true)}
                          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm transition-colors font-medium"
                        >
                          Desativar
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-500 text-sm">Não configurado</span>
                        <input
                          type="time"
                          value={currentInputs.startTime}
                          onChange={(e) => updateTimeInput(dayOfWeek, 'startTime', e.target.value)}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                        <span className="text-gray-400">até</span>
                        <input
                          type="time"
                          value={currentInputs.endTime}
                          onChange={(e) => updateTimeInput(dayOfWeek, 'endTime', e.target.value)}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                        <button
                          onClick={() => handleSave(dayOfWeek, currentInputs.startTime, currentInputs.endTime)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 text-sm transition-all shadow-lg hover:shadow-emerald-500/50 font-medium"
                        >
                          Ativar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

