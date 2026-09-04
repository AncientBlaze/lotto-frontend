import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../lib/api'

export const Route = createFileRoute('/_admin/winners')({
  component: WinnersPage,
})

type Winner = {
  ticketNumber: string
  drawId: string
  userId: number
  type: string
  amount: number
  status: string
}

function WinnersPage() {
  const {
    data: winners,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin', 'winners'],
    queryFn: async () => {
      const response = await api.get<Winner[]>('/admin/winners')
      return response.data
    },
  })

  if (isLoading) {
    return <div className="p-8">Loading winners...</div>
  }

  if (error) {
    return <div className="p-8 text-destructive">Failed to load winners.</div>
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Winners</h1>
        <p className="text-muted-foreground">
          Winning tickets and prize payouts
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Ticket
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Draw</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                User ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Prize</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {winners?.map((winner) => (
              <tr
                key={`${winner.drawId}-${winner.ticketNumber}`}
                className="border-t"
              >
                <td className="px-4 py-3 font-medium">{winner.ticketNumber}</td>

                <td className="px-4 py-3">{winner.drawId}</td>

                <td className="px-4 py-3">{winner.userId}</td>

                <td className="px-4 py-3">{winner.type}</td>

                <td className="px-4 py-3">
                  ₹{winner.amount.toLocaleString('en-IN')}
                </td>

                <td className="px-4 py-3">{winner.status}</td>
              </tr>
            ))}

            {winners?.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No winners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
