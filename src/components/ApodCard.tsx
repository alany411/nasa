import { ImageIcon, Info, Video } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import type { Apod } from '@/lib/apod'
import { formatDisplayDate } from '@/lib/today'
import { cn } from '@/lib/utils'

type ApodCardProps = {
  apod?: Apod
  loading?: boolean
  size?: 'hero' | 'grid'
  onOpen?: (apod: Apod) => void
}

export function ApodCard({ apod, loading = false, size = 'grid', onOpen }: ApodCardProps) {
  const hero = size === 'hero'
  const frame = hero ? 'aspect-[4/5] md:aspect-[16/10] md:min-h-[28rem]' : 'aspect-[3/4]'

  if (loading || !apod) {
    return <Skeleton className={cn('w-full rounded-xl', frame)} />
  }

  const thumb = apod.mediaType === 'video' ? apod.thumbnailUrl : apod.url
  const kind = apod.mediaType === 'video' ? 'Video' : apod.mediaType === 'image' ? 'Image' : 'Other'
  const KindIcon = apod.mediaType === 'video' ? Video : ImageIcon
  return (
    <button
      type="button"
      aria-label={`More info: ${apod.title}, ${formatDisplayDate(apod.date)}, ${kind}`}
      className={cn(
        'relative block w-full overflow-hidden rounded-xl bg-muted text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        frame,
      )}
      onClick={() => onOpen?.(apod)}
    >
      {thumb ? (
        <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div
        className={cn(
          'absolute inset-x-0 top-0 flex flex-col gap-1 bg-gradient-to-b from-black/80 via-black/45 to-transparent',
          hero ? 'px-5 pt-5 pb-16 md:px-7 md:pt-7 md:pb-20' : 'px-4 pt-4 pb-12',
        )}
      >
        <span
          className={cn(
            'font-heading text-balance text-white',
            hero ? 'text-3xl leading-tight md:text-5xl' : 'text-lg leading-6',
          )}
        >
          {apod.title}
        </span>
        <p
          className={cn(
            'inline-flex items-center gap-1.5 text-white/85',
            hero ? 'text-sm' : 'text-xs',
          )}
        >
          {formatDisplayDate(apod.date)}
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <KindIcon className={hero ? 'size-3.5' : 'size-3'} aria-hidden />
            {kind}
          </span>
        </p>
      </div>
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/80 via-black/45 to-transparent',
          hero ? 'px-5 pt-16 pb-5 md:px-7 md:pt-20 md:pb-7' : 'px-4 pt-12 pb-4',
        )}
      >
        {apod.copyright ? (
          <p className="min-w-0 truncate text-xs text-white/80">© {apod.copyright}</p>
        ) : null}
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-neutral-950">
          <Info className="size-3.5" aria-hidden />
          More Info
        </span>
      </div>
    </button>
  )
}
