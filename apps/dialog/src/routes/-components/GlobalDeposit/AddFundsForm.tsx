import { Input } from '@porto/apps/components'
import { Button } from '@porto/ui'
import { cx } from 'cva'
import { useEffect, useMemo } from 'react'
import { formatUnits } from 'viem'
import { useBalance } from 'wagmi'
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

  const balance = useBalance({
    address: selectedAsset?.address ?? '0x',
    chainId: selectedChain?.id,
  })
  console.log('balance:: ', balance.data)

  const amountBalance = useMemo(() => {
    if (balance.data) {
      return formatUnits(balance.data.value, balance.data.decimals)
    }

    return '0.00'
  }, [balance.data])

  // Initialize with defaults if not set
  useEffect(() => {
    if (!selectedChain && SupportedChains[0]) {
      setSelectedChain(SupportedChains[0])
    }
    if (!selectedAsset && SupportedAssets[0]) {
      setSelectedAsset(SupportedAssets[0])
    }
  }, [selectedChain, setSelectedChain, selectedAsset, setSelectedAsset])

  return (
    <div className="flex flex-col gap-2 pt-3">
      <div className="flex-1 space-y-2 rounded-lg bg-th_base-alt p-2">
        <p className="text-sm text-th_base-secondary">Source</p>
        <DropdownSelector
          items={SupportedChains}
          onSelect={(item) => {
            setAmount('0')
            setSelectedChain(item)
          }}
          selectedItem={selectedChain}
        />
      </div>

      <div className="space-y-2 rounded-lg bg-th_base-alt p-2">
        <p className="text-sm text-th_base-secondary">Token</p>
        <DropdownSelector
          items={SupportedAssets}
          onSelect={(item) => {
            setAmount('0')
            setSelectedAsset(item)
          }}
          selectedItem={selectedAsset}
        />
      </div>

      <div className="space-y-2 rounded-lg bg-th_base-alt p-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-th_base-secondary">Amount</p>
          <div className="flex gap-2">
            <p className="text-sm text-th_base-secondary">Balance:</p>
            <p className="text-sm text-th_base-secondary">
              {Number(amountBalance).toFixed(4)}{' '}
              <span className="font-bold">{selectedAsset?.symbol}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            className={cx('w-full bg-th_field')}
            name="Amount"
            onChange={(event) => {
              const value = event.target.value
              setAmount(value)
            }}
            placeholder="0.00"
            value={amount}
          />
          <Button
            className="border border-th_base"
            onClick={() => {
              console.log('amountBalance:: ', amountBalance)
              setAmount(amountBalance)
            }}
            variant="primary"
          >
            Max
          </Button>
        </div>
      </div>
      <Button className="flex-1" variant="primary">
        Approve Global Deposit
      </Button>
    </div>
  )
}
