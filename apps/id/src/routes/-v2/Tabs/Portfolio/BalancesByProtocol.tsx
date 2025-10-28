import { cx } from 'cva'
import type { ProtocolPosition } from '~/types/portfolio'

const DUMMY_PROTOCOL_POSITIONS: ProtocolPosition[] = [
  {
    apy: '24.5%',
    change24h: '++$5.20',
    pair: 'ETH/USDC',
    protocol: 'Uniswap V3',
    protocolIcon: 'U',
    type: 'Liquidity Pool',
    value: '$2,450.00',
  },
  {
    apy: '24.5%',
    change24h: '++$5.20',
    pair: 'ETH/USDC',
    protocol: 'Uniswap V3',
    protocolIcon: 'U',
    type: 'Liquidity Pool',
    value: '$2,450.00',
  },
  {
    apy: '24.5%',
    change24h: '++$5.20',
    pair: 'ETH/USDC',
    protocol: 'Uniswap V3',
    protocolIcon: 'U',
    type: 'Liquidity Pool',
    value: '$2,450.00',
  },
  {
    apy: '24.5%',
    change24h: '++$5.20',
    pair: 'ETH/USDC',
    protocol: 'Uniswap V3',
    protocolIcon: 'U',
    type: 'Liquidity Pool',
    value: '$2,450.00',
  },
]

export function BalancesByProtocol() {
  return (
    <div className="rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
      <h2 className="mb-2 font-semibold text-lg">Balances by Protocol</h2>
      <p className="mb-4 text-gray10 text-sm">
        Your deposits and positions across DeFi protocols
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-gray5 border-b text-left">
              <th className="pb-3 font-medium text-gray10 text-xs">Protocol</th>
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
                className="border-gray3 border-b last:border-0 hover:bg-gray2"
                key={`${position.protocol}-${position.pair}-${index}`}
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
                      <p className="text-gray10 text-xs">{position.pair}</p>
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
  )
}
