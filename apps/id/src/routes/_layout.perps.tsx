import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from './-v2/Dashboard'

export const Route = createFileRoute('/_layout/perps')({
  component: Dashboard,
})
