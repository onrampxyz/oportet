import { Button, DiscIcon } from '@porto/ui'
import { useState } from 'react'
import { Chains } from 'rise-wallet'
import type { View } from '../AddFunds'
import { Layout } from '../Layout'

export type Chain = {
  id: number
  name: string
  icon: string
}

export const SupportedChains = [
  {
    icon: '/chains/rise.svg',
    id: Chains.riseTestnet.id,
    name: Chains.riseTestnet.name,
  },
  {
    icon: '/chains/sepolia.svg',
    id: Chains.baseSepolia.id,
    name: Chains.baseSepolia.name,
  },
]

export type ChainProps = {
  setView: (view: View) => void
}

export function ChainSelection(props: ChainProps) {
  const { setView } = props

  const [selectedChain, setSelectedChain] = useState('')

  return (
    <Layout>
      <Layout.Header>
        <Layout.Header.Default
          subContent="Deposit token from this chain"
          title="Choose a Network"
          variant="default"
        />
      </Layout.Header>
      <Layout.Content>
        <div className="space-y-2 pt-4">
          {SupportedChains.map((chain) => {
            return (
              <Button
                className='justify-start! flex w-full items-center gap-2 rounded-lg'
                data-selected={selectedChain === chain.name}
                key={chain.name}
                onClick={() => {
                  setSelectedChain(chain.name)
                  setView('selection-asset')
                }}
                type="button"
                variant="secondary"
              >
                <DiscIcon
                  src={chain.icon}
                />
                <span className="pt-0.5">{chain.name}</span>
              </Button>
            )
          })}
        </div>
      </Layout.Content>
    </Layout>
  )
}
