import { Input } from '@porto/apps/components'
import { Button } from '@porto/ui'
import { cx } from 'cva'
import { Value } from 'ox'
import { useEffect, useMemo, useState } from 'react'
import { parseUnits } from 'viem'
import { useFundsContext } from '~/contexts'
import {
  useBridge,
  useDestinationAsset,
  useMintToken,
  useWalletAsset,
} from '~/hooks'
import { Layout } from '../Layout'
import { DropdownSelector, getAssets, SupportedChains } from '.'
import { Bridge, type BridgeState } from './Bridge'

export function GlobalDeposit() {
  const {
    address,
    amount,
    selectedAsset,
    selectedChain,
    setAmount,
    setSelectedAsset,
    setSelectedChain,
  } = useFundsContext()

  // Track initial balance before bridge
  const [initialRiseBalance, setInitialRiseBalance] = useState<
    bigint | undefined
  >()

  const [bridgeState, setBridgeState] = useState<BridgeState>({
    status: 'idle',
  })

  const { balance, refetch: refetchBalance } = useWalletAsset({
    address: address ?? '0x',
    chainId: selectedChain?.id,
    tokenAddress: selectedAsset?.address ?? '0x',
  })

  const { mintToken } = useMintToken({
    address: address ?? '0x',
    chainId: selectedChain?.id,
    tokenAddress: selectedAsset?.address,
  })

  const tokens = getAssets(selectedChain?.id)
  // Default to RISE, add handling when on mainnet
  const destinationToken = getAssets(11155931)

  const { balance: riseBalance, refetch: refetchRiseBalance } =
    useDestinationAsset({
      address: address ?? '0x',
      destinationChainId: 11155931, // Default to RISE, add handling when on mainnet
      destinationTokenAddress: destinationToken[0]?.address,
      enabled:
        bridgeState.status === 'source-confirmed' ||
        bridgeState.status === 'destination-pending',
      refetchInterval:
        bridgeState.status === 'destination-pending' ? 2000 : false,
    })

  const selectedToken = useMemo(() => {
    return tokens.find(
      (t) => t.address.toLowerCase() === selectedAsset?.address?.toLowerCase(),
    )
  }, [tokens, selectedAsset?.address])

  const { bridge, chains, targetChainId } = useBridge({
    amount: parseUnits(amount, selectedAsset?.decimals ?? 18),
    selectedChainId: selectedChain?.id,
    selectedToken,
    setBridgeState,
    tokenBalance: balance,
  })

  const amountBalance = useMemo(() => {
    if (balance) {
      return Value.format(balance, selectedAsset?.decimals)
    }

    return '0.00'
  }, [balance, selectedAsset?.decimals])

  const isBalanceZero = useMemo(() => {
    return balance === 0n || !balance
  }, [balance])

  // Initialize with defaults if not set
  useEffect(() => {
    if (!selectedChain && SupportedChains[0]) {
      setSelectedChain(SupportedChains[0])
    }

    if (!selectedAsset && tokens[0]) {
      setSelectedAsset(tokens[0])
    }
  }, [
    selectedChain,
    setSelectedChain,
    selectedAsset,
    setSelectedAsset,
    tokens[0],
  ])

  useEffect(() => {
    setInitialRiseBalance(riseBalance ?? 0n)
  }, [riseBalance])

  // Show bridge progress view
  if (bridgeState.status !== 'idle') {
    return (
      <Bridge
        amount={parseUnits(amount, selectedToken?.decimals ?? 18)}
        bridgeError={null}
        bridgeState={bridgeState}
        chains={chains}
        onRetry={() => {
          bridge()
        }}
        onSuccess={() => {
          setBridgeState({ status: 'idle' })
          refetchBalance()
          refetchRiseBalance()
        }}
        selectedToken={selectedToken}
        targetChainId={targetChainId}
      />
    )
  }

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
                  {amountBalance}{' '}
                  <span className="font-bold">{selectedAsset?.symbol}</span>
                </p>
              </div>
            </div>
            <DropdownSelector
              items={tokens}
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
                  }}
                  variant="primary"
                >
                  Mint
                </Button>
              ) : (
                <Button
                  className="border border-th_base"
                  onClick={() => {
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
            disabled={Number(amountBalance) === 0 || Number(amount) === 0}
            onClick={bridge}
            variant="primary"
          >
            Approve Global Deposit
          </Button>
        </Layout.Footer.Actions>
      </Layout.Footer>
    </Layout>
  )
}
