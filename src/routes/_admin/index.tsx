import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
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
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('dear6_admin_token')

    if (!token) {
      navigate({ to: '/login' })
    }
  }, [navigate])

  const { data: currentDraw, isLoading } = useQuery({
    queryKey: ['draws', 'current'],
    queryFn: async () => {
      const response = await api.get<Draw>('/draws/current')
      return response.data
    },
  })

  const { data: userCount, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'stats', 'users'],
    queryFn: async () => {
      const response = await api.get<{ count: number }>('/stats/users')
      return response.data.count
    },
  })

  const { data: ticketStats } = useQuery({
    queryKey: ['admin', 'stats', 'tickets'],
    queryFn: async () => {
      const response = await api.get<{ ticketsSold: number }>(
        '/admin/stats/tickets',
      )
      return response.data
    },
  })

  const { data: walletStats } = useQuery({
    queryKey: ['admin', 'stats', 'wallet'],
    queryFn: async () => {
      const response = await api.get<{ totalBalance: number }>(
        '/admin/stats/wallet',
      )
      return response.data
    },
  })
  
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Main content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="mt-1 text-muted-foreground">
              Welcome to the DEAR 6 administration panel.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Total Users"
              value={
                usersLoading
                  ? 'Loading...'
                  : userCount !== undefined
                    ? String(userCount)
                    : '0'
              }
            />
            <DashboardCard
              title="Tickets Sold"
              value={(ticketStats?.ticketsSold ?? 0).toString()}
            />
            <DashboardCard
              title="Current Draw"
              value={
                isLoading ? 'Loading...' : currentDraw ? currentDraw.id : 'None'
              }
            />
            <DashboardCard title="Wallet Balance" value={(walletStats?.totalBalance ?? 0).toString()} />
          </div>
        </main>
      </div>
    </div>
  )
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  )
}
