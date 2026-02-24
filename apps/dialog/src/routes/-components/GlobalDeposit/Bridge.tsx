import { Env } from '@porto/apps'
import { Button, CopyButton, Spinner } from '@porto/ui'
import type { Hex } from 'ox'
import { css } from 'styled-system/css'
import { formatUnits } from 'viem'
import { type Chain, type Status, useBridgeSupportedChains, useLayerZeroMessage } from '~/hooks'
import { Layout } from '~/routes/-components/Layout'
import { AddressFormatter } from '~/utils'
import ArrowLeft from '~icons/lucide/arrow-left'
import CheckIcon from '~icons/lucide/check'
import ExternalLink from '~icons/lucide/external-link'
import XIcon from '~icons/lucide/x'

// TODO: Fix this
export type BridgeStatus = 'idle' | 'pending' | 'completed' | 'failed'

export type BridgeState = {
  status: BridgeStatus
  sourceChainId?: number
  sourceTxHash?: Hex.Hex
  destinationTxHash?: Hex.Hex
  message?: string
}

export type BridgeToken = {
  symbol: string
  address: Hex.Hex
  bridgeContract: Hex.Hex
  bridgeType: 'hyperlane' | 'layerzero' | 'canonical'
  lzEndpointId?: number
  minDeposit: bigint
  decimals: number
  bridgeWrapper: Hex.Hex
  icon: string
  name: string
  adapter?: Hex.Hex
}

export type BridgeProps = {
  bridgeState: BridgeState
  bridgeError?: Error | null
  chains?: readonly { id: number; name: string; blockExplorers?: any }[]
  targetChainId: number
  selectedToken?: BridgeToken
  selectedChain?: Chain
  amount?: bigint
  back: () => void
  onNewTransaction: () => void
  onRetry?: () => void | Promise<void>
}

export function ErrorDisplay(
  props: Readonly<{ message: string; hidden: boolean }>,
) {
  const { message, hidden } = props

  if (hidden) {
    return null
  }

  return (
    <div className="break-[break-word] max-w-[320px] text-destructive text-sm">
      {message}
    </div>
  )
}

