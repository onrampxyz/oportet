import { Input } from '@porto/apps/components'
import { Button } from '@porto/ui'
import { cx } from 'cva'
import { useEffect, useMemo } from 'react'
import { formatUnits } from 'viem'
import { useBalance } from 'wagmi'
import { useFundsContext } from '~/contexts'
import { useMintToken } from '~/hooks'
import { DropdownSelector, getAssets, SupportedChains } from '../GlobalDeposit'
import { Layout } from '../Layout'

export function AddFundsForm() {
  const {
    address,
    amount,
    selectedAsset,
    selectedChain,
    setAmount,
    setSelectedAsset,
    setSelectedChain,
  } = useFundsContext()

  const balance = useBalance({
    address: selectedAsset?.address ?? '0x',
    chainId: selectedChain?.id,
  })
  console.log('balance:: ', balance.data)

  const assets = getAssets(11155931)

  const amountBalance = useMemo(() => {
    if (balance.data) {
      return formatUnits(balance.data.value, balance.data.decimals)
    }

    return '0.00'
  }, [balance.data])

  const { mintToken } = useMintToken({
    address: address ?? '0x',
    chainId: selectedChain?.id,
    tokenAddress: selectedAsset?.address,
  })

  const isBalanceZero = useMemo(() => {
    return balance.data?.value === 0n || !balance.data
  }, [balance.data])

  // Initialize with defaults if not set
  useEffect(() => {
    if (!selectedChain && SupportedChains[0]) {
      setSelectedChain(SupportedChains[0])
    }

    if (!selectedAsset && assets[0]) {
      setSelectedAsset(assets[0])
    }
  }, [
    selectedChain,
    setSelectedChain,
    selectedAsset,
    setSelectedAsset,
    assets[0],
  ])

  return (
    <Layout>
      <Layout.Header>
        <Layout.Header.Default
          subContent="Deposit to your RISE Wallet"
          title="Global Deposit"
          variant="default"
        />
      </Layout.Header>
      <Layout.Content>
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
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-th_base-secondary">Token</p>
              <div className="flex gap-2">
                <p className="text-sm text-th_base-secondary">Balance:</p>
                <p className="text-sm text-th_base-secondary">
                  {Number(amountBalance).toFixed(4)}{' '}
                  <span className="font-bold">{selectedAsset?.symbol}</span>
                </p>
              </div>
            </div>
            <DropdownSelector
              items={assets}
              onSelect={(item) => {
                setAmount('0')
                setSelectedAsset(item)
              }}
              selectedItem={selectedAsset}
            />
          </div>

          <div className="space-y-2 rounded-lg bg-th_base-alt p-2">
            <p className="text-sm text-th_base-secondary">Amount</p>
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
              {isBalanceZero ? (
                <Button
                  className="border border-th_base"
                  onClick={async () => {
                    await mintToken()
                    // Refetch balance after minting
                    balance.refetch()
                  }}
                  variant="primary"
                >
                  Mint
                </Button>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </Layout.Content>
      <Layout.Footer>
        <Layout.Footer.Actions>
          <Button
            className="w-full flex-1"
            disabled={Number(amountBalance) === 0}
            variant="primary"
          >
            Approve Global Deposit
          </Button>
        </Layout.Footer.Actions>
      </Layout.Footer>
    </Layout>
  )
}
