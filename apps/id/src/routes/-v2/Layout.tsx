import * as Ariakit from '@ariakit/react'
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
        <Ariakit.TabList className="flex gap-0 border-b border-gray5">
          <Ariakit.Tab
            className={cx(
              'relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
              'text-gray10 hover:text-gray12',
              'data-[active-item]:text-white',
              'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
              'data-[active-item]:bg-violet9 rounded-t-md',
              'data-[active-item]:after:bg-violet9',
            )}
            id="portfolio"
          >
            Portfolio
          </Ariakit.Tab>
          <Ariakit.Tab
            className={cx(
              'relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
              'text-gray10 hover:text-gray12',
              'data-[active-item]:text-white',
              'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
              'data-[active-item]:bg-violet9 rounded-t-md',
              'data-[active-item]:after:bg-violet9',
            )}
            id="transactions"
          >
            Transactions
          </Ariakit.Tab>
          <Ariakit.Tab
            className={cx(
              'relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
              'text-gray10 hover:text-gray12',
              'data-[active-item]:text-white',
              'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
              'data-[active-item]:bg-violet9 rounded-t-md',
              'data-[active-item]:after:bg-violet9',
            )}
            id="recovery"
          >
            Recovery
          </Ariakit.Tab>
          <Ariakit.Tab
            className={cx(
              'relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
              'text-gray10 hover:text-gray12',
              'data-[active-item]:text-white',
              'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
              'data-[active-item]:bg-violet9 rounded-t-md',
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
}
