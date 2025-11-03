import { WalletBalances } from './WalletBalances'

export function Portfolio() {
  console.log('All env vars:', import.meta.env)

  return (
    <div className="space-y-6">
      {/* 24h Balance Change Section */}
      {/* <Summary /> */}

      {/* Wallet Balances Section - Per Chain */}
      <WalletBalances />

      {/* Balances by Protocol Section */}
      {/* <BalancesByProtocol /> */}
    </div>
  )
}
