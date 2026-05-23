import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/vs/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/vs/"!</div>
}
