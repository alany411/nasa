import { ApodCard } from '@/components/ApodCard'
import type { Apod } from '@/lib/apod'
import { formatDisplayDate } from '@/lib/today'

type RangeStripProps = {
  start: string
  end: string
  items: Apod[]
  loading: boolean
  expectedCount: number
  onOpen: (date: string) => void
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
        · click a card to open that Day
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {loading
          ? placeholders.map((key) => <ApodCard key={key} loading />)
          : items.map((apod) => <ApodCard key={apod.date} apod={apod} onOpen={onOpen} />)}
      </div>
    </section>
  )
}
