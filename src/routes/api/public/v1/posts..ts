import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/v1/posts/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/api/public/v1/posts/"!</div>
}
