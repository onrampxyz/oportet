import { Button, DiscIcon } from '@porto/ui'
import type { Address } from 'ox'
import * as React from 'react'
import { useFundsContext } from '~/contexts'
import { Layout } from '../Layout'
import { BRIDGE_TOKENS } from './BridgeFromChain'

export type Asset = {
  name: string
  icon: string
  symbol: string
  decimals: number
  address: Address.Address
}

export function getAssets(id?: number) {
  if (!id) return []

  const tokens = BRIDGE_TOKENS[id] ?? []
  console.log('tokens::', tokens)

  return tokens
}

export function AssetSelection() {
  const { selectedAsset, selectedChain, setSelectedAsset, setView } =
    useFundsContext()

  // Get tokens based on selected chain ID from BRIDGE_TOKENS
  const supportedAssets = React.useMemo(() => {
    return getAssets(selectedChain?.id)
  }, [selectedChain])

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
        <div className="space-y-2 pt-3">
          {supportedAssets.map((asset) => {
            return (
              <Button
                className="justify-start! flex w-full items-center gap-2 rounded-lg"
                data-selected={selectedAsset?.symbol === asset.symbol}
                key={asset.symbol}
                onClick={() => {
                  setSelectedAsset(asset)
                  setView('global-deposit')
                }}
                type="button"
                variant="secondary"
              >
                <DiscIcon src={asset.icon} />
                <span className="pt-0.5">{asset.symbol}</span>
              </Button>
            )
          })}
        </div>
      </Layout.Content>
    </Layout>
  )
}
