import { useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { videoEmbedUrl } from '@/lib/embed'
import type { Apod } from '@/lib/apod'
import { cn } from '@/lib/utils'

type MediaStageProps = {
  apod: Apod | null
  loading: boolean
  dimmed?: boolean
  className?: string
  mediaClassName?: string
}

export function MediaStage({
  apod,
  loading,
  dimmed = false,
  className,
  mediaClassName,
}: MediaStageProps) {
  const [mediaFailed, setMediaFailed] = useState(false)

  if (loading && !apod) {
    return <Skeleton className="aspect-video w-full rounded-md" />
  }

  if (!apod) return null

  const embed = apod.mediaType === 'video' ? videoEmbedUrl(apod.url) : null
  const poster = apod.thumbnailUrl ?? apod.url

  return (
    <div className={cn('flex min-h-0 flex-col justify-start', dimmed && 'opacity-40', className)}>
      <div className="flex min-h-0 flex-col gap-2.5">
        <div className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-md bg-muted">
          {mediaFailed ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-1 px-6 py-10 text-center">
              <p className="text-sm font-semibold text-primary">Media failed to load</p>
              <p className="text-xs text-muted-foreground">
                The explanation stays. Retry the file, not the day.
              </p>
            </div>
          ) : embed ? (
            <div className={cn('relative aspect-video w-full', mediaClassName)}>
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
            <a href={apod.url} target="_blank" rel="noreferrer" className="relative block">
              <img
                src={poster}
                alt=""
                className={cn(
                  'mx-auto max-h-[70dvh] w-auto max-w-full object-contain',
                  mediaClassName,
                )}
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
              className={cn(
                'mx-auto max-h-[70dvh] w-auto max-w-full object-contain',
                mediaClassName,
              )}
              onError={() => setMediaFailed(true)}
            />
          )}
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          Copyright · {apod.copyright ?? 'N/A'}
        </p>
      </div>
    </div>
  )
}
