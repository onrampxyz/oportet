import { Button } from '@porto/apps/components'
import { useState } from 'react'
import { Chains } from 'rise-wallet'
import type { View } from '../AddFunds'

export const SupportedChain = [
  {
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    label: Chains.riseTestnet.name,
    logo: '/chains/rise.svg',
    name: 'Ethereum',
    symbol: 'ETH',
  },
  {
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    label: Chains.baseSepolia.name,
    logo: '/chains/sepolia.svg',
    name: 'Ethereum',
    symbol: 'ETH',
  },
]

export type ChainProps = {
  setView: (view: View) => {}
}

export default function ChainSelection(props: ChainProps) {
  const { setView } = props

  const [selectedChain, setSelectedChain] = useState('')

  return (
    <div className="space-y-2">
      {SupportedChain.map((chain) => {
        return (
          <Button
            className="flex w-full items-center justify-start gap-2 rounded-lg"
            data-selected={selectedChain === chain.label}
            key={chain.label}
            onClick={() => {
              setSelectedChain(chain.label)
              setView('selection-asset')
            }}
            type="button"
            variant="outline"
          >
            <img
              alt={`${chain.label}-Logo`}
              height={18}
              src={chain.logo}
              width={18}
            />
            <span className="pt-0.5">{chain.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
