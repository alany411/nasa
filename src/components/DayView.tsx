import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MediaStage } from '@/components/MediaStage'
import type { Apod } from '@/lib/apod'
import type { ApodRequestError } from '@/lib/client'
import { canStepNext, canStepPrevious } from '@/lib/mode'
import { formatDisplayDate, todayInNewYork } from '@/lib/today'

type DayViewProps = {
  apod: Apod | null
  loading: boolean
  dimmed: boolean
  error: ApodRequestError | null
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
  onPrevious,
  onNext,
  onBackToToday,
  onRetry,
}: DayViewProps) {
  const today = todayInNewYork()
  const date = apod?.date
  const firstLoad = loading && !apod && !error

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href)
  }

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
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="lg:w-[58%]">
        <MediaStage apod={apod} loading={firstLoad} dimmed={dimmed} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
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

        {firstLoad ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[86%]" />
          </div>
        ) : apod ? (
          <>
            <h1 className="font-heading text-3xl leading-tight text-balance md:text-4xl">
              {apod.title}
            </h1>
            <p className="font-serif text-lg leading-7">{apod.explanation}</p>
            <div className="flex flex-wrap gap-2">
              {apod.hdUrl ? (
                <a
                  href={apod.hdUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center rounded-md border border-primary px-2.5 text-sm font-medium text-primary hover:bg-accent"
                >
                  Open HD
                </a>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="rounded-md"
                onClick={() => void copyLink()}
              >
                Copy link
              </Button>
            </div>
          </>
        ) : null}
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
