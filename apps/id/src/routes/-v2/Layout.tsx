import * as Ariakit from '@ariakit/react'
import { Link } from '@tanstack/react-router'
import { cx } from 'cva'
import type { PropsWithChildren } from 'react'

export function Layout(props: PropsWithChildren) {
  return <main className="mx-auto flex h-full max-lg:flex-col" {...props} />
}

export namespace Layout {
  export type TabsProps = PropsWithChildren<{
    activeTab: string
    onTabChange: (tab: string) => void
  }>

  export function Tabs(props: TabsProps) {
    const { activeTab, onTabChange } = props

    return (
      <Ariakit.TabProvider
        selectedId={activeTab}
        setSelectedId={(id) => {
          if (id) onTabChange(id)
        }}
      >
        <Ariakit.TabList className="flex gap-0 border-gray5 border-b">
          <Ariakit.Tab
            className={cx(
              'relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors',
              'text-gray10 hover:text-gray12',
              'data-[active-item]:text-white',
              'after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5',
              'rounded-t-md data-[active-item]:bg-violet9',
              'data-[active-item]:after:bg-violet9',
            )}
            id="portfolio"
          >
            Portfolio
          </Ariakit.Tab>
          <Ariakit.Tab
            className={cx(
              'relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors',
              'text-gray10 hover:text-gray12',
              'data-[active-item]:text-white',
              'after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5',
              'rounded-t-md data-[active-item]:bg-violet9',
              'data-[active-item]:after:bg-violet9',
            )}
            id="transactions"
          >
            Transactions
          </Ariakit.Tab>
          <Ariakit.Tab
            className={cx(
              'relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors',
              'text-gray10 hover:text-gray12',
              'data-[active-item]:text-white',
              'after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5',
              'rounded-t-md data-[active-item]:bg-violet9',
              'data-[active-item]:after:bg-violet9',
            )}
            id="recovery"
          >
            Recovery
          </Ariakit.Tab>
          <Ariakit.Tab
            className={cx(
              'relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors',
              'text-gray10 hover:text-gray12',
              'data-[active-item]:text-white',
              'after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5',
              'rounded-t-md data-[active-item]:bg-violet9',
              'data-[active-item]:after:bg-violet9',
            )}
            id="manage-sessions"
          >
            Manage Sessions
          </Ariakit.Tab>
        </Ariakit.TabList>
        {props.children}
      </Ariakit.TabProvider>
    )
  }

  export type TabPanelProps = PropsWithChildren<{
    tabId: string
  }>

  export function TabPanel(props: TabPanelProps) {
    return (
      <Ariakit.TabPanel className="" tabId={props.tabId}>
        {props.children}
      </Ariakit.TabPanel>
    )
  }

  // New routing-based tabs component
  export type TabsRouterProps = PropsWithChildren<{
    activeTab: string
  }>

  export function TabsRouter(props: TabsRouterProps) {
    const { activeTab } = props

    return (
      <div>
        <div className="flex gap-0 border-gray5 border-b">
          <Link
            className={cx(
              'relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors',
              'text-gray10 hover:text-gray12',
              'after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5',
              'rounded-t-md',
              activeTab === 'portfolio'
                ? 'bg-violet9 text-white after:bg-violet9 hover:text-white'
                : '',
            )}
            to="/portfolio"
          >
            Portfolio
          </Link>
          <Link
            className={cx(
              'relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors',
              'text-gray10 hover:text-gray12',
              'after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5',
              'rounded-t-md',
              activeTab === 'transactions'
                ? 'bg-violet9 text-white after:bg-violet9 hover:text-white'
                : '',
            )}
            to="/transactions"
          >
            Transactions
          </Link>
          <Link
            className={cx(
              'relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors',
              'text-gray10 hover:text-gray12',
              'after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5',
              'rounded-t-md',
              activeTab === 'recovery'
                ? 'bg-violet9 text-white after:bg-violet9 hover:text-white'
                : '',
            )}
            to="/recovery"
          >
            Recovery
          </Link>
          <Link
            className={cx(
              'relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors',
              'text-gray10 hover:text-gray12',
              'after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5',
              'rounded-t-md',
              activeTab === 'manage-sessions'
                ? 'bg-violet9 text-white after:bg-violet9 hover:text-white'
                : '',
            )}
            to="/sessions"
          >
            Manage Sessions
          </Link>
        </div>
        <div className="pt-6">{props.children}</div>
      </div>
    )
  }
}