export function Bridge(props: Readonly<BridgeProps>) {
  const {
    bridgeState,
    selectedToken,
    selectedChain,
    amount,
    onNewTransaction,
    onRetry,
    back,
  } = props

  const { riseChain } = useBridgeSupportedChains()
  const { status: lzStatus, data: lzData } = useLayerZeroMessage({
    enabled: !!bridgeState?.sourceTxHash && bridgeState.status === 'completed',
    transactionId: bridgeState?.sourceTxHash,
  })

  const sourceStatus = lzData?.data[0]?.source.status
  const destinationStatus = lzData?.data[0]?.destination.status

  if (lzStatus !== 'pending') {
    console.log('lzMessage-data:: ', lzData)
    console.log('lzMessage:: ', lzStatus)
    console.log('sourceStatus:: ', sourceStatus)
    console.log('destinationStatus:: ', destinationStatus)
  }

  if (!selectedToken || !amount || !selectedChain) {
    return null
  }

  const getLzDisplayStatus = (status: Status) => {
    switch (status) {
      case 'NOT_STARTED':
        return (
          <p className="text-th_base-secondary text-xs">
            {status.replaceAll('_', ' ')}
          </p>
        )
      case 'SUCCEEDED':
        return (
          <div className="flex items-center gap-1">
            <CheckIcon className="size-4" color="green" />
            <p className="text-green-600 text-xs">{status}</p>
          </div>
        )
      case 'WAITING':
      case 'VALIDATING_TX':
      case 'WAITING_FOR_HASH_DELIVERED':
      case 'PAYLOAD_STORED':
        return (
          <div className="flex items-center gap-1">
            <Spinner color="orange" size="small" />
            <p className="text-xs text-yellow-600">
              {status.replaceAll('_', ' ')}
            </p>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1">
            <XIcon className="size-4" color="red" />
            <p className="text-red-600 text-xs">
              {status.replaceAll('_', ' ')}
            </p>
          </div>
        )
    }
  }

  const getBulletStatus = (status: Status) => {
    switch (status) {
      case 'NOT_STARTED':
        return <div className="h-3 w-2.5 rounded-full bg-th_base-alt" />
      case 'SUCCEEDED':
        return <div className="h-3 w-2.5 rounded-full bg-green-600" />
      case 'WAITING':
      case 'VALIDATING_TX':
      case 'WAITING_FOR_HASH_DELIVERED':
      case 'PAYLOAD_STORED':
        return <div className="h-3 w-2.5 rounded-full bg-yellow-600" />
      default:
        return <div className="h-3 w-2.5 rounded-full bg-red-600" />
    }
  }

  return (
    <Layout>
      <Layout.Header>
        <div className="flex items-center gap-2">
          <Button
            className="h-auto! rounded-full! bg-transparent! p-2!"
            disabled={bridgeState.status === 'pending'}
            onClick={() => back()}
            variant="secondary"
          >
            <ArrowLeft className="size-4 text-th_base" />
          </Button>
          <Layout.Header.Default
            subContent="Bridge to your RISE Wallet"
            title="Global Deposit"
            variant="default"
          />
        </div>
      </Layout.Header>
      <Layout.Content className="p-3!">
        <div className="flex gap-3">
          {/* Vertical connector with status bullets */}
          <div className="flex flex-col items-center py-4">
            {/* Source chain bullet - Transaction status here */}
            {bridgeState.status === 'failed' && getBulletStatus('FAILED')}
            {bridgeState.status === 'pending' && getBulletStatus('NOT_STARTED')}
            {/* Source chain bullet - LZ status here */}
            {bridgeState.status === 'completed' &&
              getBulletStatus(sourceStatus ?? 'WAITING')}

            {/* Dashed connector line */}
            <div className="h-full w-px border-th_base border-l border-dashed" />

            {/* Destination chain bullet */}
            {getBulletStatus(destinationStatus ?? 'NOT_STARTED')}
          </div>

          {/* Chain cards */}
          <div className="flex flex-1 flex-col gap-2">
            <div className="space-y-1 rounded-md bg-th_base-alt p-2 text-sm text-th_base">
              <p className="text-th_base-secondary">Source Chain</p>
              <div className="rounded-lg border border-th_base bg-th_base px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <img
                      alt={`${selectedChain.name}-icon`}
                      className={css({ height: 18, width: 18 })}
                      src={selectedChain.icon}
                    />
                    <span className="font-bold">{selectedChain?.name}</span>
                  </div>

                  {bridgeState.status === 'failed' &&
                    getLzDisplayStatus('FAILED')}
                  {bridgeState.status === 'pending' &&
                    getLzDisplayStatus('NOT_STARTED')}
                  {bridgeState.status === 'completed' &&
                    getLzDisplayStatus(sourceStatus ?? 'WAITING')}
                </div>
                <p className="text-th_base-secondary text-xs">
                  {formatUnits(amount, selectedToken.decimals)}{' '}
                  {selectedToken.symbol}
                </p>
              </div>
            </div>

            <div className="space-y-1 rounded-md bg-th_base-alt p-2 text-sm text-th_base">
              <p className="text-th_base-secondary">Destination Chain</p>
              <div className="rounded-lg border border-th_base bg-th_base px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <img
                      alt="RISE icon"
                      className={css({ height: 18, width: 18 })}
                      src="/dialog/chains/rise.svg"
                    />
                    {/* Destination is always RISE */}
                    <span className="font-bold">{riseChain?.name}</span>
                  </div>

                  {getLzDisplayStatus(destinationStatus ?? 'NOT_STARTED')}
                </div>
                <p className="text-th_base-secondary text-xs">
                  {formatUnits(amount, selectedToken.decimals)}{' '}
                  {selectedToken?.symbol}
                </p>
              </div>
            </div>
          </div>
        </div>

        {bridgeState.status !== 'pending' && (
          <div className="mt-2 overflow-hidden rounded-md text-center text-sm text-th_base">
            {bridgeState.status === 'completed' && (
              <div className="space-y-2 bg-th_base-alt p-2">
                {bridgeState.sourceTxHash && (
                  <div className="rounded-md border border-th_base bg-th_base p-3">
                    <p className="flex items-center justify-center">
                      {AddressFormatter.shorten(bridgeState.sourceTxHash, 8)}

                      <CopyButton
                        size="mini"
                        value={bridgeState.sourceTxHash}
                        variant="content"
                      />
                    </p>
                    <a
                      className="flex items-center justify-center gap-1 text-sm text-th_base-secondary underline hover:text-th_base"
                      href={
                        Env.get() === 'prod'
                          ? `https://testnet.layerzeroscan.com/tx/${bridgeState.sourceTxHash}`
                          : `https://layerzeroscan.com/tx/${bridgeState.sourceTxHash}`
                      }
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      View on LayerZero
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
                <p className="px-6 text-th_base-secondary text-xs">
                  <span className="font-bold">Note:</span> Transaction may take
                  a few minutes to appear on the explorer!
                </p>
              </div>
            )}
            {bridgeState.status === 'failed' && (
              <div className="place-items-center bg-th_base-alt p-2">
                <p className="">Transaction Failed!</p>
                <p className="text-destructive/75 text-xs">
                  {bridgeState.message}
                </p>
              </div>
            )}
          </div>
        )}
      </Layout.Content>

      <Layout.Footer className="min-h-0!">
        <Layout.Footer.Actions>
          {bridgeState.status === 'pending' && (
            <Button variant="primary" width="full">
              Processing...
            </Button>
          )}

          {bridgeState.status === 'failed' && onRetry && (
            <Button onClick={() => onRetry()} variant="primary" width="full">
              Retry
            </Button>
          )}
          {bridgeState.status === 'completed' && (
            <Button
              onClick={() => onNewTransaction()}
              variant="primary"
              width="full"
            >
              New Transaction
            </Button>
          )}
        </Layout.Footer.Actions>
      </Layout.Footer>
    </Layout>
  )
}
