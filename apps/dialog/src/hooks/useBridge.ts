import { useQuery } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react'
import { type Address, encodeFunctionData, parseAbiItem } from 'viem'
import { useSendCallsSync } from 'wagmi'
import { porto } from '~/lib/Porto'
import type {
  BridgeState,
  BridgeToken,
} from '~/routes/-components/GlobalDeposit'
import { ErrorFormatter } from '~/utils'
import { useBridgeSupportedChains } from './useBridgeSupportedChains'

export type UseBridgeParams = {
  selectedChainId?: number
  selectedToken?: BridgeToken
  tokenBalance?: bigint
  amount?: bigint
  setBridgeState: Dispatch<SetStateAction<BridgeState>>
  account: Address
}

export function useBridge(params: UseBridgeParams) {
  const { selectedChainId, selectedToken, setBridgeState, amount, account } =
    params

  const { riseChainId } = useBridgeSupportedChains()

  const [data, setData] = useState<any>()
  const [error, setError] = useState<Error | undefined>()

  // Get available chains
  const { data: chains } = useQuery({
    queryFn: () => {
      // Filter out the target chain from available chains
      return porto._internal.config.chains.filter((c) => c.id !== riseChainId)
    },
    queryKey: ['bridge-chains', riseChainId],
  })

  const { sendCallsSyncAsync } = useSendCallsSync({
    mutation: {
      retry: false,
    },
  })

  // Bridge function
  const bridge = async () => {
    if (!selectedChainId || !selectedToken || !amount) return

    setData(undefined)
    setError(undefined)

    setBridgeState({
      sourceChainId: selectedChainId,
      status: 'pending',
    })

    try {
      const response = await sendCallsSyncAsync({
        calls: [
          {
            data: encodeFunctionData({
              abi: [
                parseAbiItem(
                  'function approve(address spender, uint256 amount)',
                ),
              ],
              args: [selectedToken.bridgeWrapper, amount],
              functionName: 'approve',
            }),
            to: selectedToken.address,
          },
          {
            data: encodeFunctionData({
              abi: [
                parseAbiItem(
                  'function bridgeLayerZero(address _bridge, uint256 _amount, address _recipient)',
                ),
              ],
              args: [selectedToken.bridgeContract, amount, account],
              functionName: 'bridgeLayerZero',
            }),
            to: selectedToken.bridgeWrapper,
          },
        ],
        chainId: selectedChainId as never,
        timeout: 60_000,
      })

      // Get transaction hash from receipts
      const sourceTxHash = response.receipts?.[0]?.transactionHash

      console.log('response-bridging::', response)
      console.log('response-sourceTxHash::', sourceTxHash)

      if (response.status === 'failure') {
        setBridgeState((prev) => ({
          ...prev,
          message: `Failed with status code ${response.statusCode}`,
          status: 'failed',
        }))
      } else if (response.status === 'success') {
        setBridgeState((prev) => ({
          ...prev,
          sourceTxHash,
          status: 'completed',
        }))
      }

      setData(response)
      return response
    } catch (e) {
      const error = e as Error
      console.log('error-bridging::', error)
      const message =
        typeof error.cause === 'string' ? error.cause : error.message

      setError(error)
      setBridgeState((prev) => ({
        ...prev,
        message: ErrorFormatter.extractMessage(message),
        status: 'failed',
      }))
    }
  }

  const result = useMemo(() => {
    return data
  }, [data])

  return {
    bridge,
    chains,
    data: result,
    error,
    targetChainId: riseChainId,
  }
}
