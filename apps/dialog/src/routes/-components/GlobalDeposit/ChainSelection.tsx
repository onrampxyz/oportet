import { Button } from '@porto/ui'
import { Chains } from 'oportet/index'
import { useFundsContext } from '~/contexts'
import { Layout } from '../Layout'
import { ReceiveViaQr } from './ReceiveViaQr'

export type Chain = {
  id: number
  name: string
  icon: string
}

export const SupportedChains: Chain[] = [
  {
    icon: '/dialog/chains/sepolia.svg',
    id: Chains.sepolia.id,
    name: Chains.sepolia.name,
  },
]

export function ChainSelection() {
  const { selectedChain, setSelectedChain, setView, address } =
    useFundsContext()

  return (
    <Layout>
      <Layout.Content>
        {address && <ReceiveViaQr address={address} />}
        <div className="mx-2 h-3.5 border-gray7 border-b-1 text-center">
          <span className="my-auto mt-[3px] inline-flex bg-gray2 px-2 text-th_base-secondary">
            OR
          </span>
        </div>
        <p className="pt-4 text-center font-bold text-lg text-th_base">
          Global Deposit
        </p>
        <p className="text-center text-sm text-th_base-secondary">
          Bridge to your RISE Wallet
        </p>
        <div className="space-y-2 pt-4">
          {SupportedChains.map((chain) => {
            return (
              <Button
                className="justify-start! flex w-full items-center gap-2 rounded-lg bg-th_base-alt!"
                data-selected={selectedChain?.name === chain.name}
                key={chain.name}
                onClick={() => {
                  setSelectedChain(chain)
                  if (chain.id === Chains.riseTestnet.id) {
                    setView('global-deposit')
                  } else {
                    setView('selection-asset')
                  }
                }}
                type="button"
                variant="secondary"
              >
                <img
                  alt={`${chain.name}-icon`}
                  height={20}
                  src={chain.icon}
                  width={20}
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
