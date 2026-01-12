import { Button, Spinner } from '@porto/apps/components'
import { cx } from 'cva'
import { useEffect, useState } from 'react'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { useRegisterSigner } from '~/hooks'
import { useAccountBalance } from '~/hooks/api/useAccountBalance'
import { useDepositToken } from '~/hooks/api/useDepositToken'
import LucideChevronDown from '~icons/lucide/chevron-down'

export type TradingFormProps = {
  orderType: 'long' | 'short'
  onOrderTypeChange: (type: 'long' | 'short') => void
}

type OrderTypeTab = 'market' | 'limit'

const LEVERAGE = ['5', '10', '25', '50']

export function TradingForm(props: Readonly<TradingFormProps>) {
  const { orderType, onOrderTypeChange } = props
  const [isSignerRegistered, setIsSignerRegistered] = useState(false)
  const [orderTypeTab, setOrderTypeTab] = useState<OrderTypeTab>('market')
  const [leverage, setLeverage] = useState('10')
  const [limitPrice, setLimitPrice] = useState('')

  const { address } = useAccount()

  const { authenticate, isPending } = useRegisterSigner()
  const { mutate: depositToken, isPending: isDepositPending } =
    useDepositToken()

  const { balance } = useAccountBalance({
    tokenAddress: '0x8d17fc7db6b4fcf40afb296354883dec95a12f58', // usdc
    userAddress: address,
  })

  // Format balance from wei to USDC (6 decimals)
  const formattedBalance = balance
    ? Number.parseFloat(formatUnits(BigInt(balance), 18)).toFixed(2)
    : '0.00'

  // Check if signer is already registered
  useEffect(() => {
    const signingKey = localStorage.getItem('risex-signing-key')
    if (signingKey) {
      setIsSignerRegistered(true)
    }
  }, [])

  const handleSignAccount = async () => {
    if (!address) return

    try {
      const result = await authenticate({
        account: address,
        chainId: 11155931, // RISE testnet
      })

      // Store the signing key securely
      if (result?.signingKey) {
        localStorage.setItem('risex-signing-key', result?.signingKey)
        setIsSignerRegistered(true)
      }
    } catch (error) {
      console.error('Failed to register signer:', error)
    }
  }

  const handleLeveragePreset = (value: string) => {
    setLeverage(value)
  }

  const handleFaucet = () => {
    if (!address) return

    const signingKey = localStorage.getItem('risex-signing-key')
    depositToken({
      account: address,
      amount: '1000',
      signer: signingKey || undefined,
      token: 'USDC',
    })
  }

  // Show sign account prompt if not registered
  if (!isSignerRegistered) {
    return (
      <div className="rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
        <div className="flex flex-col gap-4 text-center">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Sign Your RISE Account</h3>
            <p className="text-gray11 text-sm">
              To start trading on RiseX, you need to sign your RISE account.
              This creates a secure signing key for executing trades.
            </p>
          </div>
          <Button
            className="w-full"
            disabled={isPending || !address}
            onClick={handleSignAccount}
            variant="primary"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="size-4!" />
                Signing Account...
              </span>
            ) : (
              'Sign Your RISE Account'
            )}
          </Button>
          {!address && (
            <p className="text-red-600 text-xs">
              Please connect your wallet first
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray5 bg-white p-4 dark:bg-gray1">
      {/* Faucet Button */}
      <div className="mb-4">
        <Button
          className="rounded! w-full"
          disabled={isDepositPending || !address}
          onClick={handleFaucet}
        >
          {isDepositPending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="size-4!" />
              Depositing...
            </span>
          ) : (
            'Faucet (1000 USDC)'
          )}
        </Button>
      </div>

      {/* Long/Short Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          className={cx(
            'flex-1 rounded py-2 font-medium text-sm transition-colors',
            orderType === 'long'
              ? 'bg-green-600 text-white'
              : 'bg-gray3 text-gray10 hover:bg-gray4',
          )}
          onClick={() => onOrderTypeChange('long')}
          type="button"
        >
          Long
        </button>
        <button
          className={cx(
            'flex-1 rounded py-2 font-medium text-sm transition-colors',
            orderType === 'short'
              ? 'bg-red-600 text-white'
              : 'bg-gray3 text-gray10 hover:bg-gray4',
          )}
          onClick={() => onOrderTypeChange('short')}
          type="button"
        >
          Short
        </button>
      </div>

      {/* Market/Limit Tabs */}
      <div className="mb-1">
        <div className="flex gap-2">
          <button
            className={cx(
              'flex-1 rounded px-4 py-2 font-medium text-sm transition-colors',
              orderTypeTab === 'market'
                ? 'bg-violet9 text-white'
                : 'bg-gray3 text-gray10 hover:bg-gray4',
            )}
            onClick={() => setOrderTypeTab('market')}
            type="button"
          >
            Market
          </button>
          <button
            className={cx(
              'flex-1 rounded px-4 py-2 font-medium text-sm transition-colors',
              orderTypeTab === 'limit'
                ? 'bg-violet9 text-white'
                : 'bg-gray3 text-gray10 hover:bg-gray4',
            )}
            onClick={() => setOrderTypeTab('limit')}
            type="button"
          >
            Limit
          </button>
        </div>
      </div>

      {/* Limit Price (only shown for limit orders) */}
      {orderTypeTab === 'limit' && (
        <div className="mb-4">
          <label
            className="mb-2 block text-gray10 text-xs"
            htmlFor="limit-price"
          >
            Limit Price
          </label>
          <div className="relative">
            <input
              className="w-full rounded border border-gray5 px-3 py-2 pr-16 text-sm outline-none focus:border-violet9"
              id="limit-price"
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="0.00"
              type="text"
              value={limitPrice}
            />
            <div className="-translate-y-1/2 absolute top-1/2 right-3 flex items-center gap-2">
              <span className="text-gray10 text-xs">USD</span>
            </div>
          </div>
        </div>
      )}

      {/* Leverage */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-gray10 text-xs" htmlFor="leverage">
            Leverage
          </label>
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded border border-gray5 px-3 py-2 text-sm outline-none focus:border-violet9"
            id="leverage"
            max="100"
            min="1"
            onChange={(e) => setLeverage(e.target.value)}
            placeholder="10"
            type="number"
            value={leverage}
          />
          {LEVERAGE.map((leverage) => {
            return (
              <button
                className="rounded bg-gray3 px-3 py-2 font-medium text-sm transition-colors hover:bg-gray4"
                key={leverage}
                onClick={() => handleLeveragePreset(leverage)}
                type="button"
              >
                {leverage}x
              </button>
            )
          })}
        </div>
      </div>

      {/* Size Input */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-gray10 text-xs" htmlFor="size">
            Size
          </label>
          <span className="text-gray10 text-xs">
            Available:{' '}
            <span className="font-medium">{formattedBalance} USDC</span>
          </span>
        </div>
        <div className="relative">
          <input
            className="w-full rounded border border-gray5 px-3 py-2 pr-16 text-sm outline-none focus:border-violet9"
            id="size"
            placeholder="0.00"
            type="text"
          />
          <div className="-translate-y-1/2 absolute top-1/2 right-3 flex items-center gap-2">
            <span className="text-gray10 text-xs">BTC</span>
            <LucideChevronDown className="size-3 text-gray10" />
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="mb-4 space-y-2 rounded bg-gray2 p-3 text-sm dark:bg-gray3">
        <div className="flex justify-between">
          <span className="text-gray10">Account Equity:</span>
          <span className="font-medium">1,000.00 USD</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray10">Collateral Margin:</span>
          <span>- -</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray10">Margin Usage:</span>
          <span>- -</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray10">Maintenance Margin:</span>
          <span>- -</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray10">Account Leverage:</span>
          <span>- -</span>
        </div>
      </div>

      {/* Place Order Button */}
      <Button
        className={cx(
          'rounded! w-full py-3 font-medium text-sm transition-colors',
          orderType === 'long'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700',
        )}
      >
        Place {orderType === 'long' ? 'Long' : 'Short'} Order
      </Button>
    </div>
  )
}
