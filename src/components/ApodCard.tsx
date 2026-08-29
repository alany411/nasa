import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Apod } from '@/lib/apod'
import { formatDisplayDate } from '@/lib/today'
import { cn } from '@/lib/utils'

type ApodCardProps = {
  apod?: Apod
  loading?: boolean
  onOpen?: (date: string) => void
}

export function ApodCard({ apod, loading = false, onOpen }: ApodCardProps) {
  if (loading || !apod) {
    return (
      <Card size="sm" className="rounded-md ring-border">
        <Skeleton className="aspect-[3/2] w-full rounded-none" />
        <CardContent className="gap-1 px-2.5 pt-2 pb-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-28" />
        </CardContent>
      </Card>
    )
  }

  const thumb = apod.mediaType === 'video' ? (apod.thumbnailUrl ?? apod.url) : apod.url

  return (
    <button type="button" className="text-left" onClick={() => onOpen?.(apod.date)}>
      <Card size="sm" className="rounded-md ring-border transition-colors hover:bg-accent/40">
        <div className="relative aspect-[3/2] overflow-hidden bg-muted">
          <img src={thumb} alt="" className="h-full w-full object-cover" />
          {apod.mediaType === 'video' ? (
            <span className="absolute top-2 left-2 rounded-md bg-card px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary">
              VIDEO
            </span>
          ) : null}
        </div>
        <CardContent className={cn('gap-1 px-2.5 pt-2 pb-3')}>
          <p className="text-xs text-primary">{formatDisplayDate(apod.date)}</p>
          <p className="font-heading text-base leading-5">{apod.title}</p>
        </CardContent>
      </Card>
    </button>
  )
}
