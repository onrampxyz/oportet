import { usePrevious } from '@porto/apps/hooks'
import { Button, Separator } from '@porto/ui'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Address, Hex } from 'ox'
import * as React from 'react'
import { Hooks as RemoteHooks } from 'rise-wallet/remote'
import { RelayActions } from 'rise-wallet/viem'
import { Hooks } from 'rise-wallet/wagmi'
import { zeroAddress, zeroHash } from 'viem'
import { useWatchBlockNumber } from 'wagmi'
import { DepositButtons } from '~/components/DepositButtons'
import { FundsProvider, useFundsContext } from '~/contexts'
import { useOnrampOrder } from '~/lib/onramp'
import { porto } from '~/lib/Porto'
import * as Tokens from '~/lib/Tokens'
import { Layout } from '~/routes/-components/Layout'
import Star from '~icons/ph/star-four-bold'
import { ApplePayButton, ApplePayIframe } from './ActionPreview'
import {
  AssetSelection,
  ChainSelection,
  DepositSelection,
  GlobalDeposit,
} from './GlobalDeposit'
import { BridgeFromChain } from './GlobalDeposit/BridgeFromChain'
import { DepositError } from './GlobalDeposit/DepositError'
import { SetupApplePay } from './SetupApplePay'

// const presetAmounts = ['30', '50', '100', '250'] as const
// const maxAmount = 500

export type View =
  | 'default'
  | 'error'
  | 'onramp'
  | 'setup-onramp'
  | 'bridge'
  | 'selection-network'
  | 'selection-asset'
  | 'selection-deposit'
  | 'global-deposit'

function AddFundsContent(props: Readonly<AddFunds.Props>) {
  const { chainId, onApprove, onReject, value } = props

  const { view, setView } = useFundsContext()

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

  if (view === 'error') return <DepositError />

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

  if (view === 'selection-deposit') {
    return <DepositSelection />
  }

  if (view === 'selection-network') {
    return <ChainSelection />
  }

  if (view === 'selection-asset') {
    return <AssetSelection />
  }

  if (view === 'global-deposit') {
    return <GlobalDeposit />
  }

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

export function AddFunds(props: AddFunds.Props) {
  const account = RemoteHooks.useAccount(porto)
  const address = props.address ?? account?.address

  return (
    <FundsProvider
      address={address}
      initialView={(props.view as View) ?? 'default'}
    >
      <AddFundsContent {...props} />
    </FundsProvider>
  )
}

export declare namespace AddFunds {
  export type Props = {
    address?: Address.Address | undefined
    chainId?: number | undefined
    onApprove: (result: { id: Hex.Hex }) => void
    onReject?: () => void
    value?: string | undefined
    view?: string
  }
}
