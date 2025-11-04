import { useQuery } from '@tanstack/react-query'
import type { Address } from 'ox'
import type {
  Balance,
  IntentsResponse,
  Position,
  WalletSummary,
} from '~/types/wallet'

const API_BASE_URL = 'http://localhost:42069'

/**
 * Fetches wallet balances for a given address
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useWalletBalances({
 *   address: '0x1234...',
 *   enabled: true
 * })
 * ```
 */
export function useWalletBalances({
  address,
  enabled = true,
}: {
  address?: Address.Address | undefined
  enabled?: boolean
}) {
  return useQuery({
    enabled: enabled && !!address,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/balances/${address}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch balances: ${response.statusText}`)
      }
      return response.json() as Promise<Balance[]>
    },
    queryKey: ['wallet', 'balances', address],
    refetchInterval: 30_000, // Refetch every 30 seconds
    staleTime: 20_000, // Consider data stale after 20 seconds
  })
}

/**
 * Fetches wallet transaction calls for a given address
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useWalletCalls({
 *   address: '0x1234...',
 *   limit: 10,
 *   enabled: true
 * })
 * ```
 */
export function useWalletCalls({
  address,
  enabled = true,
  limit = 10,
}: {
  address?: Address.Address | undefined
  enabled?: boolean
  limit?: number
}) {
  return useQuery({
    enabled: enabled && !!address,
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/calls/${address}?limit=${limit}`,
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch calls: ${response.statusText}`)
      }
      return response.json() as Promise<IntentsResponse>
    },
    queryKey: ['wallet', 'calls', address, limit],
    refetchInterval: 10_000, // Refetch every 10 seconds
    staleTime: 5_000, // Consider data stale after 5 seconds
  })
}

/**
 * Fetches wallet positions (DeFi protocols) for a given address
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useWalletPositions({
 *   address: '0x1234...',
 *   enabled: true
 * })
 * ```
 */
export function useWalletPositions({
  address,
  enabled = true,
}: {
  address?: Address.Address | undefined
  enabled?: boolean
}) {
  return useQuery({
    enabled: enabled && !!address,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/positions/${address}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch positions: ${response.statusText}`)
      }
      return response.json() as Promise<Position>
    },
    queryKey: ['wallet', 'positions', address],
    refetchInterval: 60_000, // Refetch every 60 seconds
    staleTime: 45_000, // Consider data stale after 45 seconds
  })
}

/**
 * Fetches wallet summary for a given address
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useWalletSummary({
 *   address: '0x1234...',
 *   enabled: true
 * })
 * ```
 */
export function useWalletSummary({
  address,
  enabled = true,
}: {
  address?: Address.Address | undefined
  enabled?: boolean
}) {
  return useQuery({
    enabled: enabled && !!address,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/wallet-summary/${address}`)
      if (!response.ok) {
        throw new Error(
          `Failed to fetch wallet summary: ${response.statusText}`,
        )
      }
      return response.json() as Promise<WalletSummary>
    },
    queryKey: ['wallet', 'summary', address],
    refetchInterval: 30_000, // Refetch every 30 seconds
    staleTime: 20_000, // Consider data stale after 20 seconds
  })
}

/**
 * Combined hook that fetches all wallet data at once
 *
 * @example
 * ```tsx
 * const wallet = useWallet({
 *   address: '0x1234...',
 *   callsLimit: 10,
 *   enabled: true
 * })
 *
 * console.log(wallet.balances.data)
 * console.log(wallet.calls.data)
 * console.log(wallet.positions.data)
 * console.log(wallet.summary.data)
 * ```
 */
export function useWallet({
  address,
  callsLimit = 10,
  enabled = true,
}: {
  address?: Address.Address | undefined
  callsLimit?: number
  enabled?: boolean
}) {
  const balances = useWalletBalances({ address, enabled })
  const calls = useWalletCalls({ address, enabled, limit: callsLimit })
  const protocol = useWalletPositions({ address, enabled })
  const summary = useWalletSummary({ address, enabled })

  return {
    balances,
    calls,
    error: balances.error || calls.error || protocol.error || summary.error,
    isError:
      balances.isError || calls.isError || protocol.isError || summary.isError,
    // Convenience properties
    isLoading:
      balances.isLoading ||
      calls.isLoading ||
      protocol.isLoading ||
      summary.isLoading,
     protocol,
    summary,
  }
}
