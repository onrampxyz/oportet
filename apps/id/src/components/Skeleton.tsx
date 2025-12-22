import { cx } from 'cva'

export type SkeletonProps = {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string
  height?: string
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton(props: SkeletonProps) {
  const {
    className,
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse',
  } = props

  const variantClasses = {
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    text: 'rounded',
  }

  const animationClasses = {
    none: '',
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
  }

  return (
    <div
      className={cx(
        'bg-gray4 dark:bg-gray3',
        variantClasses[variant],
        animationClasses[animation],
        className,
      )}
      style={{
        height,
        width,
      }}
    />
  )
}
