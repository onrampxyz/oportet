import { Env } from '@porto/apps'
import { useQuery } from '@tanstack/react-query'
import { type Address, type Hex, Value } from 'ox'
import { encodeFunctionData, parseAbiItem } from 'viem'
import { riseTestnet } from 'viem/chains'
import { useSendCallsSync } from 'wagmi'
import { porto } from '~/lib/Porto'
import type { BridgeToken } from '~/routes/-components/GlobalDeposit/BridgeFromChain'

export type UseBridgeParams = {
  address: Address.Address
  selectedChainId?: number
  selectedToken?: BridgeToken
  selectedTokenAddress?: Address.Address
  tokenBalance?: bigint
  destinationToken?: BridgeToken
  bridgeState: {
    status:
      | 'idle'
      | 'source-pending'
      | 'source-confirmed'
      | 'destination-pending'
      | 'completed'
    sourceChainId?: number
    sourceTxHash?: Hex.Hex
    destinationTxHash?: Hex.Hex
  }
  setBridgeState: React.Dispatch<
    React.SetStateAction<{
      status:
        | 'idle'
        | 'source-pending'
        | 'source-confirmed'
        | 'destination-pending'
        | 'completed'
      sourceChainId?: number
      sourceTxHash?: Hex.Hex
      destinationTxHash?: Hex.Hex
    }>
  >
}

export function useBridge(params: UseBridgeParams) {
  const {
    address,
    bridgeState,
    destinationToken,
    selectedChainId,
    selectedToken,
    selectedTokenAddress,
    setBridgeState,
    tokenBalance,
  } = params

  const targetChainId = Env.get() === 'prod' ? riseTestnet.id : riseTestnet.id // TODO: mainnet release switch chain id for prod

  // Get available chains
  const { data: chains } = useQuery({
    queryFn: () => {
      // Filter out the target chain from available chains
      return porto._internal.config.chains.filter((c) => c.id !== targetChainId)
    },
    queryKey: ['bridge-chains', targetChainId],
  })

  // Query destination chain balance
  const { data: destBalance, refetch: refetchDestBalance } = useQuery({
    enabled: Boolean(
      bridgeState.status === 'source-confirmed' ||
        bridgeState.status === 'destination-pending',
    ),
    async queryFn() {
      if (!destinationToken) return 0n

      const hexChainId = `0x${targetChainId.toString(16)}` as Hex.Hex
      const response = await porto.provider.request({
        method: 'wallet_getAssets',
        params: [
          {
            account: address,
            assetFilter: {
              [hexChainId]: [
                {
                  address: destinationToken.address,
                  type: 'erc20',
                },
              ],
            },
            chainFilter: [hexChainId],
          },
        ],
      })
      const assets = response[hexChainId] ?? []
      const asset = assets[0]
      return asset ? BigInt(asset.balance) : 0n
    },
    queryKey: [
      'bridge-dest-balance',
      targetChainId,
      selectedTokenAddress,
      address,
      bridgeState.status,
    ],
    refetchInterval:
      bridgeState.status === 'destination-pending' ? 2000 : false,
  })

  const { sendCallsSync } = useSendCallsSync()

  // Bridge function
  const bridge = () => {
    if (!selectedChainId || !selectedToken || !tokenBalance) return

    setBridgeState({
      sourceChainId: selectedChainId,
      status: 'source-pending',
    })

    // TODO: get bridge quotes and include in value field
    // TODO: switch bridge calls based on bridge type
    sendCallsSync({
      calls: [
        {
          abi: [
            parseAbiItem('function approve(address spender, uint256 amount)'),
          ],
          args: [selectedToken.bridgeContract, tokenBalance],
          functionName: 'approve',
          to: selectedToken.address,
        },
        {
          abi: [
            parseAbiItem(
              'function bridgeHyperlane(address _bridge, uint256 _amount)',
            ),
          ],
          args: [selectedToken.bridgeContract, tokenBalance],
          functionName: 'bridgeHyperlane',
          to: selectedToken.bridgeWrapper,
        },
      ],
      chainId: selectedChainId as never,
    })
  }

  // Mint token function
  const mintToken = async () => {
    console.log('selectedChainId:: ', selectedChainId)
    console.log('selectedTokenAddress:: ', selectedTokenAddress)

    if (!selectedTokenAddress || !selectedChainId) return

    const { id } = await porto.provider.request({
      method: 'wallet_sendCalls',
      params: [
        {
          calls: [
            {
              data: encodeFunctionData({
                abi: [
                  parseAbiItem('function mint(address to, uint256 amount)'),
                ],
                args: [address, Value.from('10', 18)],
                functionName: 'mint',
              }),
              to: selectedTokenAddress,
            },
          ],
          chainId: `0x${selectedChainId.toString(16)}`,
        },
      ],
    })

    const status = await porto.provider.request({
      method: 'wallet_getCallsStatus',
      params: [id],
    })

    console.log('mint call:', status)

    return status
  }

  return {
    bridge,
    chains,
    destBalance,
    mintToken,
    refetchDestBalance,
    targetChainId,
  }
}
