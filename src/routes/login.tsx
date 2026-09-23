import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, LockKeyhole, ShieldCheck, Ticket } from 'lucide-react'
import { useState } from 'react'
import { api } from '../lib/api'

export const Route = createFileRoute('/login')({
  component: Login,
})

type LoginResponse = {
  token: string
  user: {
    id: number
    name: string
    email: string
  }
}

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()

    setError('')

    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        password,
      })

      localStorage.setItem('dear6_admin_token', response.data.token)

      navigate({ to: '/' })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6">
        <div className="grid w-full overflow-hidden rounded-2xl border bg-card shadow-xl lg:grid-cols-2">
          <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/10">
                  <Ticket className="size-6" />
                </div>

                <div>
                  <p className="text-lg font-bold">DEAR 6</p>
                  <p className="text-sm text-primary-foreground/70">
                    Lottery Administration
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
                Control Center
              </p>

              <h2 className="max-w-md text-4xl font-bold leading-tight">
                Manage every draw from one place.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-primary-foreground/70">
                Monitor users, tickets, draws, and winning results through the
                DEAR 6 administration panel.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <ShieldCheck className="size-4" />
              <span>Authorized administration access</span>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Ticket className="size-6" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold">DEAR 6</h1>
                  <p className="text-sm text-muted-foreground">Admin Panel</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LockKeyhole className="size-5" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to access the DEAR 6 administration panel.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError('')
                  }}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none transition focus:ring-2"
                  placeholder="admin@dear6.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setError('')
                    }}
                    className="w-full rounded-lg border bg-background px-3 py-2.5 pr-11 outline-none transition focus:ring-2"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              DEAR 6 Administration
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
