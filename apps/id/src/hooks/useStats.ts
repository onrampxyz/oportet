import { useQuery } from '@tanstack/react-query'
import type { Stats } from '~/types/rise'

const API_BASE_URL = process.env.VITE_API_BASE_URL
/**
 * Fetches platform statistics
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useStats({
 *   enabled: true
 * })
 * ```
 */
export function useStats({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/v1/stats`)
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`)
      }
      return response.json() as Promise<Stats>
    },
    queryKey: ['stats'],
    refetchInterval: 30_000, // Refetch every 30 seconds
    staleTime: 20_000, // Consider data stale after 20 seconds
  })
}
