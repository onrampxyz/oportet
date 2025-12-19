import { Env } from '@porto/apps'
import { useQuery } from '@tanstack/react-query'
import type { Hex } from 'ox'
import type { Dispatch, SetStateAction } from 'react'
import { parseAbiItem } from 'viem'
import { riseTestnet } from 'viem/chains'
import { useSendCallsSync } from 'wagmi'
import { porto } from '~/lib/Porto'
import type { BridgeState } from '~/routes/-components/GlobalDeposit'
import type { BridgeToken } from '~/routes/-components/GlobalDeposit/AssetSelection'

export type UseBridgeParams = {
  selectedChainId?: number
  selectedToken?: BridgeToken
  tokenBalance?: bigint
  amount?: bigint
  setBridgeState: Dispatch<SetStateAction<BridgeState>>
}

export function useBridge(params: UseBridgeParams) {
  const { selectedChainId, selectedToken, setBridgeState, amount } = params

  const targetChainId = Env.get() === 'prod' ? riseTestnet.id : riseTestnet.id // TODO: mainnet release switch chain id for prod

  // Get available chains
  const { data: chains } = useQuery({
    queryFn: () => {
      // Filter out the target chain from available chains
      return porto._internal.config.chains.filter((c) => c.id !== targetChainId)
    },
    queryKey: ['bridge-chains', targetChainId],
  })

  const { sendCallsSyncAsync } = useSendCallsSync()

  // Bridge function
  const bridge = async () => {
    if (!selectedChainId || !selectedToken || !amount) return

    setBridgeState({
      sourceChainId: selectedChainId,
      status: 'source-pending',
    })

    try {
      // TODO: get bridge quotes and include in value field
      // TODO: switch bridge calls based on bridge type
      const response = await sendCallsSyncAsync({
        calls: [
          {
            abi: [
              parseAbiItem('function approve(address spender, uint256 amount)'),
            ],
            args: [selectedToken.bridgeContract, amount],
            functionName: 'approve',
            to: selectedToken.address,
          },
          {
            abi: [
              parseAbiItem(
                'function bridgeHyperlane(address _bridge, uint256 _amount)',
              ),
            ],
            args: [selectedToken.bridgeContract, amount],
            functionName: 'bridgeHyperlane',
            to: selectedToken.bridgeWrapper,
          },
        ],
        chainId: selectedChainId as never,
      })

      // Get transaction hash from receipts
      const sourceTxHash = response.receipts?.[1]?.transactionHash as
        | Hex.Hex
        | undefined

      console.log('response-bridging::', response)

      if (response.status === 'failure') {
        setBridgeState((prev) => ({
          ...prev,
          sourceTxHash,
          status: 'source-failed',
        }))
      } else {
        setBridgeState((prev) => ({
          ...prev,
          sourceTxHash,
          status: 'source-confirmed',
        }))
      }

      return response
    } catch (error) {
      console.log('error-bridging::', error)
      setBridgeState((prev) => ({
        ...prev,
        status: 'failed',
      }))
    }
  }

  return {
    bridge,
    chains,
    targetChainId,
  }
}
