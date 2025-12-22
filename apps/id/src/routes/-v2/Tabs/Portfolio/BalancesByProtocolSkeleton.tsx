import { Skeleton } from '~/components/Skeleton'

function ProtocolRowSkeleton() {
  return (
    <tr className="border-gray3 border-b">
      <td className="py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8" variant="circular" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </td>
      <td className="py-3">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>
      <td className="py-3">
        <div className="flex justify-end">
          <Skeleton className="h-4 w-16" />
        </div>
      </td>
      <td className="py-3">
        <div className="flex justify-end">
          <Skeleton className="h-4 w-12" />
        </div>
      </td>
      <td className="py-3">
        <div className="flex justify-end">
          <Skeleton className="h-4 w-16" />
        </div>
      </td>
    </tr>
  )
}

export function BalancesByProtocolSkeleton() {
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
            <ProtocolRowSkeleton />
            <ProtocolRowSkeleton />
            <ProtocolRowSkeleton />
            <ProtocolRowSkeleton />
          </tbody>
        </table>
      </div>
    </div>
  )
}
