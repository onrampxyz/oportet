import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Header } from './-v2/Header'

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <Header />
      <Outlet />
    </div>
  )
}
