import { Button } from '@porto/ui'
import { useState } from 'react'
import type { View } from '../AddFunds'

export const SupportedAssets = [
  {
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    logo: '/icons/eth.svg',
    name: 'Ethereum',
    symbol: 'ETH',
  },
]

export type AssetProps = {
  setView: (view: View) => {}
}

export default function AssetSelection(props: Readonly<AssetProps>) {
  const { setView } = props
  const [selectedAsset, setSelectedAsset] = useState('')

  return (
    <div className="space-y-2">
      {SupportedAssets.map((asset) => {
        return (
          <Button
            className="flex w-full items-center justify-start gap-2 rounded-lg"
            data-selected={selectedAsset === asset.symbol}
            key={asset.name}
            onClick={() => {
              setSelectedAsset(asset.symbol)
            }}
            type="button"
          >
            <img
              alt={`${asset.name}-Logo`}
              height={18}
              src={asset.logo}
              width={18}
            />
            <span className="pt-0.5">{asset.symbol}</span>
          </Button>
        )
      })}
      <Button
        className="flex w-full items-center rounded-lg"
        onClick={() => {
          setView("onramp")
        }}
        type="button"
        variant="primary"
      >
        Continue
      </Button>
    </div>
  )
}
