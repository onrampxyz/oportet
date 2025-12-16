import { Input } from '@porto/apps/components'
import { Button } from '@porto/ui'
import { cx } from 'cva'
import { Address } from 'ox'
import { useMemo, useState } from 'react'
import { Hooks as RemoteHooks } from 'rise-wallet/remote'
import { Hooks as WagmiHooks } from 'rise-wallet/wagmi'
import { zeroAddress } from 'viem'
import { porto } from '~/lib/Porto'
import * as Tokens from '~/lib/Tokens'
import LucideArrowDownUp from '~icons/lucide/arrow-down-up'
import { Layout } from './Layout'

export namespace SwapFunds {
  export type Props = {
    address?: Address.Address
    chainId?: number
    fromToken?: {
      address?: Address.Address
      balance?: string
      balanceFormatted?: number
      decimals: number
      isNative?: boolean
      price?: number
      priceSource?: string
      symbol: string
      tokenId?: string
      updatedAt?: string
      usdValue?: number
    }
    onApprove: (result: { success: boolean }) => void
    onReject: () => void
    toToken?: {
      address?: Address.Address
      balance?: string
      balanceFormatted?: number
      decimals: number
      isNative?: boolean
      price?: number
      priceSource?: string
      symbol: string
      tokenId?: string
      updatedAt?: string
      usdValue?: number
    }
  }
}

type SelectedToken = {
  address: Address.Address
  balance: bigint
  balanceFormatted: number
  decimals: number
  symbol: string
}

