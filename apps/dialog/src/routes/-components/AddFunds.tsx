import { Env } from '@porto/apps'
import { exp1Address } from '@porto/apps/contracts'
import { usePrevious } from '@porto/apps/hooks'
import {
  Button,
  CopyButton,
  Deposit,
  Details,
  PresetsInput,
  Separator,
  Spinner,
} from '@porto/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type Address, type Hex, Value } from 'ox'
import { Hooks as RemoteHooks } from 'porto/remote'
import { RelayActions } from 'porto/viem'
import { Hooks } from 'porto/wagmi'
import * as React from 'react'
import {
  encodeFunctionData,
  pad,
  parseAbiItem,
  zeroAddress,
  zeroHash,
} from 'viem'
import { riseTestnet } from 'viem/chains'
import { useSendCallsSync, useWatchBlockNumber } from 'wagmi'
import { DepositButtons } from '~/components/DepositButtons'
import { useOnrampOrder } from '~/lib/onramp'
import { porto } from '~/lib/Porto'
import * as Tokens from '~/lib/Tokens'
import { Layout } from '~/routes/-components/Layout'
import CheckCircle from '~icons/lucide/check-circle'
import ExternalLink from '~icons/lucide/external-link'
import TriangleAlertIcon from '~icons/lucide/triangle-alert'
import Star from '~icons/ph/star-four-bold'
import { ApplePayButton, ApplePayIframe } from './ActionPreview'
import { SetupApplePay } from './SetupApplePay'

const presetAmounts = ['30', '50', '100', '250'] as const
const maxAmount = 500

type View = 'default' | 'error' | 'onramp' | 'setup-onramp' | 'bridge'

