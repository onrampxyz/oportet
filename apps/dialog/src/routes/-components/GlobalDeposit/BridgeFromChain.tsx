import { Env } from '@porto/apps'
import { Button, Deposit, Separator } from '@porto/ui'
import { type Address, type Hex, Value } from 'ox'
import * as React from 'react'
import { zeroAddress } from 'viem'
import { riseTestnet } from 'viem/chains'
import { useSendCallsSync, useWatchBlockNumber } from 'wagmi'
import {
  useBridge,
  useDestinationAsset,
  useMintToken,
  useWalletAsset,
} from '~/hooks'
import { Layout } from '~/routes/-components/Layout'
import Star from '~icons/ph/star-four-bold'
import { Bridge } from './Bridge'

export type BridgeToken = {
  symbol: string
  address: Address.Address
  bridgeContract: Address.Address
  bridgeType: 'hyperlane' | 'layerzero'
  minDeposit: bigint
  decimals: number
  bridgeWrapper: Address.Address
  icon: string
  name: string
}

// Hardcoded token configurations for bridging
export const BRIDGE_TOKENS: Record<number, BridgeToken[]> = {
  // Rise Testnet
  [riseTestnet.id]: [
    {
      address: '0x212Ee1EE02203e279c23bC8aB52c5b4428A3eCc7' as Address.Address,
      bridgeContract:
        '0x212Ee1EE02203e279c23bC8aB52c5b4428A3eCc7' as Address.Address,
      bridgeType: 'hyperlane',
      bridgeWrapper: zeroAddress,
      decimals: 18,
      icon: '/icons/eth.svg',
      minDeposit: Value.from('0.1', 18), // 0.1 USDC
      name: 'USDC', // TODO: fix this
      symbol: 'USDC',
    },
  ],
  // Base Sepolia
  84532: [
    {
      address: '0xc966f296d1735EbD224a537D2A3C1EE8be09eAe0' as Address.Address,
      bridgeContract:
        '0x372bBdbEf8Da9fcfE058D4C7Cc6756ee6B4133B9' as Address.Address,
      bridgeType: 'hyperlane',
      bridgeWrapper: '0x9Fe63D450edC97D700fA1D0081b84569102e5C1D',
      decimals: 18,
      icon: '/icons/eth.svg',
      minDeposit: Value.from('0.1', 18), // 0.1 USDC
      name: 'USDC', // TODO: fix this
      symbol: 'USDC',
    },
  ],
}

