import { createFileRoute } from '@tanstack/react-router'
import { useAccount } from 'wagmi'

// import { Dashboard } from './-components/Dashboard'
import { Landing } from './-components/Landing'
import { Dashboard } from './-v2/Dashboard'

export const Route = createFileRoute('/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  const account = useAccount()

  if (!account.isConnected) return <Landing />
  return <Dashboard />
}
