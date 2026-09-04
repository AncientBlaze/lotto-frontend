import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
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

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="mt-2 text-muted-foreground">Loading users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="mt-2 text-destructive">Failed to load users.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="mt-1 text-muted-foreground">Manage registered users.</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">ID</th>

                <th className="px-6 py-4 text-left text-sm font-medium">
                  Name
                </th>

                <th className="px-6 py-4 text-left text-sm font-medium">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-sm font-medium">
                  Role
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {users?.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">{user.id}</td>

                  <td className="px-6 py-4 font-medium">{user.name}</td>

                  <td className="px-6 py-4">{user.email}</td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}

              {users?.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No users found.
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
