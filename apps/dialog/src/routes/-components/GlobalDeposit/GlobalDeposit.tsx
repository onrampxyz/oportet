import { Input } from '@porto/apps/components'
import { Button, Deposit, Spinner } from '@porto/ui'
import { cx } from 'cva'
import { Value } from 'ox'
import { useEffect, useMemo, useState } from 'react'
import { Chains } from 'rise-wallet/index'
import { formatUnits, parseUnits } from 'viem'
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

export type GlobalDepositProps = Readonly<{
  onClose: () => void
}>

export function GlobalDeposit({ onClose }: GlobalDepositProps) {
  const {
    address,
    amount,
    selectedAsset,
    selectedChain,
    setAmount,
    setSelectedAsset,
    setSelectedChain,
  } = useFundsContext()

  const [bridgeState, setBridgeState] = useState<BridgeState>({
    status: 'idle',
  })

  const { balance, refetch: refetchBalance } = useWalletAsset({
    address: address ?? '0x',
    chainId: selectedChain?.id,
    tokenAddress: selectedAsset?.address ?? '0x',
  })

  const { mintToken, isMinting } = useMintToken({
    address: address ?? '0x',
    chainId: selectedChain?.id,
    tokenAddress: selectedAsset?.address,
  })

  const tokens = getAssets(selectedChain?.id)
  // Default to RISE, add handling when on mainnet
  const destinationToken = getAssets(11155931)

  //TODO: add balance: riseBalance,
  const { refetch: refetchRiseBalance } = useDestinationAsset({
    address: address ?? '0x',
    destinationChainId: 11155931, // Default to RISE, add handling when on mainnet
    destinationTokenAddress: destinationToken[0]?.address,
    enabled:
      bridgeState.status === 'completed' || bridgeState.status === 'failed',
    refetchInterval: bridgeState.status === 'pending' ? 2000 : false,
  })

  const selectedToken = useMemo(() => {
    return tokens.find(
      (t) => t.address.toLowerCase() === selectedAsset?.address?.toLowerCase(),
    )
  }, [tokens, selectedAsset?.address])

  const { bridge, chains, targetChainId } = useBridge({
    account: address ?? '0x',
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

  const shouldExceedMinDeposit = useMemo(() => {
    if (!amount || !selectedToken) return false

    const minDeposit = formatUnits(
      selectedToken?.minDeposit,
      selectedToken?.decimals,
    )

    return Number(amount) < Number(minDeposit)
  }, [amount, selectedToken])

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
          refetchBalance()
          refetchRiseBalance()
          onClose()
        }}
        selectedChain={selectedChain}
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
                setSelectedAsset(getAssets(item.id)[0])
              }}
              selectedItem={selectedChain}
            />
          </div>
          {selectedChain?.id !== Chains.riseTestnet.id && (
            <>
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
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-th_base-secondary">Amount</p>
                  {selectedToken && (
                    <p className="text-th_base-secondary text-sm">
                      Minimum Deposit:{' '}
                      {formatUnits(
                        selectedToken?.minDeposit,
                        selectedToken?.decimals,
                      )}{' '}
                      <span className="font-bold">{selectedToken?.symbol}</span>
                    </p>
                  )}
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
                    type="number"
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
                      {isMinting ? (
                        <Spinner color="white" size="small" />
                      ) : (
                        'Mint'
                      )}
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
            </>
          )}
          {selectedChain?.id === Chains.riseTestnet.id && (
            <Deposit
              address={address ?? ''}
              chainId={selectedChain?.id}
              label="Send tokens to this address"
            />
          )}
        </div>
      </Layout.Content>
      {selectedChain?.id !== Chains.riseTestnet.id && (
        <Layout.Footer>
          <Layout.Footer.Actions>
            <Button
              className="w-full flex-1"
              disabled={
                Number(amountBalance) === 0 ||
                Number(amount) === 0 ||
                Number(amount) > Number(amountBalance) ||
                shouldExceedMinDeposit
              }
              onClick={bridge}
              variant="primary"
            >
              Deposit to RISE
            </Button>
          </Layout.Footer.Actions>
        </Layout.Footer>
      )}
    </Layout>
  )
}
