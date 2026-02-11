import type { Address } from 'ox'
import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import type { BridgeToken } from '~/routes/-components/GlobalDeposit'
import type { Chain } from '../routes/-components/GlobalDeposit/ChainSelection'

export type View =
  | 'default'
  | 'error'
  | 'onramp'
  | 'setup-onramp'
  | 'bridge'
  | 'selection-network'
  | 'selection-asset'
  | 'selection-deposit'
  | 'global-deposit'

type FundsContextValue = {
  // View state
  view: View
  setView: (view: View) => void

  // Selection state
  selectedChain: Chain | undefined
  setSelectedChain: (chain: Chain | undefined) => void

  selectedAsset: BridgeToken | undefined
  setSelectedAsset: (asset: BridgeToken | undefined) => void

  amount: string
  setAmount: (amount: string) => void

  // User address
  address?: Address.Address
}

const FundsContext = createContext<FundsContextValue | null>(null)

export function useFundsContext() {
  const context = useContext(FundsContext)
  if (!context) {
    throw new Error('useFundsContext must be used within a FundsProvider')
  }
  return context
}

export type FundsProviderProps = {
  children: ReactNode
  initialView?: View
  address?: Address.Address
}

export function FundsProvider({
  address,
  children,
  initialView = 'default',
}: Readonly<FundsProviderProps>) {
  const [view, setView] = useState<View>(initialView)
  const [selectedChain, setSelectedChain] = useState<Chain | undefined>()
  const [selectedAsset, setSelectedAsset] = useState<BridgeToken | undefined>()
  const [amount, setAmount] = useState<string>('')

  const value = useMemo(() => {
    return {
      address,
      amount,
      selectedAsset,
      selectedChain,
      setAmount,
      setSelectedAsset,
      setSelectedChain,
      setView,
      view,
    }
  }, [address, amount, selectedAsset, selectedChain, view])

  return <FundsContext.Provider value={value}>{children}</FundsContext.Provider>
}
