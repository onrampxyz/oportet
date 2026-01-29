import { Env } from '@porto/apps'
import { Button, CopyButton, Spinner } from '@porto/ui'
import type { Hex } from 'ox'
import { formatUnits } from 'viem'
import { riseTestnet } from 'viem/chains'
import { useLayerZeroMessage } from '~/hooks'
import type { Chain } from '~/routes/-components/GlobalDeposit/ChainSelection'
import { Layout } from '~/routes/-components/Layout'
import ArrowLeft from '~icons/lucide/arrow-left'
import ExternalLink from '~icons/lucide/external-link'
import XIcon from '~icons/lucide/x'

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
  bridgeType: 'hyperlane' | 'layerzero'
  minDeposit: bigint
  decimals: number
  bridgeWrapper: Hex.Hex
  icon: string
  name: string
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

  const lzMessage = useLayerZeroMessage({
    enabled: !!bridgeState?.sourceTxHash,
    transactionId: bridgeState?.sourceTxHash,
  })

  if (lzMessage.status !== 'pending') {
    console.log('lzMessage-data:: ', lzMessage.data)
    console.log('lzMessage:: ', lzMessage)
  }

  if (!selectedToken || !amount) {
    return null
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
        <div className="flex flex-col gap-2">
          <div className="space-y-1 rounded-md bg-th_base-alt p-2 text-sm text-th_base">
            <p className="pb-1 text-th_base-secondary">Source Chain</p>
            <div className="rounded-lg border border-th_base bg-th_base px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-bold">{selectedChain?.name}</span>
                {bridgeState.status === 'pending' && (
                  <div className="flex items-center gap-1">
                    <Spinner color="gray" size="small" />
                    <p className='text-th_base-secondary'>Waiting</p>
                  </div>
                )}
                {bridgeState.status === 'failed' && (
                  <div className="flex items-center gap-1 text-destructive">
                    <XIcon className="size-4" color="red" />
                    <p>Failed</p>
                  </div>
                )}
                {/* TODO: add layerzero status handling here */}
              </div>
              <p className="text-th_base-secondary text-xs">
                {formatUnits(amount, selectedToken.decimals)}{' '}
                {selectedToken.symbol}
              </p>
            </div>
          </div>

          <div className="space-y-1 rounded-md bg-th_base-alt p-2 text-sm text-th_base">
            <p className="pb-1 text-th_base-secondary">Destination Chain</p>
            <div className="rounded-lg border border-th_base bg-th_base px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-bold">{riseTestnet?.name}</span>
                {bridgeState.status === 'pending' && <p className='text-th_base-secondary'>Not Started</p>}
                {bridgeState.status === 'failed' && (
                  <div className='flex items-center gap-1 text-destructive'>
                    <XIcon className="size-4" color="red" />
                    <p>Failed</p>
                  </div>
                )}

                {/* TODO: add layerzero status handling here */}
              </div>
              <p className="text-th_base-secondary text-xs">
                {formatUnits(amount, selectedToken.decimals)}{' '}
                {selectedToken?.symbol}
              </p>
            </div>
          </div>

          {bridgeState.status !== 'pending' && (
            <div className="overflow-hidden rounded-md text-center text-sm text-th_base">
              {bridgeState.status === 'completed' && (
                <div className="space-y-2 bg-th_base-alt p-2">
                  <div>
                    <p className="font-bold text-base">
                      Transaction Submitted!
                    </p>
                    <p className="text-th_base-secondary text-xs">
                      Your transaction has been submitted and is being
                      processed.
                    </p>
                  </div>

                  {bridgeState.sourceTxHash && (
                    <div className="rounded-md border border-th_base p-2">
                      <p className="">Transaction Hash</p>
                      <p className="space-x-2 text-th_base-secondary text-xs">
                        {bridgeState.sourceTxHash}
                        <CopyButton
                          size="mini"
                          value={bridgeState.sourceTxHash}
                          variant="content"
                        />
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <a
                      className="flex items-center gap-1 text-sm text-th_base-secondary hover:underline"
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
                    <p className="text-th_base-secondary text-xs">
                      <span className="font-bold">Note:</span> Transaction may
                      take a few minutes to appear on the explorer
                    </p>
                  </div>
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
        </div>
      </Layout.Content>

      <Layout.Footer className="min-h-0!">
        <Layout.Footer.Actions>
          {bridgeState.status === 'pending' && (
            <Button disabled variant="primary" width="full">
              Processing
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
