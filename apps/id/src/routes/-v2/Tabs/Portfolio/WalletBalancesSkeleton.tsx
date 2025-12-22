import { Skeleton } from '~/components/Skeleton'

function TokenRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray4 p-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10" variant="circular" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="space-y-2 text-right">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>
    </div>
  )
}

function ChainSectionSkeleton() {
  return (
    <div className="space-y-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="space-y-2">
        <TokenRowSkeleton />
        <TokenRowSkeleton />
        <TokenRowSkeleton />
      </div>
    </div>
  )
}

export function WalletBalancesSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
      <h2 className="font-semibold text-lg">Wallet Balances By Chain</h2>
      <div className="space-y-4">
        <ChainSectionSkeleton />
        <ChainSectionSkeleton />
      </div>
    </div>
  )
}
