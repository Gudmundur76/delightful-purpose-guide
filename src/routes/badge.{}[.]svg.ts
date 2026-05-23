import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/badge/{}.svg')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/badge/{}.svg"!</div>
}
