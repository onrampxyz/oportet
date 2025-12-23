import { Skeleton } from '../../../../components/Skeleton'

export function PortfolioValueTilesSkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
      {/* Main Tile Skeleton */}
      <div className="space-y-4 rounded-lg border border-gray6 bg-gray2 p-6 dark:border-gray5 dark:bg-gray3">
        <div>
          <Skeleton className="mb-2" height={16} width={150} />
          <Skeleton height={36} width={200} />
        </div>

        <Skeleton height={32} width={280} />

        <div className="flex gap-6 border-gray6 border-t pt-4 dark:border-gray5">
          <div>
            <Skeleton className="mb-2" height={14} width={80} />
            <Skeleton height={24} width={100} />
          </div>
          <div>
            <Skeleton className="mb-2" height={14} width={100} />
            <Skeleton height={24} width={100} />
          </div>
        </div>
      </div>

      {/* Right Side Tiles Skeleton */}
      <div className="grid gap-3">
        {/* Profit Skeleton */}
        <div className="space-y-1 rounded-lg border border-gray6 bg-gray2 p-4 dark:border-gray5 dark:bg-gray3">
          <div className="flex items-center justify-between">
            <Skeleton height={16} width={80} />
            <Skeleton height={28} variant="circular" width={28} />
          </div>
          <Skeleton height={32} width={120} />
        </div>

        {/* Loss Skeleton */}
        <div className="space-y-1 rounded-lg border border-gray6 bg-gray2 p-4 dark:border-gray5 dark:bg-gray3">
          <div className="flex items-center justify-between">
            <Skeleton height={16} width={80} />
            <Skeleton height={28} variant="circular" width={28} />
          </div>
          <Skeleton height={32} width={120} />
        </div>
      </div>
    </div>
  )
}
