import { cx } from 'cva'

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
  totalChange: '+$51.15',
  wallet: '+$23.45',
  protocols: '+$51.15',
  transactions: 12,
}

const DUMMY_WALLET_BALANCES: WalletBalance[] = [
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '$3,535.669',
    balance: '2.45 WETH',
    usdValue: '$9,001.89',
  },
  {
    symbol: 'RISE',
    name: 'Rise Token',
    address: '$3,535.669',
    balance: '2.45 RISE',
    usdValue: '$9,001.89',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '$3,535.669',
    balance: '2.45 USDC',
    usdValue: '$9,001.89',
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '$3,535.669',
    balance: '2.45 WBTC',
    usdValue: '$9,001.89',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '$3,535.669',
    balance: '2.45 USDT',
    usdValue: '$9,001.89',
  },
]

const DUMMY_PROTOCOL_POSITIONS: ProtocolPosition[] = [
  {
    protocol: 'Uniswap V3',
    protocolIcon: 'U',
    type: 'Liquidity Pool',
    value: '$2,450.00',
    apy: '24.5%',
    change24h: '++$5.20',
  },
  {
    protocol: 'Uniswap V3',
    protocolIcon: 'U',
    type: 'Liquidity Pool',
    value: '$2,450.00',
    apy: '24.5%',
    change24h: '++$5.20',
  },
  {
    protocol: 'Uniswap V3',
    protocolIcon: 'U',
    type: 'Liquidity Pool',
    value: '$2,450.00',
    apy: '24.5%',
    change24h: '++$5.20',
  },
  {
    protocol: 'Uniswap V3',
    protocolIcon: 'U',
    type: 'Liquidity Pool',
    value: '$2,450.00',
    apy: '24.5%',
    change24h: '++$5.20',
  },
]

export function Portfolio() {
  return (
    <div className="space-y-6">
      {/* 24h Balance Change Section */}
      <div className="rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
        <h2 className="mb-2 font-semibold text-lg">24h Balance Change</h2>
        <p className="mb-4 text-gray10 text-sm">
          Summary of portfolio changes over the last 24 hours
        </p>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="mb-1 text-gray10 text-xs">Total Change</p>
            <p className="font-semibold text-xl">{DUMMY_BALANCE_CHANGE.totalChange}</p>
          </div>
          <div>
            <p className="mb-1 text-gray10 text-xs">Wallet</p>
            <p className="font-semibold text-green-600 text-xl">
              {DUMMY_BALANCE_CHANGE.wallet}
            </p>
          </div>
          <div>
            <p className="mb-1 text-gray10 text-xs">Protocols</p>
            <p className="font-semibold text-green-600 text-xl">
              {DUMMY_BALANCE_CHANGE.protocols}
            </p>
          </div>
          <div>
            <p className="mb-1 text-gray10 text-xs">Transactions</p>
            <p className="font-semibold text-xl">{DUMMY_BALANCE_CHANGE.transactions}</p>
          </div>
        </div>
      </div>

      {/* Wallet Balances Section */}
      <div className="rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
        <h2 className="mb-2 font-semibold text-lg">Wallet Balances</h2>
        <p className="mb-4 text-gray10 text-sm">Your token holdings in this wallet</p>

        <div className="space-y-3">
          {DUMMY_WALLET_BALANCES.map((balance, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray4 p-3 hover:bg-gray2"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gray5">
                  <span className="font-semibold text-gray11 text-sm">
                    {balance.symbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray12 text-sm">{balance.symbol}</p>
                  <p className="text-gray10 text-xs">{balance.address}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray12 text-sm">{balance.balance}</p>
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
                <th className="pb-3 font-medium text-gray10 text-xs">Protocol</th>
                <th className="pb-3 font-medium text-gray10 text-xs">Type</th>
                <th className="pb-3 text-right font-medium text-gray10 text-xs">
                  Value
                </th>
                <th className="pb-3 text-right font-medium text-gray10 text-xs">APY</th>
                <th className="pb-3 text-right font-medium text-gray10 text-xs">
                  24h Change
                </th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_PROTOCOL_POSITIONS.map((position, index) => (
                <tr
                  key={index}
                  className="border-b border-gray3 hover:bg-gray2 last:border-0"
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
                    <p className="font-medium text-gray12 text-sm">{position.value}</p>
                  </td>
                  <td className="py-3 text-right">
                    <p className="font-medium text-green-600 text-sm">{position.apy}</p>
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
