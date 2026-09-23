import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  ClipboardList,
  Ticket as TicketIcon,
  UserRound,
} from 'lucide-react'
import { api } from '../../lib/api'

export const Route = createFileRoute('/_admin/tickets')({
  component: TicketsPage,
})

type Ticket = {
  ticketNumber: string
  drawId: string
  price: number
  series: string
  status: string
  drawLabel: string
  userId: number
}

function TicketsPage() {
  const {
    data: tickets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: async () => {
      const response = await api.get<Ticket[]>('/admin/tickets')
      return response.data
    },
  })

  const ticketCount = tickets?.length ?? 0

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Lottery Management
          </p>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Tickets
              </h1>

              <p className="mt-1 text-muted-foreground">
                View all lottery tickets and their current status.
              </p>
            </div>

            {!isLoading && !error && (
              <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <TicketIcon className="size-5" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Tickets
                  </p>

                  <p className="text-xl font-bold">
                    {ticketCount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
        ) : tickets && tickets.length > 0 ? (
          <TicketTable tickets={tickets} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function TicketTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <ClipboardList className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">Ticket Registry</h2>
            <p className="text-sm text-muted-foreground">
              All tickets currently available in the system.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ticket
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Draw
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                User
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Series
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Price
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Draw Label
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {tickets.map((ticket) => (
              <tr
                key={`${ticket.drawId}-${ticket.ticketNumber}-${ticket.userId}`}
                className="transition-colors hover:bg-muted/20"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold tracking-wide">
                    {ticket.ticketNumber}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-md border bg-muted/30 px-2.5 py-1 text-sm font-medium">
                    {ticket.drawId}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <UserRound className="size-4 text-muted-foreground" />
                    <span>{ticket.userId}</span>
                  </div>
                </td>

                <td className="px-6 py-4 font-medium">
                  {ticket.series}
                </td>

                <td className="px-6 py-4 font-medium">
                  ₹{ticket.price.toLocaleString('en-IN')}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={ticket.status} />
                </td>

                <td className="max-w-xs px-6 py-4 text-sm text-muted-foreground">
                  <span className="block truncate" title={ticket.drawLabel}>
                    {ticket.drawLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t bg-muted/10 px-6 py-3">
        <p className="text-xs text-muted-foreground">
          Showing {tickets.length.toLocaleString('en-IN')} ticket
          {tickets.length === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full border bg-muted px-3 py-1 text-xs font-medium">
      {status}
    </span>
  )
}

function LoadingState() {
  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="size-5 animate-pulse rounded-full bg-muted" />

        <p className="text-sm text-muted-foreground">
          Loading tickets...
        </p>
      </div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="rounded-xl border border-destructive/30 bg-card p-8 shadow-sm">
      <h2 className="font-semibold">Unable to load tickets</h2>

      <p className="mt-1 text-sm text-destructive">
        Failed to load tickets. Please try again.
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed bg-card p-12 text-center shadow-sm">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <TicketIcon className="size-6" />
      </div>

      <h2 className="mt-4 text-xl font-semibold">
        No Tickets Found
      </h2>

      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Tickets will appear here once users purchase them.
      </p>
    </div>
  )
}