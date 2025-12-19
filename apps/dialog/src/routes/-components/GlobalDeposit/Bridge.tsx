import { Button, CopyButton, Details, Spinner } from '@porto/ui'
import { type Hex, Value } from 'ox'
import { porto } from '~/lib/Porto'
import { Layout } from '~/routes/-components/Layout'
import CheckCircle from '~icons/lucide/check-circle'
import CircleDashed from '~icons/lucide/circle-dashed'
import XCircle from '~icons/lucide/circle-x'
import ExternalLink from '~icons/lucide/external-link'
import type { BridgeToken } from './BridgeFromChain'

export type BridgeState = {
  status:
  | 'idle'
  | 'source-pending'
  | 'source-confirmed'
  | 'source-failed'
  | 'destination-pending'
  | 'completed'
  | 'failed'
  sourceChainId?: number
  sourceTxHash?: Hex.Hex
  destinationTxHash?: Hex.Hex
}

export type BridgeProps = {
  bridgeState: BridgeState
  bridgeError?: Error | null
  chains?: readonly { id: number; name: string; blockExplorers?: any }[]
  targetChainId: number
  selectedToken?: BridgeToken
  amount?: bigint
  onSuccess: () => void
  onRetry?: () => void | Promise<void>
}

export function Bridge(props: BridgeProps) {
  const {
    bridgeState,
    bridgeError,
    chains,
    targetChainId,
    selectedToken,
    amount,
    onSuccess,
    onRetry,
  } = props

  console.log('bridgeState:: ', bridgeState)

  const sourceChain = chains?.find((c) => c.id === bridgeState.sourceChainId)
  const allChains = [...(chains ?? []), ...porto._internal.config.chains]
  const destChain = allChains.find((c: any) => c.id === targetChainId)

  return (
    <Layout>
      <Layout.Header>
        <Layout.Header.Default
          title="Bridge Status"
          variant={bridgeState.status === 'completed' ? 'success' : 'default'}
        />
      </Layout.Header>

      <Layout.Content>
        <div className="flex flex-col gap-3">
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
                {bridgeState.status === 'source-pending' && (
                  <Spinner color="purple" size="small" />
                )}
                {bridgeState.status === 'source-confirmed' && (
                  <CheckCircle className="size-5 text-th_positive" />
                )}
                {bridgeState.status === 'source-failed' && (
                  <XCircle className="size-5" color="red" />
                )}
                <CircleDashed
                  className='block size-5 data-[hidden=true]:hidden'
                  color="gray"
                  data-hidden={
                    bridgeState.status === 'source-pending' ||
                    bridgeState.status === 'source-confirmed' ||
                    bridgeState.status === 'source-failed'
                  }
                />
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
                {bridgeState.status === 'destination-pending' && (
                  <Spinner color="purple" size="small" />
                )}
                {bridgeState.status === 'completed' && (
                  <CheckCircle className="size-5 text-th_positive" />
                )}
                {bridgeState.status === 'failed' && (
                  <XCircle className="size-5" color="red" />
                )}

                <CircleDashed
                  className='block size-5 data-[hidden=true]:hidden'
                  color="gray"
                  data-hidden={
                    bridgeState.status === 'destination-pending' ||
                    bridgeState.status === 'completed' ||
                    bridgeState.status === 'failed'
                  }
                />
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

          {selectedToken && amount !== undefined && (
            <Details opened>
              {/* <Details.Item
                label="Amount"
                value={`${Value.format(amount, selectedToken.decimals)} ${selectedToken.symbol}`}
              /> */}
              {/* TODO: Fix this */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-th_base">Amount</p>
                <p className="text-th_base">
                  <span className="font-bold">
                    {' '}
                    {Value.format(amount, selectedToken.decimals)}{' '}
                  </span>
                  {selectedToken.symbol}
                </p>
              </div>
              {/* <Details.Item
                label="Bridge type"
                value={selectedToken.bridgeType.toUpperCase()}
              /> */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-th_base">Bridge type</p>
                <p className="text-th_base">
                  {selectedToken.bridgeType.toUpperCase()}
                </p>
              </div>
            </Details>
          )}
        </div>
      </Layout.Content>

      <Layout.Footer>
        <Layout.Footer.Actions>
          {(bridgeState.status === 'failed' ||
            bridgeState.status === 'source-failed') &&
            onRetry && (
              <Button onClick={onRetry} variant="primary" width="full">
                Retry
              </Button>
            )}
          {bridgeState.status === 'completed' && (
            <Button onClick={() => onSuccess()} variant="primary" width="full">
              Done
            </Button>
          )}

          <Button
            className="hidden size-5 data-[visible=true]:block"
            color="gray"
            data-visible={
              bridgeState.status === 'source-pending' ||
              bridgeState.status === 'source-confirmed' ||
              bridgeState.status === 'destination-pending'
            }
            disabled
            variant="secondary"
            width="full"
          >
            Bridge in progress...
          </Button>
        </Layout.Footer.Actions>
      </Layout.Footer>
    </Layout>
  )
}
