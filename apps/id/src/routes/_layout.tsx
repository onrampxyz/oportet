import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Header } from './-v2/Header'

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full space-y-8 max-w-7xl mx-auto">
      <Header />
      <Outlet />
    </div>
  )
}
