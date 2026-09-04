import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
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
    if (!drawId || !drawLabel) {
      setCreateMessage('Draw ID and label are required.')
      return
    }

    setCreateLoading(true)
    setCreateMessage('')

    try {
      await api.post('/draws', {
        id: drawId,
        label: drawLabel,
        ticketPrice: Number(ticketPrice),
        seriesNumber: Number(seriesNumber),
        seriesLetter,
        startingSequence: Number(startingSequence),
        endingSequence: Number(endingSequence),
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
    <div className="min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Draws</h1>
        <p className="mt-1 text-muted-foreground">Manage lottery draws.</p>
      </div>

      {/* Create Draw */}
      <div className="mb-8 rounded-lg border p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Create Draw</h2>
          <p className="text-sm text-muted-foreground">
            Create a new lottery draw.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="drawidentity"
              className="mb-1 block text-sm font-medium"
            >
              Draw ID
            </label>

            <input
              id="drawidentity"
              value={drawId}
              onChange={(e) => setDrawId(e.target.value)}
              placeholder="004"
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="drawlabel"
              className="mb-1 block text-sm font-medium"
            >
              Label
            </label>

            <input
              id="drawlabel"
              value={drawLabel}
              onChange={(e) => setDrawLabel(e.target.value)}
              placeholder="Today's Draw · 8:00 PM"
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="ticks" className="mb-1 block text-sm font-medium">
              Ticket Price
            </label>

            <input
              id="ticks"
              type="number"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="sernum" className="mb-1 block text-sm font-medium">
              Series Number
            </label>

            <input
              id="sernum"
              type="number"
              value={seriesNumber}
              onChange={(e) => setSeriesNumber(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="serlet" className="mb-1 block text-sm font-medium">
              Series Letter
            </label>

            <input
              id="serlet"
              value={seriesLetter}
              onChange={(e) => setSeriesLetter(e.target.value)}
              maxLength={1}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="strseq" className="mb-1 block text-sm font-medium">
              Starting Sequence
            </label>

            <input
              id="strseq"
              type="number"
              value={startingSequence}
              onChange={(e) => setStartingSequence(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="enseq" className="mb-1 block text-sm font-medium">
              Ending Sequence
            </label>

            <input
              id="enseq"
              type="number"
              value={endingSequence}
              onChange={(e) => setEndingSequence(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={handleCreateDraw}
            disabled={createLoading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {createLoading ? 'Creating...' : 'Create Draw'}
          </button>

          {createMessage && (
            <p className="text-sm text-muted-foreground">{createMessage}</p>
          )}
        </div>
      </div>

      {/* Current Draw */}
      {isLoading ? (
        <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-muted-foreground">Loading current draw...</p>
        </div>
      ) : currentDraw ? (
        <>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Draw</p>

                <h2 className="mt-1 text-2xl font-bold">
                  Draw {currentDraw.id}
                </h2>

                <p className="mt-1 text-muted-foreground">
                  {currentDraw.label}
                </p>
              </div>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">
                {currentDraw.status}
              </span>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Price</p>

                <p className="mt-1 text-lg font-semibold">
                  ₹{currentDraw.ticketPrice}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Series</p>

                <p className="mt-1 text-lg font-semibold">
                  {currentDraw.seriesNumber}
                  {currentDraw.seriesLetter}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Starting Sequence
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {currentDraw.startingSequence}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Ending Sequence</p>

                <p className="mt-1 text-lg font-semibold">
                  {currentDraw.endingSequence}
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3 border-t pt-6">
              <button
                type="button"
                onClick={handleLockDraw}
                disabled={currentDraw.status !== 'OPEN'}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Lock Draw
              </button>

              <button
                type="button"
                onClick={handleStartDraw}
                disabled={currentDraw.status !== 'LOCKED'}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start Draw
              </button>

              <button
                type="button"
                onClick={handleExecuteDraw}
                disabled={currentDraw.status !== 'DRAWING'}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Execute Draw
              </button>
            </div>
          </div>

          {/* Prize Configuration */}
          <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold">Prize Configuration</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Configure the first prize for this draw.
              </p>
            </div>

            <div className="mt-6 flex max-w-md gap-3">
              <div className="flex-1">
                <label htmlFor="PrizeNumber" className="text-sm font-medium">
                  First Prize Amount
                </label>

                <input
                  id="PrizeNumber"
                  type="number"
                  min="1"
                  value={prizeAmount}
                  onChange={(event) => setPrizeAmount(event.target.value)}
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2"
                  placeholder="10000"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleConfigurePrize}
                  disabled={prizeLoading}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prizeLoading ? 'Saving...' : 'Configure Prize'}
                </button>
              </div>
            </div>

            {prizeMessage && (
              <p className="mt-4 text-sm text-muted-foreground">
                {prizeMessage}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">No Active Draw</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Create a new draw above to make it the current draw.
          </p>
        </div>
      )}
    </div>
  )
}
