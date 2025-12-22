import { Skeleton } from '~/components/Skeleton'

export function SummaryCardSkeleton() {
  return (
    <div className="rounded-md border border-gray5 p-5 text-center">
      <Skeleton className="mx-auto mb-1 h-3 w-20" />
      <div className="flex justify-center">
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

export function SummarySkeleton() {
  return (
    <div className="rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
      <h2 className="mb-2 font-semibold text-lg">Portfolio Summary</h2>

      <p className="mb-4 text-gray10 text-sm">
        Summary of portfolio changes over the last 24 hours
      </p>

      <div className="grid grid-cols-4 gap-4">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>
    </div>
  )
}
