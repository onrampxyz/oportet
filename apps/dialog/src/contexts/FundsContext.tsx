import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import type { View } from '../routes/-components/AddFunds'
import type { Asset } from '../routes/-components/GlobalDeposit/AssetSelection'
import type { Chain } from '../routes/-components/GlobalDeposit/ChainSelection'

type FundsContextValue = {
  // View state
  view: View
  setView: (view: View) => void

  // Selection state
  selectedChain: Chain | undefined
  setSelectedChain: (chain: Chain | undefined) => void

  selectedAsset: Asset | undefined
  setSelectedAsset: (asset: Asset | undefined) => void

  amount: string
  setAmount: (amount: string) => void
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
}

export function FundsProvider({
  children,
  initialView = 'default',
}: FundsProviderProps) {
  const [view, setView] = useState<View>(initialView)
  const [selectedChain, setSelectedChain] = useState<Chain | undefined>()
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>()
  const [amount, setAmount] = useState<string>('0.00')

  const value = useMemo(() => {
    return {
      amount,
      selectedAsset,
      selectedChain,
      setAmount,
      setSelectedAsset,
      setSelectedChain,
      setView,
      view,
    };
  }, [amount, selectedAsset, selectedChain, view]);

  return <FundsContext.Provider value={value}>{children}</FundsContext.Provider>
}
