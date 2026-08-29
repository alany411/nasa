import { ApodCard } from '@/components/ApodCard'
import { Button } from '@/components/ui/button'
import type { Apod } from '@/lib/apod'
import type { ApodRequestError } from '@/lib/client'
import { canStepNext, canStepPrevious } from '@/lib/mode'
import { formatDisplayDate, todayInNewYork } from '@/lib/today'

type DayViewProps = {
  apod: Apod | null
  loading: boolean
  dimmed: boolean
  error: ApodRequestError | null
  onOpen: (apod: Apod) => void
  onPrevious: () => void
  onNext: () => void
  onRetry: () => void
  onBackToToday: () => void
}

export function DayView({
  apod,
  loading,
  dimmed,
  error,
  onOpen,
  onPrevious,
  onNext,
  onBackToToday,
  onRetry,
}: DayViewProps) {
  const today = todayInNewYork()
  const date = apod?.date
  const firstLoad = loading && !apod && !error

  if (error && !apod) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-serif text-lg text-foreground">{errorMessage(error)}</p>
        <div className="flex gap-2">
          {error.code === 'not-found' ? (
            <Button type="button" onClick={onBackToToday}>
              Back to Today
            </Button>
          ) : (
            <Button type="button" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-md"
          disabled={!date || !canStepPrevious(date)}
          onClick={onPrevious}
        >
          Previous
        </Button>
        <p className="text-[13px] font-medium text-primary">
          {date ? formatDisplayDate(date) : formatDisplayDate(today)}
        </p>
        <Button
          type="button"
          variant="outline"
          className="rounded-md"
          disabled={!date || !canStepNext(date, today)}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
      <div className={dimmed ? 'opacity-40' : undefined}>
        <ApodCard size="hero" apod={apod ?? undefined} loading={firstLoad} onOpen={onOpen} />
      </div>
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
