import { LogoMark } from '@porto/apps/components'
import { cx } from 'cva'
import type { PropsWithChildren } from 'react'

export function Layout(props: PropsWithChildren) {
  return <main className="mx-auto flex h-full max-lg:flex-col" {...props} />
}

export namespace Layout {
  export function Hero(props: PropsWithChildren) {
    return <div className="fixed inset-4 w-hero max-lg:hidden" {...props} />
  }

  export function Content(props: PropsWithChildren) {
    const { ...rest } = props
    return (
      <div
        className="ml-[calc(var(--spacing-hero)+1rem)] flex w-full flex-1 flex-col py-6 max-md:py-4 max-lg:ml-0"
        {...rest}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 max-sm:px-4">
          {props.children}
        </div>
      </div>
    )
  }

  export function Header(props: {
    left?: React.ReactNode | boolean | string | undefined
    leftClassName?: string | undefined
    right?: React.ReactNode | undefined
  }) {
    const { left, leftClassName } = props
    return (
      <div className="flex items-center justify-between">
        {typeof left === 'object' ? (
          left
        ) : (
          <div className="min-lg:opacity-0">
            {typeof left === 'string' ? (
              <div className={cx(leftClassName, 'font-[500] text-[24px]')}>
                {left}
              </div>
            ) : left === false ? null : (
              <div className="h-[28px] w-[40px]">
                <LogoMark />
              </div>
            )}
          </div>
        )}
        {/* TEMPORARILY HIDE */}
        {/* {right ?? (
          <Button
            render={<Link aria-label="About Oportet" to="/about" />}
            size="square"
            variant="outline"
          >
            <CircleHelp className="size-5 text-gray10" />
          </Button>
        )} */}
      </div>
    )
  }
}
