'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DayOff {
  id: string
  date: string
  reason: string | null
}

export function DayOffsAdmin() {
  const [dayOffs, setDayOffs] = useState<DayOff[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    reason: '',
  })

  useEffect(() => {
    fetchDayOffs()
  }, [])

  async function fetchDayOffs() {
    try {
      const response = await fetch('/api/admin/day-offs')
      const data = await response.json()
      setDayOffs(data)
    } catch (error) {
      console.error('Erro ao carregar dias de folga:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const response = await fetch('/api/admin/day-offs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          reason: formData.reason || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar dia de folga')
      }

      await fetchDayOffs()
      setFormData({ date: '', reason: '' })
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao criar dia de folga:', error)
      alert(error instanceof Error ? error.message : 'Erro ao criar dia de folga. Tente novamente.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja remover este dia de folga?')) return

    try {
      const response = await fetch(`/api/admin/day-offs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao deletar dia de folga')

      await fetchDayOffs()
    } catch (error) {
      console.error('Erro ao deletar dia de folga:', error)
      alert('Erro ao deletar dia de folga. Tente novamente.')
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-300">Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-100">Dias de Folga</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-emerald-500/50 font-medium"
        >
          + Adicionar Dia de Folga
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold mb-4 text-gray-100">Novo Dia de Folga</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Ex: Feriado, Férias, etc."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-emerald-500/50 font-medium"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ date: '', reason: '' })
                }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Motivo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700">
            {dayOffs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-400">
                  Nenhum dia de folga cadastrado
                </td>
              </tr>
            ) : (
              dayOffs.map((dayOff) => (
                <tr key={dayOff.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                    {format(new Date(dayOff.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {dayOff.reason || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(dayOff.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remover
                    </button>
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

