import { ApodCard } from '@/components/ApodCard'
import type { Apod } from '@/lib/apod'
import { formatDisplayDate } from '@/lib/today'

type RangeStripProps = {
  start: string
  end: string
  items: Apod[]
  loading: boolean
  expectedCount: number
  onOpen: (apod: Apod, items: Apod[]) => void
}

export function RangeStrip({
  start,
  end,
  items,
  loading,
  expectedCount,
  onOpen,
}: RangeStripProps) {
  const placeholders = Array.from({ length: expectedCount }, (_, index) => index)

  return (
    <section className="flex flex-col gap-4">
      <p className="text-[13px] font-medium text-primary">
        {formatDisplayDate(start)} → {formatDisplayDate(end)} · {expectedCount} APODs in date order
        · click a card to read it
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {loading
          ? placeholders.map((key) => <ApodCard key={key} loading />)
          : items.map((apod) => (
              <ApodCard key={apod.date} apod={apod} onOpen={(item) => onOpen(item, items)} />
            ))}
      </div>
    </section>
  )
}
