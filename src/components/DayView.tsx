import { CalendarDays } from 'lucide-react'

import { ApodCard } from '@/components/ApodCard'
import { RequestError } from '@/components/RequestError'
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
  onRetry,
  onBackToToday,
}: DayViewProps) {
  const firstLoad = loading && !apod && !error

  if (error && !apod) {
    return (
      <RequestError
        error={error}
        onRetry={error.code === 'not-found' ? undefined : onRetry}
        extra={
          error.code === 'not-found' ? (
            <Button type="button" onClick={onBackToToday}>
              <CalendarDays data-icon="inline-start" aria-hidden />
              Back to Today
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className={dimmed ? 'opacity-40' : undefined} aria-busy={dimmed || firstLoad || undefined}>
      {firstLoad ? (
        <p className="sr-only" role="status">
          Loading
        </p>
      ) : null}
      <ApodCard size="hero" apod={apod ?? undefined} loading={firstLoad} onOpen={onOpen} />
    </div>
  )
}
