import { Button, CopyButton, Details, Spinner } from '@porto/ui'
import { type Hex, Value } from 'ox'
import { Layout } from '~/routes/-components/Layout'
import CheckCircle from '~icons/lucide/check-circle'
import XCircle from '~icons/lucide/circle-x'
import ExternalLink from '~icons/lucide/external-link'

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
  amount?: bigint
  onSuccess: () => void
  onRetry?: () => void | Promise<void>
}

export function ErrorDisplay(
  props: Readonly<{ message: string; hidden: boolean }>,
) {
  const { message, hidden } = props

  if (hidden) {
    return null
  }

  return <div className="text-destructive text-sm max-w-[320px]">{message}</div>
}

export function Bridge(props: Readonly<BridgeProps>) {
  const { bridgeState, selectedToken, amount, onSuccess, onRetry } = props

  console.log('bridgeState:: ', bridgeState)

  const isFailed = bridgeState.status === 'failed'

  return (
    <Layout>
      <Layout.Header>
        <Layout.Header.Default
          title="Bridge Status"
          variant={isFailed ? 'destructive' : 'default'}
        />
      </Layout.Header>

      <Layout.Content>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            {/* Source Chain Status */}
            <div className="flex items-start gap-2">
              <div className="mt-1">
                {bridgeState.status === 'pending' && (
                  <Spinner color="purple" size="small" />
                )}
                {bridgeState.status === 'completed' && (
                  <CheckCircle className="size-5 " color="green" />
                )}
                {bridgeState.status === 'failed' && (
                  <XCircle className="size-5" color="red" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-th_base pt-0.5">
                  Bridge transaction
                </div>
                <ErrorDisplay
                  hidden={bridgeState.status !== 'failed'}
                  message={bridgeState.message ?? ''}
                />
                {bridgeState.sourceTxHash && (
                  <div className="flex items-center gap-2">
                    <a
                      className="flex items-center gap-1 text-sm text-th_base-secondary hover:underline"
                      href={`https://testnet.layerzeroscan.com/tx/${bridgeState.sourceTxHash}`}
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
          </div>

          {selectedToken && amount !== undefined && (
            <Details opened>
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
          {bridgeState.status === 'failed' && onRetry && (
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
            className="hidden size-5 data-[visible=true]:block text-center"
            color="gray"
            data-visible={bridgeState.status === 'pending'}
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
