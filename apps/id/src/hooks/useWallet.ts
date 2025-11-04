import { useQuery } from '@tanstack/react-query'
import type { Address } from 'ox'

const API_BASE_URL = 'http://localhost:42069'

/**
 * Type definitions for wallet API responses
 */
export type Balance = {
  // Define the balance structure based on your API response
  tokenId: string
  balance: string
  updatedAt: string
  symbol: string
  decimals: number
  price: number
  priceSource: string
  balanceFormatted: number
  usdValue: number
}

export type Position = {
  // Define the position structure based on your API response
  protocol: string
  type: 'lending' | 'staking' | 'liquidity' | 'other'
  tokens: Array<{
    address: Address.Address
    amount: string
    symbol: string
  }>
  value?: number
}

export type WalletSummary = {
  account: string
  totalValue: number
  breakdown: {
    tokens: {
      value: number
      count: number
    }
    protocols: {
      value: number
      count: number
    }
  }
}

export type Call = {
  id: string
  idx: number
  to: string
  value: string
  selector: string
  functionName: string | null
  decodedArgsJson: string | null
}

export type Intent = {
  id: string
  eoa: string
  txHash: string
  blockNumber: string
  timestamp: string
  success: boolean
  paymentAmount: string
  paymentToken: string
  payer: string
  errSelector: string
  calls: Call[]
}

export type Pagination = {
  limit: number
  offset: number
  hasMore: boolean
}

export type IntentsResponse = {
  intents: Intent[]
  pagination: Pagination
}

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

export function useTotalCalls({
  address,
  enabled = true,
}: {
  address?: Address.Address | undefined
  enabled?: boolean
}) {
  return useQuery({
    enabled: enabled && !!address,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/calls/${address}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch calls: ${response.statusText}`)
      }
      return response.json() as Promise<Call[]>
    },
    queryKey: ['wallet', 'total_calls', address],
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
      return response.json() as Promise<Position[]>
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
  const positions = useWalletPositions({ address, enabled })
  const summary = useWalletSummary({ address, enabled })
  const totalCalls = useTotalCalls({ address, enabled })

  return {
    balances,
    calls,
    error: balances.error || calls.error || positions.error || summary.error,
    isError:
      balances.isError || calls.isError || positions.isError || summary.isError,
    // Convenience properties
    isLoading:
      balances.isLoading ||
      calls.isLoading ||
      positions.isLoading ||
      summary.isLoading,
    positions,
    summary,
    totalCalls,
  }
}
