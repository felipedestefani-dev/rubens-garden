import { useState, useCallback } from 'react'

interface UseSafeFetchOptions {
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

export function useSafeFetch<T = any>(options?: UseSafeFetchOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (url: string, init?: RequestInit): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(url, init)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Erro HTTP ${response.status}: ${response.statusText}`,
        }))
        throw new Error(errorData.error || `Erro ao buscar dados: ${response.status}`)
      }

      const data = await response.json()
      
      if (options?.onSuccess) {
        options.onSuccess(data)
      }

      return data as T
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido')
      setError(error)
      
      if (options?.onError) {
        options.onError(error)
      } else {
        console.error('Erro ao buscar dados:', error)
      }

      return null
    } finally {
      setLoading(false)
    }
  }, [options])

  return { fetchData, loading, error }
}