export function AddFunds(props: AddFunds.Props) {
  const { chainId, onApprove, onReject, value } = props

  const [view, setView] = React.useState<View>('default')

  const account = RemoteHooks.useAccount(porto)
  const address = props.address ?? account?.address
  const chain = RemoteHooks.useChain(porto, { chainId })

  // const showApplePay = useShowApplePay()
  const showApplePay = false
  const client = RemoteHooks.useRelayClient(porto)
  const { data: onrampStatus } = useQuery({
    enabled: Boolean(showApplePay && address),
    async queryFn() {
      if (!address) throw new Error('address required')
      return await RelayActions.onrampStatus(client, { address })
    },
    queryKey: ['onrampStatus', address],
    select(data) {
      const reverifyPhone = (() => {
        if (!data.phone) return false
        const timestampDate = new Date(data.phone * 1000)
        const currentDate = new Date()
        const diffInMs = currentDate.getTime() - timestampDate.getTime()
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24)
        return diffInDays > 60
      })()
      return { ...data, reverifyPhone }
    },
  })
  const { createOrder, lastOrderEvent } = useOnrampOrder({
    onApprove,
    // TODO(onramp): Flip to `false`
    sandbox: true,
  })
  const [iframeLoaded, setIframeLoaded] = React.useState(false)

  const queryClient = useQueryClient()
  // biome-ignore lint/correctness/useExhaustiveDependencies: explanation
  const onCompleteOnrampSetup = React.useCallback(() => {
    if (!address) throw new Error('address is required')
    const timestamp = Math.floor(Date.now() / 1000)
    queryClient.setQueryData(
      ['onrampStatus', address],
      {
        email: onrampStatus?.email ?? timestamp,
        phone: onrampStatus?.phone ?? timestamp,
      },
      {},
    )
    createOrder.mutate(
      { address, amount: value ?? '10' },
      {
        onSuccess() {
          setView('default')
        },
      },
    )
  }, [address, value, onrampStatus])

  // create onramp order if onramp status is valid
  // biome-ignore lint/correctness/useExhaustiveDependencies: keep stable
  React.useEffect(() => {
    if (!address) return
    if (
      onrampStatus?.email &&
      onrampStatus.phone &&
      !onrampStatus.reverifyPhone
    ) {
      setIframeLoaded(false)
      createOrder.mutate({ address, amount: value ?? '10' })
    }
  }, [address, onrampStatus])

  const { data: tokens } = Tokens.getTokens.useQuery()
  const { data: assets, refetch: refetchAssets } = Hooks.useAssets({
    account: account?.address,
    query: {
      enabled: Boolean(account?.address),
      select: (data) =>
        // As we support interop, we can listen to the
        // aggregated assets across all supported chains.
        data[0],
    },
  })
  const balanceMap = React.useMemo(() => {
    const addressBalanceMap = new Map<Address.Address, bigint>()
    if (!assets) return addressBalanceMap

    const tokenAddressMap = new Map<Address.Address, boolean>()
    if (tokens)
      for (const token of tokens) tokenAddressMap.set(token.address, true)

    for (const asset of assets) {
      const address =
        (asset.address === 'native' || asset.type === 'native'
          ? zeroAddress
          : asset.address) ?? zeroAddress
      if (tokenAddressMap.has(address)) {
        const balance = addressBalanceMap.get(address)
        addressBalanceMap.set(address, (balance ?? 0n) + asset.balance)
      }
    }
    return addressBalanceMap
  }, [assets, tokens])
  useWatchBlockNumber({
    enabled: Boolean(account?.address),
    onBlockNumber() {
      refetchAssets()
    },
  })
  const previousBalanceMap = usePrevious({ value: balanceMap })

  // Close dialog when one of the token balances increases
  React.useEffect(() => {
    if (typeof previousBalanceMap === 'undefined') return
    for (const [address, balance] of balanceMap) {
      const previousBalance = previousBalanceMap.get(address)
      if (typeof previousBalance === 'undefined') continue
      if (balance > previousBalance) onApprove?.({ id: zeroHash })
    }
  }, [balanceMap, onApprove, previousBalanceMap])

  const showFaucet = React.useMemo(() => {
    return false
    // if (import.meta.env.MODE === 'test') return true
    // // Don't show faucet if not on "default" view.
    // if (view !== 'default') return false
    // // Show faucet if on a testnet.
    // if (chain?.testnet) return true
    // return false
  }, [])

  if (view === 'error')
    return (
      <Layout>
        <Layout.Header>
          <Layout.Header.Default
            icon={TriangleAlertIcon}
            title="Deposit failed"
            variant="destructive"
          />
        </Layout.Header>

        <Layout.Content className="px-1">
          <p className="text-th_base">Your deposit was cancelled or failed.</p>
          <p className="text-th_base-secondary">
            No funds have been deposited.
          </p>
        </Layout.Content>

        <Layout.Footer>
          <Layout.Footer.Actions>
            <Button
              className="flex-grow"
              onClick={() => onReject?.()}
              variant="secondary"
            >
              Close
            </Button>
            <Button
              className="flex-grow"
              onClick={() => setView('default')}
              variant="primary"
            >
              Try again
            </Button>
          </Layout.Footer.Actions>
        </Layout.Footer>
      </Layout>
    )

  if (view === 'setup-onramp')
    return (
      <SetupApplePay
        address={address!}
        onBack={() => {
          setView('default')
        }}
        onComplete={onCompleteOnrampSetup}
        showEmail={!onrampStatus?.email}
        showPhone={!onrampStatus?.phone || onrampStatus?.reverifyPhone}
      />
    )

  if (view === 'bridge')
    return (
      <BridgeFromChain
        address={address!}
        onBack={() => setView('default')}
        onSuccess={() => onApprove?.({ id: zeroHash })}
      />
    )

  return (
    <Layout>
      <Layout.Header>
        <Layout.Header.Default
          icon={Star}
          title="Add funds"
          variant="default"
        />
      </Layout.Header>

      <Layout.Content>
        <div className="flex flex-col gap-3">
          <Separator label="Select deposit method" size="medium" spacing={0} />
          {showFaucet && (
            <Faucet
              address={address}
              chainId={chain?.id}
              onApprove={onApprove}
            />
          )}
          {showApplePay &&
            address &&
            (onrampStatus?.email &&
            onrampStatus.phone &&
            !onrampStatus.reverifyPhone ? (
              <div className="flex w-full flex-col">
                {createOrder.isSuccess && createOrder.data?.url && (
                  <ApplePayIframe
                    lastOrderEvent={lastOrderEvent}
                    loaded={iframeLoaded}
                    setLoaded={setIframeLoaded}
                    src={createOrder.data.url}
                  />
                )}
                {(!iframeLoaded ||
                  lastOrderEvent?.eventName ===
                    'onramp_api.apple_pay_button_pressed' ||
                  lastOrderEvent?.eventName === 'onramp_api.polling_start') && (
                  <ApplePayButton label="Buy with" loading />
                )}
              </div>
            ) : (
              <ApplePayButton
                label="Set up"
                onClick={() => setView('setup-onramp')}
              />
            ))}
          {view !== 'onramp' && (
            <>
              <DepositButtons
                address={address ?? ''}
                chainId={chain?.id}
                nativeTokenName={chain?.nativeCurrency?.symbol}
              />
              <Button
                onClick={() => setView('bridge')}
                variant="positive"
                width="full"
              >
                Bridge from other chains
              </Button>
            </>
          )}
        </div>
      </Layout.Content>
      {onReject && view !== 'onramp' && (
        <Layout.Footer>
          <Layout.Footer.Actions>
            <Button onClick={onReject} variant="secondary" width="full">
              Back
            </Button>
          </Layout.Footer.Actions>
        </Layout.Footer>
      )}
    </Layout>
  )
}

