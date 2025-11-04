import { useAccount } from 'wagmi'
import { useWallet } from '~/hooks'
import { WalletBalances } from './WalletBalances'

export function Portfolio() {
  console.log('All env vars:', import.meta.env)
  const { address } = useAccount()
  const { balances, positions, summary, isLoading } = useWallet({
    address: '0x07b780e6d4d7177bd596e7cabf2725a471e685dc',
  })

  console.log('balances:: ', balances.data)
  console.log('positions:: ', positions.data)
  console.log('summary:: ', summary.data)

  return (
    <div className="space-y-6">
      {/* 24h Balance Change Section */}
      {/* <Summary /> */}

      {/* Wallet Balances Section - Per Chain */}
      <WalletBalances balances={balances.data} isLoading={isLoading} />

      {/* Balances by Protocol Section */}
      {/* <BalancesByProtocol /> */}
    </div>
  )
}
