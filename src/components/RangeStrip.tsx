import { ApodCard } from '@/components/ApodCard'
import type { Apod } from '@/lib/apod'

type RangeStripProps = {
  items: Apod[]
  loading: boolean
  expectedCount: number
  onOpen: (apod: Apod, items: Apod[]) => void
}

export function RangeStrip({ items, loading, expectedCount, onOpen }: RangeStripProps) {
  const placeholders = Array.from({ length: expectedCount }, (_, index) => index)

  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {loading
        ? placeholders.map((key) => <ApodCard key={key} loading />)
        : items.map((apod) => (
            <ApodCard key={apod.date} apod={apod} onOpen={(item) => onOpen(item, items)} />
          ))}
    </section>
  )
}
