import { Button, Toast } from '@porto/apps/components'
import type { Address } from 'ox'
import { useState } from 'react'
import { Chains } from 'rise-wallet'
import { Hooks } from 'rise-wallet/wagmi'
import { toast } from 'sonner'
import { useAccount, useCapabilities, useSwitchChain } from 'wagmi'

export const SupportedAssets = [
  { decimal: 18, label: 'ETH', logo: '' },
  { decimal: 18, label: 'USDC', logo: '' },
  { decimal: 18, label: 'USDT', logo: '' },
]

export type AssetProps = {
  chain: string
}

export default function AssetSelection(props: Readonly<AssetProps>) {
  const { chain } = props
  const [selectedAsset, setSelectedAsset] = useState('')

  const { isConnected, address } = useAccount()
  const capabilities = useCapabilities({
    query: { enabled: isConnected },
  })

  const { switchChainAsync } = useSwitchChain()

  const addFunds = Hooks.useAddFunds({
    mutation: {
      onError: (error) => {
        if (error.name === 'UserRejectedRequestError') return
        toast.custom((t) => (
          <Toast
            className={t}
            description={error.message}
            kind="error"
            title="Failed to add funds"
          />
        ))
      },
      onSuccess: () => {
        // TODO: make success message part of the dialog
        toast.custom((t) => (
          <Toast
            className={t}
            description="Funds added successfully"
            kind="success"
            title="Funds Added"
          />
        ))
      },
    },
  })

  const handleAddFunds = async () => {
    // if url has testnet search param
    const urlHasTestnet = window.location.search.includes('testnet')
    if (!urlHasTestnet) {
      addFunds.mutate({
        address,
      })
      return
    }
    await switchChainAsync({
      chainId: Chains.riseTestnet.id,
    }).catch()
    if (!capabilities.data) return
    const exp1 = capabilities.data?.[
      Chains.riseTestnet.id
    ]?.feeToken?.tokens?.find((t: any) => t.uid === 'exp1')
    if (!exp1) return
    addFunds.mutate({
      address,
      chainId: Chains.riseTestnet.id,
      token: exp1?.address as Address.Address,
      // @ts-expect-error TODO: fix type
      tokenAddress: exp1?.address as Address.Address,
    })
  }

  return (
    <div className="space-y-2">
      {SupportedAssets.map((asset) => {
        return (
          <Button
            // TODO: Fix why variant outline bg does not take effect
            className="flex w-full items-center justify-start rounded-lg bg-white p-4 transition-colors dark:bg-black"
            key={asset.label}
            onClick={() => {
              setSelectedAsset(asset.label)
            }}
            type="button"
          >
            {/* {chain.logo} */}
            {asset.label}
          </Button>
        )
      })}
      <Button
        className="flex w-full items-center rounded-lg"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          return handleAddFunds()
        }}
        type="button"
        variant="primary"
      >
        Continue
      </Button>
    </div>
  )
}
