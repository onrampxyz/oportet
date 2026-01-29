import { useQuery } from '@tanstack/react-query'

const LAYERZERO_API_BASE_URL = 'https://scan-testnet.layerzero-api.com/v1'

// Types for LayerZero Scan API responses

export type LayerZeroEndpoint = {
  address: string
  id: string
  name: string
  chain: string
}

export type LayerZeroPathway = {
  srcEid: number
  dstEid: number
  sender: LayerZeroEndpoint
  receiver: LayerZeroEndpoint
  id: string
  nonce: number
}

export type LayerZeroAdapterParams = {
  version: string
  dstGasLimit: string
  dstNativeGasTransferAmount: string
  dstNativeGasTransferAddress: string
}

export type LayerZeroNativeDrop = {
  amount: string
  receiver: string
}

export type LayerZeroCompose = {
  index: number
  gas: string
  value: string
}

export type LayerZeroOptions = {
  lzReceive: {
    gas: string
    value: string
  }
  nativeDrop: LayerZeroNativeDrop[]
  compose: LayerZeroCompose[]
  ordered: boolean
}

export type LayerZeroSourceTx = {
  txHash: string
  blockHash: string
  blockNumber: string
  blockTimestamp: number
  from: string
  blockConfirmations: number
  payload: string
  value: string
  readinessTimestamp: number
  resolvedPayload: string
  adapterParams: LayerZeroAdapterParams
  options: LayerZeroOptions
}

export type LayerZeroSource = {
  status: 'WAITING' | 'INFLIGHT' | 'DELIVERED' | 'FAILED'
  tx: LayerZeroSourceTx
  failedTx: string[]
}

export type LayerZeroDestinationTx = {
  txHash: string
  blockHash: string
  blockNumber: number
  blockTimestamp: number
}

export type LayerZeroDestination = {
  status: 'WAITING' | 'INFLIGHT' | 'DELIVERED' | 'FAILED'
  tx: LayerZeroDestinationTx
  payloadStoredTx: string
  failedTx: string[]
}

export type LayerZeroDvnProof = {
  packetHeader: string
  payloadHash: string
}

export type LayerZeroDvnStatus =
  | 'VALIDATING_TX'
  | 'WAITING'
  | 'VERIFIED'
  | 'FAILED'

export type LayerZeroDvnEntry = {
  txHash: string
  blockHash: string
  blockNumber: number
  blockTimestamp: number
  proof: LayerZeroDvnProof
  optional: boolean
  status: LayerZeroDvnStatus
}

export type LayerZeroDvn = {
  dvns: Record<string, LayerZeroDvnEntry>
  status: 'WAITING' | 'VERIFIED' | 'FAILED'
}

export type LayerZeroSealerFailedTx = {
  txHash: string
  txError: string
}

export type LayerZeroSealer = {
  tx: {
    txHash: string
    blockHash: string
    blockNumber: number
    blockTimestamp: number
  }
  failedTx: LayerZeroSealerFailedTx[]
  status: 'WAITING' | 'SEALED' | 'FAILED'
}

export type LayerZeroVerification = {
  dvn: LayerZeroDvn
  sealer: LayerZeroSealer
}

export type LayerZeroDvnConfig = {
  confirmations: number
  requiredDVNCount: number
  optionalDVNCount: number
  optionalDVNThreshold: number
  requiredDVNs: string[]
  requiredDVNNames: string[]
  optionalDVNs: string[]
  optionalDVNNames: string[]
  executor: string
}

export type LayerZeroConfig = {
  error: boolean
  errorMessage: string
  dvnConfigError: boolean
  receiveLibrary: string
  sendLibrary: string
  inboundConfig: LayerZeroDvnConfig
  outboundConfig: LayerZeroDvnConfig
  ulnSendVersion: 'V1' | 'V2'
  ulnReceiveVersion: 'V1' | 'V2'
}

export type LayerZeroStatus = {
  name: 'INFLIGHT' | 'DELIVERED' | 'FAILED' | 'BLOCKED' | 'CONFIRMING'
  message: string
}

export type LayerZeroMessage = {
  pathway: LayerZeroPathway
  source: LayerZeroSource
  destination: LayerZeroDestination
  verification: LayerZeroVerification
  guid: string
  config: LayerZeroConfig
  status: LayerZeroStatus
  created: string
  updated: string
}

export type LayerZeroMessagesResponse = {
  data: LayerZeroMessage[]
}

/**
 * Fetches LayerZero cross-chain message status for a given transaction
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useLayerZeroMessage({
 *   transactionId: '0x1234...',
 *   enabled: true
 * })
 *
 * // Access message data
 * if (data?.data?.[0]) {
 *   console.log(data.data[0].status.name) // 'INFLIGHT' | 'DELIVERED' | 'FAILED' | etc
 *   console.log(data.data[0].source.tx.txHash)
 *   console.log(data.data[0].destination.status)
 * }
 * ```
 */
export function useLayerZeroMessage({
  transactionId,
  enabled = true,
}: {
  transactionId?: string | undefined
  enabled?: boolean
}) {
  return useQuery({
    enabled: enabled && !!transactionId,
    queryFn: async () => {
      const response = await fetch(
        `${LAYERZERO_API_BASE_URL}/messages/tx/${transactionId}`,
      )
      if (!response.ok) {
        throw new Error(
          `Failed to fetch LayerZero message: ${response.statusText}`,
        )
      }
      return response.json() as Promise<LayerZeroMessagesResponse>
    },
    queryKey: ['layerzero', 'message', transactionId],
    refetchInterval: 5_000,
    staleTime: 3_000,
  })
}
