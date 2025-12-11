import { Button, DiscIcon } from '@porto/ui'
import { Chains } from 'rise-wallet'
import { useFundsContext } from '~/contexts'
import { Layout } from '../Layout'

export type Chain = {
  id: number
  name: string
  icon: string
}

export const SupportedChains: Chain[] = [
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

export function ChainSelection() {
  const { selectedChain, setSelectedChain, setView } = useFundsContext()

  return (
    <Layout>
      <Layout.Header>
        <Layout.Header.Default
          subContent="Deposit token from these chains"
          title="Choose a Network"
          variant="default"
        />
      </Layout.Header>
      <Layout.Content>
        <div className="space-y-2 pt-3">
          {SupportedChains.map((chain) => {
            return (
              <Button
                className="justify-start! flex w-full items-center gap-2 rounded-lg"
                data-selected={selectedChain?.name === chain.name}
                key={chain.name}
                onClick={() => {
                  setSelectedChain(chain)
                  setView('selection-asset')
                }}
                type="button"
                variant="secondary"
              >
                <DiscIcon src={chain.icon} />
                <span className="pt-0.5">{chain.name}</span>
              </Button>
            )
          })}
        </div>
      </Layout.Content>
    </Layout>
  )
}
