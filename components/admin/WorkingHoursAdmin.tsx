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
    if (!Array.isArray(workingHours)) {
      setTimeInputs({})
      return
    }
    
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
        throw new Error('Erro ao buscar horários')
      }
      
      const data = await response.json()
      
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
    } catch (error) {
      console.error('Erro ao salvar horário:', error)
      alert('Erro ao salvar horário. Tente novamente.')
    }
  }

  async function handleToggle(dayOfWeek: number, isActive: boolean) {
    if (!Array.isArray(workingHours)) return
    
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

  function updateTimeInput(dayOfWeek: number, field: 'startTime' | 'endTime', value: string) {
    setTimeInputs((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value,
      },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Carregando horários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Horários de Funcionamento</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure os horários de atendimento para cada dia da semana</p>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DAYS.map((dayName, dayOfWeek) => {
          const existing = Array.isArray(workingHours) 
            ? workingHours.find((wh) => wh.dayOfWeek === dayOfWeek)
            : null
          const currentInputs = timeInputs[dayOfWeek] || { startTime: '08:00', endTime: '18:00' }
          const isActive = existing?.isActive || false

          return (
            <div
              key={dayOfWeek}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-5 transition-all ${
                isActive 
                  ? 'border-emerald-200 dark:border-emerald-700 shadow-sm' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{dayName}</h3>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
                }`}>
                  {isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {/* Time Inputs */}
              {isActive ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Início</label>
                      <input
                        type="time"
                        value={currentInputs.startTime}
                        onChange={(e) => updateTimeInput(dayOfWeek, 'startTime', e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="pt-6 text-gray-400 dark:text-gray-500">até</div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fim</label>
                      <input
                        type="time"
                        value={currentInputs.endTime}
                        onChange={(e) => updateTimeInput(dayOfWeek, 'endTime', e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(dayOfWeek, currentInputs.startTime, currentInputs.endTime)}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => handleToggle(dayOfWeek, true)}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Desativar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Horário não configurado</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Início</label>
                        <input
                          type="time"
                          value={currentInputs.startTime}
                          onChange={(e) => updateTimeInput(dayOfWeek, 'startTime', e.target.value)}
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div className="pt-6 text-gray-400">até</div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Fim</label>
                        <input
                          type="time"
                          value={currentInputs.endTime}
                          onChange={(e) => updateTimeInput(dayOfWeek, 'endTime', e.target.value)}
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSave(dayOfWeek, currentInputs.startTime, currentInputs.endTime)}
                    className="w-full px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Ativar
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
