import { Button, DiscIcon } from '@porto/ui'
import type { Address } from 'ox'
import { useState } from 'react'
import type { View } from '../AddFunds'
import { Layout } from '../Layout'

export type Asset = {
  name: string
  icon: string
  symbol: string
  decimals: number
  address: Address.Address
}

export const SupportedAssets: Asset[] = [
  {
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    icon: '/icons/eth.svg',
    name: 'Ethereum',
    symbol: 'ETH',
  },
]

export type AssetProps = {
  setView: (view: View) => void
}

export function AssetSelection(props: Readonly<AssetProps>) {
  const { setView } = props
  const [selectedAsset, setSelectedAsset] = useState('')

  return (
    <Layout>
      <Layout.Header>
        <Layout.Header.Default
          subContent="Select Token to be deposited to RISE"
          title="Choose an Asset"
          variant="default"
        />
      </Layout.Header>
      <Layout.Content>
        <div className="space-y-2 pt-4">
          {SupportedAssets.map((asset) => {
            return (
              <Button
                className='justify-start! flex w-full items-center gap-2 rounded-lg'
                data-selected={selectedAsset === asset.symbol}
                key={asset.name}
                onClick={() => {
                  setSelectedAsset(asset.symbol)
                  setView('onramp')
                }}
                type="button"
                variant="secondary"
              >
                <DiscIcon
                  src={asset.icon}
                />
                <span className="pt-0.5">{asset.symbol}</span>
              </Button>
            )
          })}
        </div>
      </Layout.Content>
    </Layout>
  )
}
