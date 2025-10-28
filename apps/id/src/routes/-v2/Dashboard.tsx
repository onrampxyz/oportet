import { useLocation } from '@tanstack/react-router'
import { Layout } from '../-v2/Layout'
import { Portfolio, Recovery, Sessions, Transactions } from './Tabs'

// Dashboard with routing-based tabs
export function Dashboard() {
  const location = useLocation()

  // Determine active tab from current pathname
  const getActiveTab = () => {
    const pathname = location.pathname
    if (pathname.includes('/transactions')) return 'transactions'
    if (pathname.includes('/recovery')) return 'recovery'
    if (pathname.includes('/sessions')) return 'manage-sessions'
    if (pathname.includes('/portfolio')) return 'portfolio'
    return 'portfolio' // default
  }

  const activeTab = getActiveTab()

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'transactions':
        return <Transactions />
      case 'recovery':
        return <Recovery />
      case 'manage-sessions':
        return <Sessions />
      default:
        return <Portfolio />
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-8 px-6">
        {/* Tabs with routing */}
        <Layout.TabsRouter activeTab={activeTab}>
          {renderTabContent()}
        </Layout.TabsRouter>
      </div>
    </div>
  )
}
