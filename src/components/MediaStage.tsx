import { useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { videoEmbedUrl } from '@/lib/embed'
import type { Apod } from '@/lib/apod'
import { cn } from '@/lib/utils'

type MediaStageProps = {
  apod: Apod | null
  loading: boolean
  dimmed?: boolean
}

export function MediaStage({ apod, loading, dimmed = false }: MediaStageProps) {
  const [mediaFailed, setMediaFailed] = useState(false)

  if (loading && !apod) {
    return <Skeleton className="aspect-[4/3] w-full rounded-md md:min-h-[28rem]" />
  }

  if (!apod) return null

  const embed = apod.mediaType === 'video' ? videoEmbedUrl(apod.url) : null
  const poster = apod.thumbnailUrl ?? apod.url

  return (
    <div className={cn('flex flex-col gap-2.5', dimmed && 'opacity-40')}>
      <div className="relative overflow-hidden rounded-md bg-muted">
        {mediaFailed ? (
          <div className="flex aspect-[4/3] min-h-60 flex-col items-center justify-center gap-1 px-6 text-center md:min-h-[28rem]">
            <p className="text-sm font-semibold text-primary">Media failed to load</p>
            <p className="text-xs text-muted-foreground">
              The explanation stays. Retry the file, not the day.
            </p>
          </div>
        ) : embed ? (
          <div className="relative aspect-[4/3] md:min-h-[28rem]">
            <span className="absolute top-4 left-4 z-10 rounded-md bg-card px-2.5 py-1 text-xs font-semibold tracking-wide text-primary">
              VIDEO
            </span>
            <iframe
              title={apod.title}
              src={embed}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : apod.mediaType === 'video' ? (
          <a href={apod.url} target="_blank" rel="noreferrer" className="block">
            <img
              src={poster}
              alt=""
              className="aspect-[4/3] w-full object-cover md:min-h-[28rem]"
              onError={() => setMediaFailed(true)}
            />
            <span className="absolute top-4 left-4 rounded-md bg-card px-2.5 py-1 text-xs font-semibold text-primary">
              VIDEO
            </span>
          </a>
        ) : (
          <img
            src={apod.url}
            alt={apod.title}
            className="aspect-[4/3] w-full object-cover md:min-h-[28rem]"
            onError={() => setMediaFailed(true)}
          />
        )}
      </div>
      {apod.copyright ? (
        <p className="text-xs text-muted-foreground">Copyright · {apod.copyright}</p>
      ) : apod.mediaType === 'video' ? (
        <p className="text-xs text-muted-foreground">Video · NASA APOD</p>
      ) : null}
    </div>
  )
}
