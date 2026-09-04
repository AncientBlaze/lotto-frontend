import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
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

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <p className="mt-2 text-muted-foreground">Loading tickets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <p className="mt-2 text-destructive">Failed to load tickets.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <p className="mt-1 text-muted-foreground">View all lottery tickets.</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Ticket
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Draw
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  User ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Series
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Draw Label
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {tickets?.map((ticket) => (
                <tr
                  key={`${ticket.drawId}-${ticket.ticketNumber}-${ticket.drawId}`}
                >
                  <td className="px-6 py-4 font-medium">
                    {ticket.ticketNumber}
                  </td>

                  <td className="px-6 py-4">{ticket.drawId}</td>

                  <td className="px-6 py-4">{ticket.userId}</td>

                  <td className="px-6 py-4">{ticket.series}</td>

                  <td className="px-6 py-4">₹{ticket.price}</td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      {ticket.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {ticket.drawLabel}
                  </td>
                </tr>
              ))}

              {tickets?.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
