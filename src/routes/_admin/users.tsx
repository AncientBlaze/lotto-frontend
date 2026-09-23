import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ShieldCheck, UserRound, Users as UsersIcon } from 'lucide-react'
import { api } from '../../lib/api'

export const Route = createFileRoute('/_admin/users')({
  component: UsersPage,
})

type User = {
  id: number
  name: string
  email: string
  role: string
}

function UsersPage() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await api.get<User[]>('/admin/users')
      return response.data
    },
  })

  const userCount = users?.length ?? 0

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Account Management
          </p>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Users
              </h1>

              <p className="mt-1 text-muted-foreground">
                View registered DEAR 6 accounts and their access roles.
              </p>
            </div>

            {!isLoading && !error && (
              <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <UsersIcon className="size-5" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Users
                  </p>

                  <p className="text-xl font-bold">
                    {userCount.toLocaleString('en-IN')}
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
        ) : users && users.length > 0 ? (
          <UsersTable users={users} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function UsersTable({ users }: { users: User[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b px-6 py-4">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <UsersIcon className="size-5" />
        </div>

        <div>
          <h2 className="font-semibold">Registered Users</h2>

          <p className="text-sm text-muted-foreground">
            Accounts currently registered in DEAR 6.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ID
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                User
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Role
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-muted/20"
              >
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  #{user.id}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound className="size-4" />
                    </div>

                    <span className="font-medium">
                      {user.name}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm">
                  {user.email}
                </td>

                <td className="px-6 py-4">
                  <RoleBadge role={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t bg-muted/10 px-6 py-3">
        <p className="text-xs text-muted-foreground">
          Showing {users.length.toLocaleString('en-IN')} user
          {users.length === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role.toUpperCase() === 'ADMIN'

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs font-medium">
      {isAdmin && <ShieldCheck className="size-3.5" />}
      {role}
    </span>
  )
}

function LoadingState() {
  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="size-5 animate-pulse rounded-full bg-muted" />

        <p className="text-sm text-muted-foreground">
          Loading users...
        </p>
      </div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="rounded-xl border border-destructive/30 bg-card p-8 shadow-sm">
      <h2 className="font-semibold">Unable to load users</h2>

      <p className="mt-1 text-sm text-destructive">
        Failed to load users. Please try again.
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed bg-card p-12 text-center shadow-sm">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UsersIcon className="size-6" />
      </div>

      <h2 className="mt-4 text-xl font-semibold">
        No Users Found
      </h2>

      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Registered accounts will appear here.
      </p>
    </div>
  )
}