import { Button } from '@porto/ui'
import * as React from 'react'
import { useFundsContext } from '~/contexts'
import {
  DropdownSelector,
  SupportedAssets,
  SupportedChains,
} from '../GlobalDeposit'

export function AddFundsForm() {
  const {
    selectedChain,
    setSelectedChain,
    selectedAsset,
    setSelectedAsset,
    amount,
    setAmount,
  } = useFundsContext()

  // Initialize with defaults if not set
  React.useEffect(() => {
    if (!selectedChain && SupportedChains[0]) {
      setSelectedChain(SupportedChains[0])
    }
    if (!selectedAsset && SupportedAssets[0]) {
      setSelectedAsset(SupportedAssets[0])
    }
  }, [selectedChain, setSelectedChain, selectedAsset, setSelectedAsset])

  return (
    <div className="flex flex-col gap-2 pt-3">
      <div className="flex gap-2">
        <div className="flex-1 space-y-2 rounded-lg bg-[var(--background-color-th_base-alt)] p-2">
          <p className="text-[var(--text-color-th_base)]">Source</p>
          <DropdownSelector
            items={SupportedChains}
            onSelect={(item) => {
              setSelectedChain(item)
            }}
            selectedItem={selectedChain}
          />
        </div>
        <div className="flex-1 space-y-2 rounded-lg bg-[var(--background-color-th_base-alt)] p-2">
          <p className="text-[var(--text-color-th_base)]">Destination</p>
          <div className="rounded-lg border border-[var(--border-color-th_field)] bg-[var(--background-color-th_base)] p-2">
            <p className="text-[var(--text-color-th_base)]">RISE</p>
          </div>
        </div>
      </div>
      <div className="space-y-2 rounded-lg bg-[var(--background-color-th_base-alt)] p-2">
        <p className="text-[var(--text-color-th_base)]">Token</p>
        <DropdownSelector
          items={SupportedAssets}
          onSelect={(item) => {
            setSelectedAsset(item)
          }}
          selectedItem={selectedAsset}
        />
      </div>
      <div className="space-y-2 rounded-lg bg-[var(--background-color-th_base-alt)] p-2">
        <p className="text-[var(--text-color-th_base)]">Amount</p>
        <input
          className="w-full rounded-lg border border-[var(--border-color-th_field)] bg-[var(--background-color-th_base)] p-2"
          onChange={(event) => {
            const value = event.target.value
            setAmount(value)
          }}
          value={amount}
        />
      </div>
      <Button className="flex-1" variant="primary">
        Approve Global Deposit
      </Button>
    </div>
  )
}
