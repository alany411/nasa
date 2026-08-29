import { CalendarDays, RotateCw } from 'lucide-react'

import { ApodCard } from '@/components/ApodCard'
import { Button } from '@/components/ui/button'
import type { Apod } from '@/lib/apod'
import type { ApodRequestError } from '@/lib/client'

type DayViewProps = {
  apod: Apod | null
  loading: boolean
  dimmed: boolean
  error: ApodRequestError | null
  onOpen: (apod: Apod) => void
  onRetry: () => void
  onBackToToday: () => void
}

export function DayView({
  apod,
  loading,
  dimmed,
  error,
  onOpen,
  onBackToToday,
  onRetry,
}: DayViewProps) {
  const firstLoad = loading && !apod && !error

  if (error && !apod) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-serif text-lg text-foreground">{errorMessage(error)}</p>
        <div className="flex gap-2">
          {error.code === 'not-found' ? (
            <Button type="button" onClick={onBackToToday}>
              <CalendarDays data-icon="inline-start" />
              Back to Today
            </Button>
          ) : (
            <Button type="button" onClick={onRetry}>
              <RotateCw data-icon="inline-start" />
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={dimmed ? 'opacity-40' : undefined}>
      <ApodCard size="hero" apod={apod ?? undefined} loading={firstLoad} onOpen={onOpen} />
    </div>
  )
}

function errorMessage(error: ApodRequestError): string {
  if (error.code === 'forbidden') return 'This API key is not accepted.'
  if (error.code === 'rate-limited') return 'NASA is rate-limiting this key. Wait and retry.'
  if (error.code === 'not-found') return 'No APOD for this date.'
  if (error.code === 'network') return 'The network request failed.'
  return error.message
}
