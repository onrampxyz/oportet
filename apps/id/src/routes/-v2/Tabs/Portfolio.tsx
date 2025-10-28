import { cx } from 'cva'
import { Hooks } from 'porto/wagmi'

type BalanceChange = {
  totalChange: string
  wallet: string
  protocols: string
  transactions: number
}

type WalletBalance = {
  symbol: string
  name: string
  address: string
  balance: string
  usdValue: string
  logo?: string
}

type ProtocolPosition = {
  protocol: string
  protocolIcon: string
  type: string
  value: string
  apy: string
  change24h: string
}

const DUMMY_BALANCE_CHANGE: BalanceChange = {
  protocols: '+$51.15',
  totalChange: '+$51.15',
  transactions: 12,
  wallet: '+$23.45',
}

const DUMMY_WALLET_BALANCES: WalletBalance[] = [
  {
    address: '$3,535.669',
    balance: '2.45 WETH',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    usdValue: '$9,001.89',
  },
  {
    address: '$3,535.669',
    balance: '2.45 RISE',
    name: 'Rise Token',
    symbol: 'RISE',
    usdValue: '$9,001.89',
  },
  {
    address: '$3,535.669',
    balance: '2.45 USDC',
    name: 'USD Coin',
    symbol: 'USDC',
    usdValue: '$9,001.89',
  },
  {
    address: '$3,535.669',
    balance: '2.45 WBTC',
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    usdValue: '$9,001.89',
  },
  {
    address: '$3,535.669',
    balance: '2.45 USDT',
    name: 'Tether USD',
    symbol: 'USDT',
    usdValue: '$9,001.89',
  },
]

const DUMMY_PROTOCOL_POSITIONS: ProtocolPosition[] = [
  {
    apy: '24.5%',
    change24h: '++$5.20',
    protocol: 'Uniswap V3',
    protocolIcon: 'U',
    type: 'Liquidity Pool',
    value: '$2,450.00',
  },
  {
    apy: '24.5%',
    change24h: '++$5.20',
    protocol: 'Uniswap V3',
    protocolIcon: 'U',
    type: 'Liquidity Pool',
    value: '$2,450.00',
  },
  {
    apy: '24.5%',
    change24h: '++$5.20',
    protocol: 'Uniswap V3',
    protocolIcon: 'U',
    type: 'Liquidity Pool',
    value: '$2,450.00',
  },
  {
    apy: '24.5%',
    change24h: '++$5.20',
    protocol: 'Uniswap V3',
    protocolIcon: 'U',
    type: 'Liquidity Pool',
    value: '$2,450.00',
  },
]

export function Portfolio() {
  const { data: assets } = Hooks.useAssets()

  console.log("assets:: ", assets)

  return (
    <div className="space-y-6">
      {/* 24h Balance Change Section */}
      <div className="rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
        <h2 className="mb-2 font-semibold text-lg">24h Balance Change</h2>
        <p className="mb-4 text-gray10 text-sm">
          Summary of portfolio changes over the last 24 hours
        </p>

        <div className="grid grid-cols-4 gap-4">
          <div className='border rounded-md border-gray5 p-5 text-center'>
            <p className="mb-1 text-gray10 text-xs">Total Change</p>
            <p className="text-2xl">
              {DUMMY_BALANCE_CHANGE.totalChange}
            </p>
          </div>
          <div className='border rounded-md border-gray5 p-5 text-center'>
            <p className="mb-1 text-gray10 text-xs">Wallet</p>
            <p className="text-2xl text-green-600">
              {DUMMY_BALANCE_CHANGE.wallet}
            </p>
          </div>
          <div className='border rounded-md border-gray5 p-5 text-center'>
            <p className="mb-1 text-gray10 text-xs">Protocols</p>
            <p className="text-2xl text-green-600">
              {DUMMY_BALANCE_CHANGE.protocols}
            </p>
          </div>
          <div className='border rounded-md border-gray5 p-5 text-center'>
            <p className="mb-1 text-gray10 text-xs">Transactions</p>
            <p className="text-2xl">
              {DUMMY_BALANCE_CHANGE.transactions}
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Balances Section */}
      <div className="rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
        <h2 className="mb-2 font-semibold text-lg">Wallet Balances</h2>
        <p className="mb-4 text-gray10 text-sm">
          Your token holdings in this wallet
        </p>

        <div className="space-y-3">
          {DUMMY_WALLET_BALANCES.map((balance, index) => (
            <div
              className="flex items-center justify-between rounded-lg border border-gray4 p-3 hover:bg-gray2"
              key={index}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gray5">
                  <span className="font-semibold text-gray11 text-sm">
                    {balance.symbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray12 text-sm">
                    {balance.symbol}
                  </p>
                  <p className="text-gray10 text-xs">{balance.address}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray12 text-sm">
                  {balance.balance}
                </p>
                <p className="text-gray10 text-xs">{balance.usdValue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Balances by Protocol Section */}
      <div className="rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
        <h2 className="mb-2 font-semibold text-lg">Balances by Protocol</h2>
        <p className="mb-4 text-gray10 text-sm">
          Your deposits and positions across DeFi protocols
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray5 text-left">
                <th className="pb-3 font-medium text-gray10 text-xs">
                  Protocol
                </th>
                <th className="pb-3 font-medium text-gray10 text-xs">Type</th>
                <th className="pb-3 text-right font-medium text-gray10 text-xs">
                  Value
                </th>
                <th className="pb-3 text-right font-medium text-gray10 text-xs">
                  APY
                </th>
                <th className="pb-3 text-right font-medium text-gray10 text-xs">
                  24h Change
                </th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_PROTOCOL_POSITIONS.map((position, index) => (
                <tr
                  className="border-b border-gray3 hover:bg-gray2 last:border-0"
                  key={index}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-violet9">
                        <span className="font-semibold text-white text-xs">
                          {position.protocolIcon}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray12 text-sm">
                          {position.protocol}
                        </p>
                        <p className="text-gray10 text-xs">ETH/USDC</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-gray4 px-2 py-1 text-gray11 text-xs">
                      {position.type}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <p className="font-medium text-gray12 text-sm">
                      {position.value}
                    </p>
                  </td>
                  <td className="py-3 text-right">
                    <p className="font-medium text-green-600 text-sm">
                      {position.apy}
                    </p>
                  </td>
                  <td className="py-3 text-right">
                    <p
                      className={cx(
                        'font-medium text-sm',
                        position.change24h.startsWith('+')
                          ? 'text-green-600'
                          : 'text-red-600',
                      )}
                    >
                      {position.change24h}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
