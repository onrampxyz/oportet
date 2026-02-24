import { Button, DiscIcon } from '@porto/ui'
import type { Address } from 'ox'
import { useFundsContext } from '~/contexts'
import { useBridgeSupportedTokens } from '~/hooks'
import { Layout } from '../Layout'

export type Asset = {
  name: string
  icon: string
  symbol: string
  decimals: number
  address: Address.Address
}

export function AssetSelection() {
  const { selectedAsset, selectedChain, setSelectedAsset, setView } =
    useFundsContext()

  const { tokens } = useBridgeSupportedTokens()

  if (!selectedChain) {
    return null
  }

  // Get tokens based on selected chain ID from BRIDGE_TOKENS
  const supportedAssets = tokens[selectedChain.id]

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
          {supportedAssets?.map((asset) => {
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
