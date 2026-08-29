import { useEffect } from 'react'

import { MediaStage } from '@/components/MediaStage'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Apod } from '@/lib/apod'
import { formatDisplayDate } from '@/lib/today'

type ApodDialogProps = {
  items: Apod[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}

export function ApodDialog({ items, index, onIndexChange, onClose }: ApodDialogProps) {
  const apod = items[index]
  const slideshow = items.length > 1

  useEffect(() => {
    if (!slideshow || !apod) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'ArrowRight' && index < items.length - 1) onIndexChange(index + 1)
      if (event.key === 'ArrowLeft' && index > 0) onIndexChange(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [apod, index, items.length, onIndexChange, slideshow])

  async function copyLink() {
    if (!apod) return
    await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}`)
  }

  return (
    <Dialog
      open={Boolean(apod)}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl md:max-w-5xl lg:max-w-6xl"
        showCloseButton
      >
        {apod ? (
          <>
            <DialogHeader className="shrink-0 border-b px-4 pt-4 pr-12 pb-3">
              <DialogTitle className="font-heading text-2xl leading-tight">
                {apod.title}
              </DialogTitle>
              <DialogDescription>
                {formatDisplayDate(apod.date)}
                {slideshow ? ` · ${index + 1} of ${items.length}` : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:overflow-hidden">
              <div className="flex min-h-0 flex-col gap-4 md:h-full md:flex-row md:items-stretch md:gap-6">
                <MediaStage
                  key={`${apod.date}-${apod.url}`}
                  apod={apod}
                  loading={false}
                  className="min-h-0 min-w-0 md:h-full md:w-1/2"
                  mediaClassName="max-h-[min(70dvh,calc(90dvh-14.5rem))]"
                />
                <p className="min-h-0 font-serif text-base leading-7 md:h-full md:flex-1 md:overflow-y-auto">
                  {apod.explanation}
                </p>
              </div>
            </div>
            <DialogFooter className="mx-0 mb-0 shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              {slideshow ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    className="rounded-md"
                    disabled={index === 0}
                    onClick={() => onIndexChange(index - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    className="rounded-md"
                    disabled={index === items.length - 1}
                    onClick={() => onIndexChange(index + 1)}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
