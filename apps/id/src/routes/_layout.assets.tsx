import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from './-v2/Dashboard'

export const Route = createFileRoute('/_layout/assets')({
  component: Dashboard,
})
