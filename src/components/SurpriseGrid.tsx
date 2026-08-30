import { ApodCard } from '@/components/ApodCard'
import { RequestError } from '@/components/RequestError'
import type { Apod } from '@/lib/apod'
import type { ApodRequestError } from '@/lib/client'

type SurpriseGridProps = {
  items: Apod[]
  loading: boolean
  expectedCount: number
  error: ApodRequestError | null
  onRetry: () => void
  onOpen: (apod: Apod, items: Apod[]) => void
}

export function SurpriseGrid({
  items,
  loading,
  expectedCount,
  error,
  onRetry,
  onOpen,
}: SurpriseGridProps) {
  const placeholders = Array.from({ length: expectedCount }, (_, index) => index)

  if (error && !loading) {
    return (
      <section aria-label="Surprise">
        <RequestError error={error} onRetry={onRetry} />
      </section>
    )
  }

  return (
    <section
      aria-label="Surprise"
      aria-busy={loading || undefined}
      className="grid grid-cols-2 gap-4 md:grid-cols-3"
    >
      {loading ? (
        <>
          <p className="sr-only" role="status">
            Loading
          </p>
          {placeholders.map((key) => (
            <ApodCard key={key} loading />
          ))}
        </>
      ) : (
        items.map((apod) => (
          <ApodCard
            key={`${apod.date}-${apod.title}`}
            apod={apod}
            onOpen={(item) => onOpen(item, items)}
          />
        ))
      )}
    </section>
  )
}