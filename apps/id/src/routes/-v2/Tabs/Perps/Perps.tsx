import { Button, Spinner } from '@porto/apps/components'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import {
  type FilteredMarket,
  useFilteredMarkets,
  useMarkets,
  useRegisterSigner,
} from '~/hooks'
import { MarketSummary } from './MarketSummary'
import { Markets } from './Markets'
import { OrderBook } from './OrderBook'
import { Positions } from './Positions'
import { PriceChart } from './PriceChart'
import { TradingForm } from './TradingForm'

export type MarketsProps = {
  markets: FilteredMarket[]
  onMarketSelect: (market: FilteredMarket) => void
}

export function Perps() {
  const [orderType, setOrderType] = useState<'long' | 'short'>('long')
  const [activeTimeframe, setActiveTimeframe] = useState('1D')
  const [selectedMarket, setSelectedMarket] = useState<FilteredMarket | null>()
  const [isSignerRegistered, setIsSignerRegistered] = useState(false)

  const { address } = useAccount()
  const { registerSigner, isPending } = useRegisterSigner()

  const { data: markets } = useMarkets()

  const filteredMarkets = useFilteredMarkets(markets?.data.markets ?? [])

  // Check if signer is already registered
  useEffect(() => {
    const signingKey = localStorage.getItem('risex-signing-key')
    if (signingKey) {
      setIsSignerRegistered(true)
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: Avoid unnecessary re-render
  useEffect(() => {
    if (markets && markets?.data.markets?.length !== 0) {
      setSelectedMarket(filteredMarkets[0])
    }
  }, [markets])

  const handleSignAccount = async () => {
    if (!address) return

    try {
      const result = await registerSigner({
        account: address,
        chainId: 11155931, // RISE testnet
      })

      // Store the signing key securely
      localStorage.setItem('risex-signing-key', result.signingKey)
      setIsSignerRegistered(true)
    } catch (error) {
      console.error('Failed to register signer:', error)
    }
  }

  // Show sign account prompt if not registered
  if (!isSignerRegistered) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-gray6 bg-white p-8 text-center dark:border-gray5 dark:bg-gray1">
          <div className="space-y-2">
            <h3 className="font-semibold text-xl">Sign Your RISE Account</h3>
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
              <span className="flex items-center gap-2">
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
    <div className="space-y-4">
      {/* Market Summary */}
      {filteredMarkets && selectedMarket && (
        <MarketSummary
          markets={filteredMarkets}
          onMarketSelect={setSelectedMarket}
          selectedMarket={selectedMarket}
        />
      )}

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        {/* Left Column */}
        <div className="space-y-4">
          <PriceChart
            activeTimeframe={activeTimeframe}
            onTimeframeChange={setActiveTimeframe}
          />
          {selectedMarket && <Positions market={selectedMarket} />}
          {filteredMarkets && (
            <Markets
              markets={filteredMarkets}
              onMarketSelect={setSelectedMarket}
            />
          )}
        </div>

        {/* Right Column - Order Book & Trading Form */}
        <div className="space-y-4">
          <OrderBook selectedMarket={selectedMarket} />
          <TradingForm onOrderTypeChange={setOrderType} orderType={orderType} />
        </div>
      </div>
    </div>
  )
}
