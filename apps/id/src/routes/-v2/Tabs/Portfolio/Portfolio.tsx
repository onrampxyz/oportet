import { useAccount } from 'wagmi'
import { useWallet } from '~/hooks'
import { Summary } from './Summary'
import { WalletBalances } from './WalletBalances'

export function Portfolio() {
  console.log('All env vars:', import.meta.env)
  const { address } = useAccount()
  const { balances, positions, summary, calls, isLoading } = useWallet({
    address: '0x07b780e6d4d7177bd596e7cabf2725a471e685dc',
  })

  console.log('balances:: ', balances.data)
  console.log('positions:: ', positions.data)
  console.log('summary:: ', summary.data)
  console.log('calls:: ', calls.data)
  console.log('----------------------')

  return (
    <div className="space-y-6">
      {/* 24h Balance Change Section */}
      <Summary
        isLoading={isLoading}
        summary={summary.data}
        transactionCount={calls.data?.intents?.length ?? 0}
      />

      {/* Wallet Balances Section - Per Chain */}
      <WalletBalances balances={balances.data} isLoading={isLoading} />

      {/* Balances by Protocol Section */}
      {/* <BalancesByProtocol /> */}
    </div>
  )
}
