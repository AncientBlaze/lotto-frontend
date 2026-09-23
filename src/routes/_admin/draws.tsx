import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  CheckCircle2,
  CirclePlay,
  Lock,
  Plus,
  Trophy,
} from 'lucide-react'
import { api } from '../../lib/api'

export const Route = createFileRoute('/_admin/draws')({
  component: DrawsPage,
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

function DrawsPage() {
  const queryClient = useQueryClient()

  const [prizeAmount, setPrizeAmount] = useState('10000')
  const [prizeLoading, setPrizeLoading] = useState(false)
  const [prizeMessage, setPrizeMessage] = useState('')

  const [drawId, setDrawId] = useState('')
  const [drawLabel, setDrawLabel] = useState('')
  const [ticketPrice, setTicketPrice] = useState('100')
  const [seriesNumber, setSeriesNumber] = useState('1')
  const [seriesLetter, setSeriesLetter] = useState('A')
  const [startingSequence, setStartingSequence] = useState('10001')
  const [endingSequence, setEndingSequence] = useState('99999')

  const [createLoading, setCreateLoading] = useState(false)
  const [createMessage, setCreateMessage] = useState('')

  const { data: currentDraw, isLoading } = useQuery({
    queryKey: ['draws', 'current'],
    queryFn: async () => {
      const response = await api.get<Draw>('/draws/current')
      return response.data
    },
    retry: false,
  })

  const handleLockDraw = async () => {
    if (!currentDraw) return

    try {
      await api.post(`/draws/${currentDraw.id}/lock`)

      await queryClient.invalidateQueries({
        queryKey: ['draws', 'current'],
      })
    } catch (error) {
      console.error('Failed to lock draw:', error)
      alert('Failed to lock draw.')
    }
  }

  const handleStartDraw = async () => {
    if (!currentDraw) return

    try {
      await api.post(`/draws/${currentDraw.id}/start`)

      await queryClient.invalidateQueries({
        queryKey: ['draws', 'current'],
      })
    } catch (error) {
      console.error('Failed to start draw:', error)
      alert('Failed to start draw.')
    }
  }

  const handleExecuteDraw = async () => {
    if (!currentDraw) return

    const confirmed = window.confirm(
      `Execute Draw ${currentDraw.id}? This will select the winning ticket and complete the draw.`,
    )

    if (!confirmed) return

    try {
      const response = await api.post(`/draws/${currentDraw.id}/draw`)

      console.log('Draw completed:', response.data)

      await queryClient.invalidateQueries({
        queryKey: ['draws', 'current'],
      })

      alert('Draw completed successfully.')
    } catch (error) {
      console.error('Failed to execute draw:', error)

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            status?: number
            data?: unknown
          }
        }

        console.error('Status:', axiosError.response?.status)
        console.error('Response:', axiosError.response?.data)

        alert(
          `Draw failed: ${
            typeof axiosError.response?.data === 'string'
              ? axiosError.response.data
              : 'Unable to complete draw.'
          }`,
        )
      } else {
        alert('Failed to execute draw.')
      }
    }
  }

  const handleConfigurePrize = async () => {
    if (!currentDraw) return

    const amount = Number(prizeAmount)

    if (!amount || amount <= 0) {
      setPrizeMessage('Enter a valid prize amount.')
      return
    }

    setPrizeLoading(true)
    setPrizeMessage('')

    try {
      await api.post(`/draws/${currentDraw.id}/prizes`, {
        type: 'FIRST',
        amount,
      })

      setPrizeMessage('First prize configured successfully.')
    } catch (error) {
      console.error('Failed to configure prize:', error)
      setPrizeMessage('Failed to configure prize.')
    } finally {
      setPrizeLoading(false)
    }
  }

  const handleCreateDraw = async () => {
    const price = Number(ticketPrice)
    const series = Number(seriesNumber)
    const start = Number(startingSequence)
    const end = Number(endingSequence)

    if (!drawId.trim() || !drawLabel.trim()) {
      setCreateMessage('Draw ID and label are required.')
      return
    }

    if (!price || price <= 0) {
      setCreateMessage('Ticket price must be greater than zero.')
      return
    }

    if (!series || series <= 0) {
      setCreateMessage('Series number must be greater than zero.')
      return
    }

    if (!start || !end || start > end) {
      setCreateMessage('Enter a valid sequence range.')
      return
    }

    if (!seriesLetter.trim()) {
      setCreateMessage('Series letter is required.')
      return
    }

    setCreateLoading(true)
    setCreateMessage('')

    try {
      await api.post('/draws', {
        id: drawId.trim(),
        label: drawLabel.trim(),
        ticketPrice: price,
        seriesNumber: series,
        seriesLetter: seriesLetter.trim().toUpperCase(),
        startingSequence: start,
        endingSequence: end,
      })

      setCreateMessage('Draw created successfully.')

      setDrawId('')
      setDrawLabel('')
      setTicketPrice('100')
      setSeriesNumber('1')
      setSeriesLetter('A')
      setStartingSequence('10001')
      setEndingSequence('99999')

      await queryClient.invalidateQueries({
        queryKey: ['draws', 'current'],
      })
    } catch (error) {
      console.error('Failed to create draw:', error)

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            status?: number
            data?: unknown
          }
        }

        const responseData = axiosError.response?.data

        setCreateMessage(
          typeof responseData === 'string'
            ? responseData
            : 'Failed to create draw.',
        )
      } else {
        setCreateMessage('Failed to create draw.')
      }
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Lottery Management
          </p>

          <h1 className="text-3xl font-bold tracking-tight">Draws</h1>

          <p className="mt-1 text-muted-foreground">
            Create, configure, and control DEAR 6 lottery draws.
          </p>
        </div>

        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Plus className="size-5" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">Create Draw</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure the draw identity, ticket price, series, and ticket
                sequence.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Field
              id="drawidentity"
              label="Draw ID"
              value={drawId}
              onChange={setDrawId}
              placeholder="004"
            />

            <Field
              id="drawlabel"
              label="Draw Label"
              value={drawLabel}
              onChange={setDrawLabel}
              placeholder="Today's Draw · 8:00 PM"
            />

            <Field
              id="ticks"
              label="Ticket Price"
              value={ticketPrice}
              onChange={setTicketPrice}
              type="number"
              min="1"
            />

            <Field
              id="sernum"
              label="Series Number"
              value={seriesNumber}
              onChange={setSeriesNumber}
              type="number"
              min="1"
            />

            <Field
              id="serlet"
              label="Series Letter"
              value={seriesLetter}
              onChange={(value) =>
                setSeriesLetter(value.slice(0, 1).toUpperCase())
              }
              maxLength={1}
              placeholder="A"
            />

            <Field
              id="strseq"
              label="Starting Sequence"
              value={startingSequence}
              onChange={setStartingSequence}
              type="number"
              min="1"
            />

            <Field
              id="enseq"
              label="Ending Sequence"
              value={endingSequence}
              onChange={setEndingSequence}
              type="number"
              min="1"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-t pt-6">
            <button
              type="button"
              onClick={handleCreateDraw}
              disabled={createLoading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-4" />
              {createLoading ? 'Creating...' : 'Create Draw'}
            </button>

            {createMessage && (
              <p className="text-sm text-muted-foreground">
                {createMessage}
              </p>
            )}
          </div>
        </section>

        <div className="mt-8">
          {isLoading ? (
            <div className="rounded-xl border bg-card p-8 shadow-sm">
              <p className="text-muted-foreground">
                Loading current draw...
              </p>
            </div>
          ) : currentDraw ? (
            <div className="space-y-6">
              <section className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Current Draw
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      Draw {currentDraw.id}
                    </h2>

                    <p className="mt-1 text-muted-foreground">
                      {currentDraw.label}
                    </p>
                  </div>

                  <StatusBadge status={currentDraw.status} />
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Detail
                    label="Ticket Price"
                    value={`₹${currentDraw.ticketPrice.toLocaleString(
                      'en-IN',
                    )}`}
                  />

                  <Detail
                    label="Series"
                    value={`${currentDraw.seriesNumber}${currentDraw.seriesLetter}`}
                  />

                  <Detail
                    label="Starting Sequence"
                    value={currentDraw.startingSequence.toLocaleString(
                      'en-IN',
                    )}
                  />

                  <Detail
                    label="Ending Sequence"
                    value={currentDraw.endingSequence.toLocaleString(
                      'en-IN',
                    )}
                  />
                </div>

                <div className="mt-8 border-t pt-6">
                  <p className="mb-3 text-sm font-medium">
                    Draw Controls
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <ActionButton
                      icon={Lock}
                      onClick={handleLockDraw}
                      disabled={currentDraw.status !== 'OPEN'}
                    >
                      Lock Draw
                    </ActionButton>

                    <ActionButton
                      icon={CirclePlay}
                      onClick={handleStartDraw}
                      disabled={currentDraw.status !== 'LOCKED'}
                    >
                      Start Draw
                    </ActionButton>

                    <ActionButton
                      icon={Trophy}
                      onClick={handleExecuteDraw}
                      disabled={currentDraw.status !== 'DRAWING'}
                    >
                      Execute Draw
                    </ActionButton>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Trophy className="size-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold">
                      Prize Configuration
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Configure the first prize for Draw {currentDraw.id}.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex max-w-lg flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label
                      htmlFor="prize-amount"
                      className="mb-2 block text-sm font-medium"
                    >
                      First Prize Amount
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>

                      <input
                        id="prize-amount"
                        type="number"
                        min="1"
                        value={prizeAmount}
                        onChange={(event) =>
                          setPrizeAmount(event.target.value)
                        }
                        className="w-full rounded-md border bg-background py-2 pl-8 pr-3 outline-none transition focus:ring-2"
                        placeholder="10000"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfigurePrize}
                    disabled={prizeLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 className="size-4" />
                    {prizeLoading ? 'Saving...' : 'Configure Prize'}
                  </button>
                </div>

                {prizeMessage && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {prizeMessage}
                  </p>
                )}
              </section>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-card p-10 text-center shadow-sm">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Trophy className="size-6" />
              </div>

              <h2 className="mt-4 text-xl font-semibold">
                No Active Draw
              </h2>

              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Create a new draw above to make it the current draw.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  maxLength,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  min?: string
  maxLength?: number
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        min={min}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border bg-background px-3 py-2 outline-none transition focus:ring-2"
      />
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

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border bg-primary/5 px-3 py-1 text-sm font-medium">
      {status}
    </span>
  )
}

function ActionButton({
  children,
  icon: Icon,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  icon: typeof Lock
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon className="size-4" />
      {children}
    </button>
  )
}