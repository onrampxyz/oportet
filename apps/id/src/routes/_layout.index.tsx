import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAccount } from 'wagmi'

import { Landing } from './-components/Landing'

export const Route = createFileRoute('/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  const account = useAccount()

  if (!account.isConnected) return <Landing />

  // Redirect to perps route when connected
  return <Navigate to="/portfolio" />
}
