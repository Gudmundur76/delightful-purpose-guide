import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/v1/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/api/public/v1/admin/"!</div>
}