export function BridgeFromChain(props: {
  address: Address.Address
  onBack: () => void
  onSuccess: () => void
}) {
  const { address, onBack, onSuccess } = props

  const [selectedChainId, setSelectedChainId] = React.useState<
    number | undefined
  >()
  const [selectedTokenAddress, setSelectedTokenAddress] = React.useState<
    Address.Address | undefined
  >()

  const [bridgeState, setBridgeState] = React.useState<{
    status:
      | 'idle'
      | 'source-pending'
      | 'source-confirmed'
      | 'destination-pending'
      | 'completed'
    sourceChainId?: number
    sourceTxHash?: Hex.Hex
    destinationTxHash?: Hex.Hex
  }>({ status: 'idle' })

  const tokens = React.useMemo(() => {
    if (!selectedChainId) return []
    // Filter out native tokens (zeroAddress) as we don't support bridging them yet
    return (BRIDGE_TOKENS[selectedChainId] ?? []).filter(
      (token) => token.address.toLowerCase() !== zeroAddress.toLowerCase(),
    )
  }, [selectedChainId])

  const { balance: tokenBalance, refetch: refetchBalance } = useWalletAsset({
    address,
    chainId: selectedChainId,
    tokenAddress: selectedTokenAddress,
  })

  useWatchBlockNumber({
    chainId: selectedChainId as never,
    enabled:
      Boolean(selectedChainId && selectedTokenAddress) &&
      bridgeState.status === 'idle',
    onBlockNumber() {
      refetchBalance()
    },
  })

  const selectedToken = React.useMemo(() => {
    return tokens.find(
      (t) => t.address.toLowerCase() === selectedTokenAddress?.toLowerCase(),
    )
  }, [tokens, selectedTokenAddress])

  const destinationToken = React.useMemo(() => {
    const targetChainId = Env.get() === 'prod' ? riseTestnet.id : riseTestnet.id
    return BRIDGE_TOKENS[targetChainId]?.find(
      (t) => t.symbol === selectedToken?.symbol,
    )
  }, [selectedToken])

  const { bridge, chains, targetChainId } = useBridge({
    selectedChainId,
    selectedToken,
    setBridgeState,
    tokenBalance,
  })

  const { balance: destBalance, refetch: refetchDestBalance } =
    useDestinationAsset({
      address,
      destinationChainId: targetChainId,
      destinationTokenAddress: destinationToken?.address,
      enabled:
        bridgeState.status === 'source-confirmed' ||
        bridgeState.status === 'destination-pending',
      refetchInterval:
        bridgeState.status === 'destination-pending' ? 2000 : false,
    })

  const { mintToken } = useMintToken({
    address,
    chainId: selectedChainId,
    tokenAddress: selectedTokenAddress,
  })

  const canBridge = React.useMemo(() => {
    if (!tokenBalance || !selectedToken) return false
    return tokenBalance >= selectedToken.minDeposit
  }, [tokenBalance, selectedToken])

  const {
    data: bridgeData,
    isPending: isBridgePending,
    isSuccess: isSendCallsSuccess,
    error: bridgeError,
  } = useSendCallsSync()

  // Track initial balance before bridge
  const [initialDestBalance, setInitialDestBalance] = React.useState<
    bigint | undefined
  >()

  // Watch for destination chain blocks
  useWatchBlockNumber({
    chainId: targetChainId as never,
    enabled: bridgeState.status === 'destination-pending',
    onBlockNumber() {
      refetchDestBalance()
    },
  })

  // Handle source chain transaction confirmation
  React.useEffect(() => {
    if (!isSendCallsSuccess) return
    if (!bridgeData) return
    if (!(bridgeData.status === 'success')) return
    if (bridgeState.status !== 'source-pending') return

    // Get transaction hash from receipts
    const sourceTxHash = bridgeData.receipts?.[1]?.transactionHash as
      | Hex.Hex
      | undefined

    setBridgeState((prev) => ({
      ...prev,
      sourceTxHash,
      status: 'source-confirmed',
    }))

    // Record initial destination balance
    setInitialDestBalance(destBalance ?? 0n)
  }, [isSendCallsSuccess, bridgeData, bridgeState.status, destBalance])

  // Transition to destination-pending after source confirmation
  React.useEffect(() => {
    if (bridgeState.status !== 'source-confirmed') return

    const timer = setTimeout(() => {
      setBridgeState((prev) => ({
        ...prev,
        status: 'destination-pending',
      }))
    }, 1000)

    return () => clearTimeout(timer)
  }, [bridgeState.status])

  // Check if destination balance increased
  React.useEffect(() => {
    if (bridgeState.status !== 'destination-pending') return
    if (initialDestBalance === undefined || destBalance === undefined) return

    if (destBalance > initialDestBalance) {
      setBridgeState((prev) => ({
        ...prev,
        // Note: We don't have access to the actual destination tx hash from the bridge
        // This is a limitation of the current bridge implementation
        destinationTxHash: undefined,
        status: 'completed',
      }))
    }
  }, [bridgeState.status, initialDestBalance, destBalance])

  // Show bridge progress view
  if (bridgeState.status !== 'idle') {
    return (
      <Bridge
        amount={tokenBalance}
        bridge={bridge}
        bridgeError={bridgeError}
        bridgeState={bridgeState}
        chains={chains}
        onRetry={() => {
          setBridgeState({ status: 'idle' })
        }}
        onSuccess={onSuccess}
        selectedToken={selectedToken}
        targetChainId={targetChainId}
      />
    )
  }

  return (
    <Layout>
      <Layout.Header>
        <Layout.Header.Default
          icon={Star}
          title="Bridge from chain"
          variant="default"
        />
      </Layout.Header>

      <Layout.Content>
        <div className="flex flex-col gap-3">
          <Separator label="Select source chain" size="medium" spacing={0} />
          <div className="flex flex-col gap-2">
            {chains?.map((chain) => (
              <button
                className={`flex h-9 w-full items-center justify-between rounded-md px-2 ${
                  selectedChainId === chain.id
                    ? 'bg-th_primary text-th_primary-contrast'
                    : 'bg-th_secondary hover:bg-th_tertiary'
                }`}
                key={chain.id}
                onClick={() => {
                  setSelectedChainId(chain.id)
                  setSelectedTokenAddress(undefined)
                }}
                type="button"
              >
                {chain.name}
              </button>
            ))}
          </div>

          {selectedChainId && tokens && (
            <>
              <Separator label="Select token" size="medium" spacing={0} />
              <div className="flex flex-col gap-2">
                {tokens.map((token) => (
                  <button
                    className={`flex h-9 w-full items-center justify-between rounded-md px-2 ${
                      selectedTokenAddress?.toLowerCase() ===
                      token.address.toLowerCase()
                        ? 'bg-th_primary text-th_primary-contrast'
                        : 'bg-th_secondary hover:bg-th_tertiary'
                    }`}
                    key={token.address}
                    onClick={() => setSelectedTokenAddress(token.address)}
                    type="button"
                  >
                    <span>{token.symbol}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {selectedChainId && selectedTokenAddress && (
            <>
              <Separator label="Deposit address" size="medium" spacing={0} />
              <Deposit
                address={address}
                chainId={selectedChainId}
                label="Send tokens to this address"
              />

              {!canBridge && selectedToken && (
                <p className="text-sm text-th_base-secondary">
                  Minimum deposit:{' '}
                  {Value.format(
                    selectedToken.minDeposit,
                    selectedToken.decimals,
                  )}{' '}
                  {selectedToken.symbol}
                </p>
              )}

              {tokenBalance !== undefined && selectedToken && (
                <div className="flex gap-2">
                  <p className="text-sm text-th_base-secondary">
                    Your balance:{' '}
                    {Value.format(tokenBalance, selectedToken.decimals)}{' '}
                    {selectedToken.symbol}
                  </p>
                  <button
                    className="text-sm text-th_base-secondary underline hover:cursor-pointer"
                    onClick={mintToken}
                    type="button"
                  >
                    mint
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Layout.Content>

      <Layout.Footer>
        <Layout.Footer.Actions>
          <Button onClick={onBack} variant="secondary" width="grow">
            Back
          </Button>
          {selectedChainId && selectedTokenAddress && (
            <Button
              disabled={!canBridge}
              loading={isBridgePending && 'Bridging…'}
              onClick={bridge}
              variant="primary"
              width="grow"
            >
              Bridge to Rise
            </Button>
          )}
        </Layout.Footer.Actions>
      </Layout.Footer>
    </Layout>
  )
}
