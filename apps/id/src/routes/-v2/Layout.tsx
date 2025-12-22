import * as Ariakit from '@ariakit/react'
import { Link } from '@tanstack/react-router'
import { cx } from 'cva'
import type { PropsWithChildren } from 'react'

export const TabItems = [
  // {
  //   id: 'assets',
  //   name: 'Assets',
  //   path: '/assets',
  // },
  {
    id: 'portfolio',
    name: 'Portfolio',
    path: '/portfolio',
  },
  {
    id: 'transactions',
    name: 'Transactions',
    path: '/transactions',
  },
  {
    id: 'recovery',
    name: 'Recovery',
    path: '/recovery',
  },
  {
    id: 'sessions',
    name: 'Sessions',
    path: '/sessions',
  },
]

export function Layout(props: Readonly<PropsWithChildren>) {
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
          {TabItems.map((tab) => {
            return (
              <Ariakit.Tab
                className={cx(
                  'relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors',
                  'text-gray10 hover:text-gray12',
                  'data-[active-item]:text-white data-[active-item]:hover:bg-[var(--background-color-th_primary-hovered)]',
                  'after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5',
                  'rounded-t-md data-[active-item]:bg-[var(--background-color-th_primary)]',
                  'data-[active-item]:after:[var(--background-color-th_primary)]',
                )}
                id={tab.id}
                key={tab.id}
              >
                {tab.name}
              </Ariakit.Tab>
            )
          })}
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
          {TabItems.map((tab) => {
            return (
              <Link
                className={cx(
                  'relative flex items-center gap-2 px-3 py-2 font-medium text-xs transition-colors sm:text-sm md:px-4',
                  'text-gray10 hover:text-gray12',
                  'after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5',
                  'rounded-t-md',
                  activeTab === tab.id
                    ? 'bg-[var(--background-color-th_primary)] text-white hover:text-white after:[var(--background-color-th_primary)]'
                    : '',
                )}
                key={tab.id}
                to={tab.path}
              >
                {tab.name}
              </Link>
            )
          })}
        </div>
        <div className="pt-6">{props.children}</div>
      </div>
    )
  }
}