export function SwapFunds(props: SwapFunds.Props) {
  const { onApprove, onReject } = props

  const account = RemoteHooks.useAccount(porto)
  const userAddress = props.address ?? account?.address

  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState('')
  const [isSwapping, setIsSwapping] = useState(false)

  // Initialize tokens from props if provided
  const initialFromToken = props.fromToken
    ? {
        address:
          props.fromToken.address ??
          ((props.fromToken.tokenId?.split('-')[1] ??
            zeroAddress) as Address.Address),
        balance: BigInt(props.fromToken.balance ?? 0),
        balanceFormatted: props.fromToken.balanceFormatted ?? 0,
        decimals: props.fromToken.decimals,
        symbol: props.fromToken.symbol,
      }
    : null

  const initialToToken = props.toToken
    ? {
        address:
          props.toToken.address ??
          ((props.toToken.tokenId?.split('-')[1] ??
            zeroAddress) as Address.Address),
        balance: BigInt(props.toToken.balance ?? 0),
        balanceFormatted: props.toToken.balanceFormatted ?? 0,
        decimals: props.toToken.decimals,
        symbol: props.toToken.symbol,
      }
    : null

  const [selectedFromToken, setSelectedFromToken] =
    useState<SelectedToken | null>(initialFromToken)
  const [selectedToToken, setSelectedToToken] = useState<SelectedToken | null>(
    initialToToken,
  )
  const [selectingToken, setSelectingToken] = useState<'from' | 'to' | null>(
    null,
  )

  // Get available tokens and user's assets
  const { data: tokens } = Tokens.getTokens.useQuery()
  const { data: assets } = WagmiHooks.useAssets(porto, {
    account: userAddress,
    query: {
      enabled: Boolean(userAddress),
      select: (data) => data[0], // Get assets for the first chain
    },
  })

  // Build a map of available tokens with balances
  const availableTokens = useMemo(() => {
    if (!assets || !tokens) return []

    const tokenList: SelectedToken[] = []
    const tokenAddressMap = new Map(tokens.map((t) => [t.address, t]))

    for (const asset of assets) {
      const tokenAddress =
        asset.address === 'native' || asset.type === 'native'
          ? zeroAddress
          : (asset.address as Address.Address)

      const tokenInfo = tokenAddressMap.get(tokenAddress)
      if (!tokenInfo) continue

      const balance = BigInt(asset.balance ?? 0)
      if (balance === 0n) continue // Skip tokens with zero balance

      tokenList.push({
        address: tokenAddress,
        balance,
        balanceFormatted: Number(balance) / 10 ** tokenInfo.decimals,
        decimals: tokenInfo.decimals,
        symbol: tokenInfo.symbol,
      })
    }

    return tokenList
  }, [assets, tokens])

  // Token selection view
  if (selectingToken) {
    return (
      <Layout>
        <Layout.Header>
          <Layout.Header.Default
            subContent={`Select token to swap ${selectingToken === 'from' ? 'from' : 'to'}`}
            title="Select Token"
            variant="default"
          />
        </Layout.Header>
        <Layout.Content>
          <div className="space-y-2">
            {availableTokens.length === 0 ? (
              <div className="py-8 text-center text-gray11 text-sm">
                No tokens available
              </div>
            ) : (
              availableTokens.map((token) => (
                <button
                  className="w-full rounded-lg border border-gray5 p-4 text-left transition-colors hover:border-violet9 hover:bg-gray2"
                  key={token.address}
                  onClick={() => {
                    if (selectingToken === 'from') {
                      setSelectedFromToken(token)
                    } else {
                      setSelectedToToken(token)
                    }
                    setSelectingToken(null)
                  }}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray12 text-sm">
                        {token.symbol}
                      </div>
                      <div className="text-gray11 text-xs">
                        {token.address === zeroAddress
                          ? 'Native'
                          : `${token.address.slice(0, 10)}...`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray12 text-sm">
                        {token.balanceFormatted.toFixed(4)}
                      </div>
                      <div className="text-gray11 text-xs">Available</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Layout.Content>
        <Layout.Footer>
          <Layout.Footer.Actions>
            <Button onClick={() => setSelectingToken(null)} variant="secondary">
              Back
            </Button>
          </Layout.Footer.Actions>
        </Layout.Footer>
      </Layout>
    )
  }

  const handleMaxAmount = () => {
    if (selectedFromToken) {
      setAmount(selectedFromToken.balanceFormatted.toString())
      setAmountError('')
    }
  }

  const handleSwap = async () => {
    // Validate amount
    const amountNumber = Number.parseFloat(amount)
    if (!amount || amountNumber <= 0) {
      setAmountError('Please enter a valid amount')
      return
    }

    if (
      selectedFromToken &&
      amountNumber > selectedFromToken.balanceFormatted
    ) {
      setAmountError(
        `Insufficient balance. You only have ${selectedFromToken.balanceFormatted} ${selectedFromToken.symbol}!`,
      )
      return
    }

    if (!selectedFromToken) {
      setAmountError('Please select a token to swap from')
      return
    }

    if (!selectedToToken) {
      setAmountError('Please select a token to swap to')
      return
    }

    // Clear errors if validation passes
    setAmountError('')

    setIsSwapping(true)

    try {
      // TODO: Implement actual swap logic here
      // This is a placeholder that simulates a swap
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onApprove({ success: true })
    } catch (error) {
      console.error('Swap error:', error)
      setIsSwapping(false)
      setAmountError(
        (error as any)?.shortMessage ??
          (error as any)?.message ??
          'Swap failed',
      )
    }
  }

  const handleInterchange = () => {
    // Swap from and to tokens
    const temp = selectedFromToken
    setSelectedFromToken(selectedToToken)
    setSelectedToToken(temp)
  }

  return (
    <Layout>
      <Layout.Header>
        <Layout.Header.Default
          subContent="Swap tokens"
          title="Swap Tokens"
          variant="default"
        />
      </Layout.Header>
      <Layout.Content>
        <div className="space-y-2 pt-4">
          {/* From Token */}
          <div className="space-y-2 rounded-lg bg-th_base-alt p-2">
            <p className="text-sm text-th_base-secondary">From</p>
            <button
              className="w-full rounded-lg border border-gray5 bg-th_field p-3 text-left transition-colors hover:border-violet9"
              onClick={() => setSelectingToken('from')}
              type="button"
            >
              {selectedFromToken ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray12 text-sm">
                      {selectedFromToken.symbol}
                    </div>
                    <div className="text-gray11 text-xs">
                      Balance: {selectedFromToken.balanceFormatted.toFixed(4)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray10 text-sm">Select token</div>
              )}
            </button>
          </div>

          {/* Interchange Button */}
          <div className="flex justify-center">
            <Button
              disabled={!selectedFromToken || !selectedToToken}
              onClick={handleInterchange}
              variant="secondary"
            >
              <LucideArrowDownUp className="size-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2 rounded-lg bg-th_base-alt p-2">
            <p className="text-sm text-th_base-secondary">To</p>
            <button
              className="w-full rounded-lg border border-gray5 bg-th_field p-3 text-left transition-colors hover:border-violet9"
              onClick={() => setSelectingToken('to')}
              type="button"
            >
              {selectedToToken ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray12 text-sm">
                      {selectedToToken.symbol}
                    </div>
                    <div className="text-gray11 text-xs">
                      Balance: {selectedToToken.balanceFormatted.toFixed(4)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray10 text-sm">Select token</div>
              )}
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2 rounded-lg bg-th_base-alt p-2">
            <p className="text-sm text-th_base-secondary">Amount</p>
            <div className="flex gap-2">
              <Input
                className={cx('w-full bg-th_field')}
                name="Amount"
                onChange={(event) => {
                  const value = event.target.value
                  setAmount(value)
                  if (amountError) setAmountError('')
                }}
                placeholder="0.00"
                value={amount}
              />
              <Button onClick={handleMaxAmount} variant="primary">
                Max
              </Button>
            </div>
            {amountError && (
              <p className="text-red-500 text-xs">{amountError}</p>
            )}
          </div>
        </div>
      </Layout.Content>
      <Layout.Footer>
        <Layout.Footer.Actions>
          <Button onClick={onReject} variant="secondary">
            Cancel
          </Button>
          <Button
            className="flex-1!"
            disabled={
              !selectedFromToken ||
              !selectedToToken ||
              !amount ||
              Number(amount) <= 0 ||
              isSwapping
            }
            onClick={handleSwap}
            variant="primary"
          >
            {isSwapping ? 'Swapping...' : 'Swap'}
          </Button>
        </Layout.Footer.Actions>
      </Layout.Footer>
    </Layout>
  )
}
