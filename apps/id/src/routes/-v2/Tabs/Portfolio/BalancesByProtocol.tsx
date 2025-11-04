import { Spinner } from '@porto/apps/components'
import { cx } from 'cva'
import type { FormattedPosition } from '~/types/protocol'

export type ProtocolPositionProps = {
  positions?: FormattedPosition[]
  isLoading: Boolean
}

export function BalancesByProtocol(props: ProtocolPositionProps) {
  const { positions, isLoading } = props

  const hasBalance = !isLoading && positions && positions?.length !== 0

  return (
    <div className="rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
      <h2 className="mb-2 font-semibold text-lg">Balances by Protocol</h2>
      <p className="mb-4 text-gray10 text-sm">
        Your deposits and positions across DeFi protocols
      </p>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center pt-6">
          <Spinner className="size-6!" />
        </div>
      )}

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
            {!hasBalance && (
              <div className="">
                <p className='pt-6 font-medium text-gray10 text-sm'>
                  You have no available balance!
                </p>
              </div>
            )}

            {positions?.map((position) => (
              <tr
                className="border-gray3 border-b last:border-0 hover:bg-gray2"
                key={position.id}
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-violet9">
                      <span className="font-semibold text-white text-xs">
                        {position.protocol.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray12 text-sm">
                        {position.protocol.name}
                      </p>
                      <p className="text-gray10 text-xs">
                        {position.assetPair}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <span className="rounded-full bg-gray4 px-2 py-1 text-gray11 text-xs">
                    {position.positionType.name}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <p className="font-medium text-gray12 text-sm">
                    {position.usdValue} $
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
                      position.change24h?.toString().startsWith('+')
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
