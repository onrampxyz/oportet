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
      address: '0x52b0b93aa1818359257149E005eC1AC2BCc3Eb1E' as Address.Address,
      bridgeContract:
        '0x52b0b93aa1818359257149E005eC1AC2BCc3Eb1E' as Address.Address,
      bridgeType: 'layerzero',
      bridgeWrapper: zeroAddress,
      decimals: 18,
      icon: '/dialog/ui/token-icons/usdc.svg',
      minDeposit: Value.from('0.1', 18), // 0.1 USDC
      name: 'USDC', // TODO: fix this
      symbol: 'USDC',
    },
    {
      address: '0x57BfEf022E97Ad3877381a72b7E32F019596919e' as Address.Address,
      bridgeContract:
        '0x57BfEf022E97Ad3877381a72b7E32F019596919e' as Address.Address,
      bridgeType: 'layerzero',
      bridgeWrapper: zeroAddress,
      decimals: 18,
      icon: '/dialog/ui/token-icons/usdt.svg',
      minDeposit: Value.from('0.1', 18), // 0.1 USDC
      name: 'USDT', // TODO: fix this
      symbol: 'USDT',
    },
  ],
  // Eth Sepolia
  11155111: [
    {
      address: '0x28Cd50d58f80Da33B16542cdF8ce59717F66b957' as Address.Address,
      bridgeContract:
        '0x8421D6445915b251bE303475dfCdD083e4aCBA0f' as Address.Address,
      bridgeType: 'layerzero',
      bridgeWrapper: '0x226cefe884c9425377954fB9B5Cb9AD4BdCD398D',
      decimals: 18,
      icon: '/icons/usdc.svg',
      minDeposit: Value.from('0.1', 18), // 0.1 USDC
      name: 'USDC', // TODO: fix this
      symbol: 'USDC',
    },
    {
      address: '0x9Fe63D450edC97D700fA1D0081b84569102e5C1D' as Address.Address,
      bridgeContract:
        '0x046832405512D508b873E65174E51613291083bC' as Address.Address,
      bridgeType: 'layerzero',
      bridgeWrapper: '0x226cefe884c9425377954fB9B5Cb9AD4BdCD398D',
      decimals: 18,
      icon: '/icons/usdt.svg',
      minDeposit: Value.from('0.1', 18), // 0.1 USDC
      name: 'USDT', // TODO: fix this
      symbol: 'USDT',
    },
  ],
}

export function getAssets(id?: number) {
  if (!id) return []

  const tokens = (BRIDGE_TOKENS[id] ?? []).filter(
    (token) => token.address.toLowerCase() !== zeroAddress.toLowerCase(),
  )

  console.log('tokens:: ', tokens)
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
