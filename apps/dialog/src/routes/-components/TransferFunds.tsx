import { Input } from '@porto/apps/components'
import { Button } from '@porto/ui'
import { cx } from 'cva'
import { Address } from 'ox'
import { useMemo, useState } from 'react'
import { Hooks as RemoteHooks } from 'rise-wallet/remote'
import { Hooks as WagmiHooks } from 'rise-wallet/wagmi'
import { encodeFunctionData, erc20Abi, parseUnits, zeroAddress } from 'viem'
import { useSendCalls } from 'wagmi'
import { porto } from '~/lib/Porto'
import * as Tokens from '~/lib/Tokens'
import { Layout } from './Layout'

export namespace TransferFunds {
  export type Props = {
    address?: Address.Address
    chainId?: number
    onApprove: (result: { success: boolean }) => void
    onReject: () => void
    token?: {
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
  decimals: number
  symbol: string
  balance: bigint
  balanceFormatted: number
}

export function TransferFunds(props: TransferFunds.Props) {
  const { onApprove, onReject } = props

  const account = RemoteHooks.useAccount(porto)
  const userAddress = props.address ?? account?.address

  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [addressError, setAddressError] = useState('')
  const [amountError, setAmountError] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  // Initialize selectedToken from props.token if provided
  const initialToken = props.token
    ? {
      address:
        props.token.address ??
        // Fallback: extract address from tokenId (format: chainId-address)
        ((props.token.tokenId?.split('-')[1] ??
          zeroAddress) as Address.Address),
      balance: BigInt(props.token.balance ?? 0),
      balanceFormatted: props.token.balanceFormatted ?? 0,
      decimals: props.token.decimals,
      symbol: props.token.symbol,
    }
    : null

  const [selectedToken, setSelectedToken] = useState<SelectedToken | null>(
    initialToken,
  )

  const { sendCallsAsync } = useSendCalls()

  // Get available tokens and user's assets
  const { data: tokens } = Tokens.getTokens.useQuery()
  const { data: assets } = WagmiHooks.useAssets(porto, {
    account: userAddress,
    query: {
      enabled: Boolean(userAddress),
      select: (data) => data[0], // Get assets for the first chain
    },
  })

  console.log('assets:: ', assets)

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
  if (!selectedToken) {
    return (
      <Layout>
        <Layout.Header>
          <Layout.Header.Default
            subContent="Select a token to transfer"
            title="Send Token"
            variant="default"
          />
        </Layout.Header>
        <Layout.Content>
          <div className="space-y-2">
            {availableTokens.length === 0 ? (
              <div className="py-8 text-center text-gray11 text-sm">
                No tokens available for transfer
              </div>
            ) : (
              availableTokens.map((token) => (
                <button
                  className="w-full rounded-lg border border-gray5 p-4 text-left transition-colors hover:border-violet9 hover:bg-gray2"
                  key={token.address}
                  onClick={() => setSelectedToken(token)}
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
      </Layout>
    )
  }

  const handleMaxAmount = () => {
    if (selectedToken) {
      setAmount(selectedToken.balanceFormatted.toString())
      setAmountError('')
    }
  }

  const handleTransfer = async () => {
    // Validate address
    if (!Address.validate(toAddress)) {
      setAddressError('Please enter a valid Ethereum address')
      return
    }

    // Validate amount
    const amountNumber = Number.parseFloat(amount)
    if (!amount || amountNumber <= 0) {
      setAmountError('Please enter a valid amount')
      return
    }

    if (selectedToken && amountNumber > selectedToken.balanceFormatted) {
      setAmountError(
        `Insufficient balance. You only have ${selectedToken.balanceFormatted} ${selectedToken.symbol}!`,
      )
      return
    }

    // Clear errors if validation passes
    setAddressError('')
    setAmountError('')

    setIsTransferring(true)

    try {
      if (!selectedToken) {
        throw new Error('No token selected')
      }

      const parsedAmount = parseUnits(amount, selectedToken.decimals)

      const calls = [
        {
          data: encodeFunctionData({
            abi: erc20Abi,
            args: [toAddress as `0x${string}`, parsedAmount],
            functionName: 'transfer',
          }),
          to: selectedToken.address,
        },
      ]

      await sendCallsAsync({
        calls,
        version: '1',
      })

      onApprove({ success: true })
    } catch (error) {
      console.error('Transfer error:', error)
      setIsTransferring(false)
      setAmountError(
        (error as any)?.shortMessage ??
        (error as any)?.message ??
        'Transfer failed',
      )
    }
  }

  const handleBack = () => {
    setSelectedToken(null)
    setToAddress('')
    setAmount('')
    setAddressError('')
    setAmountError('')
  }

  return (
    <Layout>
      <Layout.Header>
        <Layout.Header.Default
          subContent="Transfer tokens to external address"
          title="Send Token"
          variant="default"
        />
      </Layout.Header>
      <Layout.Content>
        <div className="space-y-2 pt-4">
          {/* Balance Info */}
          <div className="space-y-2 rounded-lg bg-th_base-alt p-2">
            <p className="text-sm text-th_base-secondary">Available Balance</p>
            <div className="w-full bg-th_field p-2">
              <p className="font-semibold text-gray12 text-sm">
                {selectedToken.balanceFormatted.toFixed(4)} {selectedToken.symbol}
              </p>
            </div>
          </div>

          {/* Address Input */}
          <div className="space-y-2 rounded-lg bg-th_base-alt p-2">
            <p className="text-sm text-th_base-secondary">Recipient Address</p>
            <Input
              className={cx('w-full bg-th_field')}
              name="address"
              onChange={(event) => {
                const value = event.target.value
                setToAddress(value)
                if (addressError) setAddressError('')
              }}
              placeholder="0x..."
              type="text"
              value={toAddress}
            />
            {addressError && (
              <p className="text-red-500 text-xs">{addressError}</p>
            )}
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
                  if (amountError) setAmountError('')
                }}
                placeholder="0.00"
                value={amount}
              />
              <Button onClick={handleMaxAmount} variant="primary">
                Max
              </Button>
            </div>
          </div>
        </div>
      </Layout.Content>
      <Layout.Footer>
        <Layout.Footer.Actions>
          <Button onClick={onReject} variant="secondary">
            Back
          </Button>
          <Button className="flex-1!">
            Approve
          </Button>
        </Layout.Footer.Actions>
      </Layout.Footer>
    </Layout>
  )
}
