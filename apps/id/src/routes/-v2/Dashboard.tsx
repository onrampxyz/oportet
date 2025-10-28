import * as React from 'react'
import { Layout } from '../-v2/Layout'
import { Portfolio, Recovery, Sessions, Transactions } from './Tabs'

// Example component showing tab structure
export function Dashboard() {
  const [activeTab, setActiveTab] = React.useState('portfolio')

  return (
    <div className='space-y-4'>
      <div className='px-6 space-y-8'>
        {/* Tabs */}
        <Layout.Tabs activeTab={activeTab} onTabChange={setActiveTab}>
          {/* Portfolio Tab */}
          <Layout.TabPanel tabId='portfolio'>
            <Portfolio />
          </Layout.TabPanel>

          {/* Transactions Tab */}
          <Layout.TabPanel tabId='transactions'>
            <Transactions />
          </Layout.TabPanel>

          {/* Recovery Tab */}
          <Layout.TabPanel tabId='recovery'>
            <Recovery />
          </Layout.TabPanel>

          {/* Manage Sessions Tab */}
          <Layout.TabPanel tabId='manage-sessions'>
            <Sessions />
          </Layout.TabPanel>
        </Layout.Tabs>
      </div>
    </div>
  )
}
