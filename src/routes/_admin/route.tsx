import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin')({
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('dear6_admin_token')

      if (!token) {
        throw redirect({
          to: '/login',
        })
      }
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const handleLogout = () => {
    localStorage.removeItem('dear6_admin_token')
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 shrink-0 border-r bg-muted/30 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">DEAR 6</h1>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>

        <nav className="space-y-2">
          <Link
            to="/"
            activeProps={{
              className: 'bg-primary text-primary-foreground',
            }}
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Dashboard
          </Link>

          <Link
            to="/draws"
            activeProps={{
              className: 'bg-primary text-primary-foreground',
            }}
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Draws
          </Link>

          <Link
            to="/tickets"
            activeProps={{
              className: 'bg-primary text-primary-foreground',
            }}
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Tickets
          </Link>

          <Link
            to="/users"
            activeProps={{
              className: 'bg-primary text-primary-foreground',
            }}
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Users
          </Link>

          <Link
            to="/winners"
            activeProps={{
              className: 'bg-primary text-primary-foreground',
            }}
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Winners
          </Link>

          <div className="rounded-md px-3 py-2 text-sm text-muted-foreground">
            Wallets
          </div>

          <div className="rounded-md px-3 py-2 text-sm text-muted-foreground">
            Settings
          </div>
        </nav>

        <div className="mt-8 border-t pt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}