export declare namespace AddFunds {
  export type Props = {
    address?: Address.Address | undefined
    chainId?: number | undefined
    onApprove: (result: { id: Hex.Hex }) => void
    onReject?: () => void
    value?: string | undefined
  }
}

function Faucet(props: {
  address: Address.Address | undefined
  chainId: number | undefined
  onApprove: (result: { id: Hex.Hex }) => void
}) {
  const { address, chainId, onApprove } = props

  const [amount, setAmount] = React.useState<string>(presetAmounts[0])

  const client = RemoteHooks.useRelayClient(porto)
  const faucet = useMutation({
    async mutationFn(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      e.stopPropagation()

      if (!address) throw new Error('address is required')
      if (!chainId) throw new Error('chainId is required')

      const value = Value.from(amount, 18)

      const data = await RelayActions.addFaucetFunds(client, {
        address,
        chain: { id: chainId },
        tokenAddress: exp1Address[chainId as never],
        value,
      })
      return data
    },
    onSuccess(data) {
      onApprove({ id: data.transactionHash })
    },
  })

  return (
    <form
      className="grid h-min grid-flow-row auto-rows-min grid-cols-1 space-y-3"
      onSubmit={(e) => faucet.mutate(e)}
    >
      <div className="col-span-1 row-span-1">
        <PresetsInput
          adornments={{
            end: {
              label: `Max. $${maxAmount}`,
              type: 'fill',
              value: String(maxAmount),
            },
            start: '$',
          }}
          inputMode="decimal"
          max={maxAmount}
          min={0}
          onChange={setAmount}
          placeholder="Enter amount"
          presets={presetAmounts.map((value) => ({
            label: `$${value}`,
            value,
          }))}
          type="number"
          value={amount}
        />
      </div>
      <div className="col-span-1 row-span-1 space-y-3.5">
        <Button
          className="w-full flex-1"
          data-testid="buy"
          disabled={!address || !amount || Number(amount) === 0}
          loading={faucet.isPending && 'Adding funds…'}
          type="submit"
          variant="primary"
          width="grow"
        >
          Add faucet funds
        </Button>
      </div>
    </form>
  )
}

// Bridge configuration
const targetChainId = Env.get() === 'prod' ? riseTestnet.id : riseTestnet.id // TODO: mainnet release switch chain id for prod

type BridgeToken = {
  symbol: string
  address: Address.Address
  bridgeContract: Address.Address
  bridgeType: 'hyperlane' | 'layerzero'
  minDeposit: bigint
  decimals: number
}

// Hardcoded token configurations for bridging
const BRIDGE_TOKENS: Record<number, BridgeToken[]> = {
  // Rise Testnet
  [riseTestnet.id]: [
    {
      address: '0x212Ee1EE02203e279c23bC8aB52c5b4428A3eCc7' as Address.Address,
      bridgeContract:
        '0x212Ee1EE02203e279c23bC8aB52c5b4428A3eCc7' as Address.Address,
      bridgeType: 'hyperlane',
      decimals: 18,
      minDeposit: Value.from('0.1', 18), // 0.1 USDC
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
      decimals: 18,
      minDeposit: Value.from('0.1', 18), // 0.1 USDC
      symbol: 'USDC',
    },
  ],
}

