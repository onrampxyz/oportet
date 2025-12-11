import { Button } from '@porto/ui'
import * as React from 'react'
import {
  type Asset,
  type Chain,
  DropdownSelector,
  SupportedAssets,
  SupportedChains,
} from '../GlobalDeposit'

export function AddFundsForm() {
  const [selectedSource, setSelectedSource] = React.useState<Chain | undefined>(
    SupportedChains[0],
  )

  const [selectedTokenSymbol, setSelectedTokenSymbol] = React.useState<
    Asset | undefined
  >(SupportedAssets[0])

  const [amount, setAmount] = React.useState<string>('0.00')

  return (
    <div className="flex flex-col gap-2 pt-4">
      <div className="flex gap-2">
        <div className="flex-1 space-y-2 rounded-lg bg-[var(--background-color-th_base-alt)] p-2">
          <p className="text-[var(--text-color-th_base)]">Source</p>
          <DropdownSelector
            items={SupportedChains}
            onSelect={(item) => {
              setSelectedSource(item)
            }}
            selectedItem={selectedSource}
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
            setSelectedTokenSymbol(item)
          }}
          selectedItem={selectedTokenSymbol}
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
