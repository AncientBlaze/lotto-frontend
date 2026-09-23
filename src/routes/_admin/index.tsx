import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  CircleDollarSign,
  ClipboardList,
  Ticket,
  Trophy,
  Users,
} from 'lucide-react'
import { api } from '../../lib/api'

export const Route = createFileRoute('/_admin/')({
  component: Dashboard,
  notFoundComponent: NotFoundError,
})

type Draw = {
  id: string
  label: string
  ticketPrice: number
  seriesNumber: number
  seriesLetter: string
  startingSequence: number
  endingSequence: number
  status: string
}

function NotFoundError() {
  return <h1>404 Not Found</h1>
}

function Dashboard() {
  const { data: currentDraw, isLoading: drawLoading } = useQuery({
    queryKey: ['draws', 'current'],
    queryFn: async () => {
      const response = await api.get<Draw>('/draws/current')
      return response.data
    },
  })

  const { data: userCount, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'stats', 'users'],
    queryFn: async () => {
      const response = await api.get<{ count: number }>(
        '/stats/users',
      )
      return response.data.count
    },
  })

  const { data: ticketStats, isLoading: ticketsLoading } = useQuery({
    queryKey: ['admin', 'stats', 'tickets'],
    queryFn: async () => {
      const response = await api.get<{ ticketsSold: number }>(
        '/admin/stats/tickets',
      )
      return response.data
    },
  })

  const { data: walletStats, isLoading: walletLoading } = useQuery({
    queryKey: ['admin', 'stats', 'wallet'],
    queryFn: async () => {
      const response = await api.get<{ totalBalance: number }>(
        '/admin/stats/wallet',
      )
      return response.data
    },
  })

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString('en-IN')}`

  const stats = [
    {
      title: 'Total Users',
      value: usersLoading
        ? '...'
        : (userCount ?? 0).toLocaleString('en-IN'),
      description: 'Registered accounts',
      icon: Users,
    },
    {
      title: 'Tickets Sold',
      value: ticketsLoading
        ? '...'
        : (ticketStats?.ticketsSold ?? 0).toLocaleString('en-IN'),
      description: 'All-time ticket sales',
      icon: Ticket,
    },
    {
      title: 'Wallet Balance',
      value: walletLoading
        ? '...'
        : formatCurrency(walletStats?.totalBalance ?? 0),
      description: 'Total user wallet balance',
      icon: CircleDollarSign,
    },
    {
      title: 'Current Draw',
      value: drawLoading ? '...' : currentDraw?.id ?? 'None',
      description: currentDraw?.status ?? 'No active draw',
      icon: Trophy,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Administration
          </p>

          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Dashboard
              </h2>
              <p className="mt-1 text-muted-foreground">
                Monitor DEAR 6 activity and manage the current lottery.
              </p>
            </div>

            {currentDraw && (
              <div className="rounded-lg border bg-card px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current Draw
                </p>
                <p className="mt-1 font-semibold">{currentDraw.label}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.title}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight">
                      {stat.value}
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>

                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    <Icon className="size-5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <ClipboardList className="size-5 text-primary" />

              <div>
                <h3 className="font-semibold">Draw Overview</h3>
                <p className="text-sm text-muted-foreground">
                  Current lottery configuration
                </p>
              </div>
            </div>

            {drawLoading ? (
              <div className="mt-6 text-sm text-muted-foreground">
                Loading current draw...
              </div>
            ) : currentDraw ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Detail
                  label="Draw ID"
                  value={currentDraw.id}
                />

                <Detail
                  label="Ticket Price"
                  value={formatCurrency(currentDraw.ticketPrice)}
                />

                <Detail
                  label="Series"
                  value={`${currentDraw.seriesNumber}${currentDraw.seriesLetter}`}
                />

                <Detail
                  label="Sequence"
                  value={`${currentDraw.startingSequence.toLocaleString(
                    'en-IN',
                  )} - ${currentDraw.endingSequence.toLocaleString(
                    'en-IN',
                  )}`}
                />
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-dashed p-6 text-center">
                <p className="font-medium">No current draw</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a draw to begin managing the lottery.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <Trophy className="size-5 text-primary" />

              <div>
                <h3 className="font-semibold">Draw Status</h3>
                <p className="text-sm text-muted-foreground">
                  Current draw state
                </p>
              </div>
            </div>

            <div className="mt-6">
              {currentDraw ? (
                <>
                  <span className="inline-flex rounded-full border px-3 py-1 text-sm font-medium">
                    {currentDraw.status}
                  </span>

                  <p className="mt-4 text-sm text-muted-foreground">
                    {currentDraw.label}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active draw is currently configured.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  )
}