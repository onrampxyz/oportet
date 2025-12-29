import { Button, DiscIcon } from '@porto/ui'
import type { Address } from 'ox'
import { Value } from 'ox'
import * as React from 'react'
import { zeroAddress } from 'viem'
import { riseTestnet } from 'viem/chains'
import { useFundsContext } from '~/contexts'
import { Layout } from '../Layout'
import type { BridgeToken } from './Bridge'

export type Asset = {
  name: string
  icon: string
  symbol: string
  decimals: number
  address: Address.Address
}

// Hardcoded token configurations for bridging
export const BRIDGE_TOKENS: Record<number, BridgeToken[]> = {
  // Rise Testnet
  [riseTestnet.id]: [
    {
      address: '0x212Ee1EE02203e279c23bC8aB52c5b4428A3eCc7' as Address.Address,
      bridgeContract:
        '0x212Ee1EE02203e279c23bC8aB52c5b4428A3eCc7' as Address.Address,
      bridgeType: 'hyperlane',
      bridgeWrapper: zeroAddress,
      decimals: 18,
      icon: '/icons/usdc.svg',
      minDeposit: Value.from('0.1', 18), // 0.1 USDC
      name: 'USDC', // TODO: fix this
      symbol: 'USDC',
    },
  ],
  // Base Sepolia
  84532: [
    {
      address: '0xc966f296d1735EbD224a537D2A3C1EE8be09eAe0' as Address.Address,
      bridgeContract:
        '0x372bBdbEf8Da9fcfE058D4C7Cc6756ee6B4133B9' as Address.Address,
      bridgeType: 'hyperlane',
      bridgeWrapper: '0x9Fe63D450edC97D700fA1D0081b84569102e5C1D',
      decimals: 18,
      icon: '/icons/usdc.svg',
      minDeposit: Value.from('0.1', 18), // 0.1 USDC
      name: 'USDC', // TODO: fix this
      symbol: 'USDC',
    },
  ],
}

export function getAssets(id?: number) {
  if (!id) return []

  const tokens = (BRIDGE_TOKENS[id] ?? []).filter(
    (token) => token.address.toLowerCase() !== zeroAddress.toLowerCase(),
  )

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
