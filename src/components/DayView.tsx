import { CalendarDays } from 'lucide-react'

import { ApodCard } from '@/components/ApodCard'
import { Button } from '@/components/ui/button'
import type { Apod } from '@/lib/apod'
import { requestErrorMessage, type ApodRequestError } from '@/lib/client'

type DayViewProps = {
  apod: Apod | null
  loading: boolean
  dimmed: boolean
  error: ApodRequestError | null
  onOpen: (apod: Apod) => void
  onBackToToday: () => void
}

export function DayView({ apod, loading, dimmed, error, onOpen, onBackToToday }: DayViewProps) {
  const firstLoad = loading && !apod && !error

  if (error?.code === 'not-found' && !apod) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-serif text-lg text-foreground" role="alert">
          {requestErrorMessage(error)}
        </p>
        <div className="flex gap-2">
          <Button type="button" onClick={onBackToToday}>
            <CalendarDays data-icon="inline-start" aria-hidden />
            Back to Today
          </Button>
        </div>
      </div>
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