function BridgeFromChain(props: {
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

  const { data: chains } = useQuery({
    queryFn: () => {
      // Filter out the target chain from available chains
      return porto._internal.config.chains.filter((c) => c.id !== targetChainId)
    },
    queryKey: ['bridge-chains', targetChainId],
  })

  const tokens = React.useMemo(() => {
    if (!selectedChainId) return []
    // Filter out native tokens (zeroAddress) as we don't support bridging them yet
    return (BRIDGE_TOKENS[selectedChainId] ?? []).filter(
      (token) => token.address.toLowerCase() !== zeroAddress.toLowerCase(),
    )
  }, [selectedChainId])

  const { data: tokenBalance, refetch: refetchBalance } = useQuery({
    enabled: Boolean(selectedChainId && selectedTokenAddress && address),
    async queryFn() {
      if (!selectedChainId || !selectedTokenAddress) return 0n

      const hexChainId = `0x${selectedChainId.toString(16)}` as Hex.Hex
      const isNative =
        selectedTokenAddress.toLowerCase() === zeroAddress.toLowerCase()
      const response = await porto.provider.request({
        method: 'wallet_getAssets',
        params: [
          {
            account: address,
            assetFilter: {
              [hexChainId]: [
                {
                  address: isNative
                    ? ('native' as const)
                    : selectedTokenAddress,
                  type: isNative ? 'native' : 'erc20',
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
      'bridge-token-balance',
      selectedChainId,
      selectedTokenAddress,
      address,
    ],
  })

  useWatchBlockNumber({
    chainId: selectedChainId as never,
    enabled: Boolean(selectedChainId && selectedTokenAddress),
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
    return BRIDGE_TOKENS[targetChainId]?.find(
      (t) => t.symbol === selectedToken?.symbol,
    )
  }, [selectedToken])

  const canBridge = React.useMemo(() => {
    if (!tokenBalance || !selectedToken) return false
    return tokenBalance >= selectedToken.minDeposit
  }, [tokenBalance, selectedToken])

  const {
    data: bridgeData,
    isPending: isBridgePending,
    sendCallsSync,
    isSuccess: isSendCallsSuccess,
    error: bridgeError,
  } = useSendCallsSync()

  // Track initial balance before bridge
  const [initialDestBalance, setInitialDestBalance] = React.useState<
    bigint | undefined
  >()

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
              'function transferRemote(uint32 _destination,bytes32 _recipient,uint256 _amount)',
            ),
          ],
          args: [targetChainId, pad(address), tokenBalance],
          functionName: 'transferRemote',
          to: selectedToken.bridgeContract,
          value: 1n,
        },
      ],
      chainId: selectedChainId as never,
    })
  }

  // Show bridge progress view
  if (bridgeState.status !== 'idle') {
    const sourceChain = chains?.find((c) => c.id === bridgeState.sourceChainId)
    const allChains = [...(chains ?? []), ...porto._internal.config.chains]
    const destChain = allChains.find((c: any) => c.id === targetChainId)

    return (
      <Layout>
        <Layout.Header>
          <Layout.Header.Default
            icon={bridgeState.status === 'completed' ? CheckCircle : Star}
            title={
              bridgeState.status === 'completed'
                ? 'Bridge completed'
                : 'Bridging in progress'
            }
            variant={bridgeState.status === 'completed' ? 'success' : 'default'}
          />
        </Layout.Header>

        <Layout.Content>
          <div className="flex flex-col gap-3">
            <Separator label="Bridge status" size="medium" spacing={0} />
            {bridgeError && (
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-th_base">
                      Bridge error
                    </div>
                    <div className="text-sm text-th_base-secondary">
                      {bridgeError.message}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Source Chain Status */}
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  {bridgeState.status === 'source-pending' ? (
                    <Spinner size="small" />
                  ) : (
                    <CheckCircle className="size-5 text-th_positive" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-th_base">
                    Source chain transaction
                  </div>
                  <div className="text-sm text-th_base-secondary">
                    {sourceChain?.name}
                  </div>
                  {bridgeState.sourceTxHash && (
                    <div className="mt-1 flex items-center gap-2">
                      <a
                        className="flex items-center gap-1 text-sm text-th_primary hover:underline"
                        href={`${sourceChain?.blockExplorers?.default?.url}/tx/${bridgeState.sourceTxHash}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        View on explorer
                        <ExternalLink className="size-3" />
                      </a>
                      <CopyButton
                        size="mini"
                        value={bridgeState.sourceTxHash}
                        variant="content"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Destination Chain Status */}
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  {bridgeState.status === 'completed' ? (
                    <CheckCircle className="size-5 text-th_positive" />
                  ) : bridgeState.status === 'destination-pending' ? (
                    <Spinner size="small" />
                  ) : (
                    <div className="size-5 rounded-full border-2 border-th_base-secondary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-th_base">
                    Destination chain receipt
                  </div>
                  <div className="text-sm text-th_base-secondary">
                    {destChain?.name}
                  </div>
                  {bridgeState.status === 'destination-pending' && (
                    <div className="mt-1 text-sm text-th_base-secondary">
                      Waiting for bridge to complete...
                    </div>
                  )}
                  {bridgeState.status === 'completed' && (
                    <div className="mt-1 text-sm text-th_positive">
                      Tokens received successfully
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedToken && tokenBalance && (
              <Details opened>
                <Details.Item
                  label="Amount"
                  value={`${Value.format(tokenBalance, selectedToken.decimals)} ${selectedToken.symbol}`}
                />
                <Details.Item
                  label="Bridge type"
                  value={selectedToken.bridgeType.toUpperCase()}
                />
              </Details>
            )}
          </div>
        </Layout.Content>

        <Layout.Footer>
          <Layout.Footer.Actions>
            {bridgeState.status === 'completed' ? (
              <Button
                onClick={() => onSuccess()}
                variant="primary"
                width="full"
              >
                Done
              </Button>
            ) : (
              <Button disabled variant="secondary" width="full">
                Bridge in progress...
              </Button>
            )}
          </Layout.Footer.Actions>
        </Layout.Footer>
      </Layout>
    )
  }

  const mintToken = async () => {
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
