import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

import { ApodDialog } from '@/components/ApodDialog'
import { AppHeader } from '@/components/AppHeader'
import { DayView } from '@/components/DayView'
import { QueryBar } from '@/components/QueryBar'
import { SurpriseGrid } from '@/components/SurpriseGrid'
import { RangeStrip } from '@/components/RangeStrip'
import type { Apod } from '@/lib/apod'
import { useDayApod, useSurpriseApods, useRangeApods } from '@/hooks/use-apod-query'
import { rememberedDefaults, stepDay, validateMode, type ViewerMode } from '@/lib/mode'
import { apodKeys } from '@/lib/query'
import { inclusiveDayCount, todayInNewYork } from '@/lib/today'

function kickerFor(mode: ViewerMode): string {
  if (mode.kind === 'day') {
    return 'NASA Astronomy Picture of the Day · Today in America/New_York'
  }
  if (mode.kind === 'range') {
    return 'NASA Astronomy Picture of the Day · A Window of consecutive days'
  }
  return 'NASA Astronomy Picture of the Day · A random Sample, not a Window'
}

export default function App() {
  const today = todayInNewYork()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<ViewerMode>(() => rememberedDefaults('day', today))
  const [memory, setMemory] = useState<Record<ViewerMode['kind'], ViewerMode>>(() => ({
    day: rememberedDefaults('day', today),
    range: rememberedDefaults('range', today),
    surprise: rememberedDefaults('surprise', today),
  }))
  const [shownRange, setShownRange] = useState<{ start: string; end: string } | null>(null)
  const [shownSurprise, setShownSurprise] = useState<number | null>(null)
  const [opened, setOpened] = useState<{ items: Apod[]; index: number } | null>(null)

  useEffect(() => {
    if (window.location.search || window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const formError = useMemo(() => validateMode(mode, today), [mode, today])
  const dayDate = mode.kind === 'day' && !formError ? mode.date : null

  const dayQuery = useDayApod(dayDate, today)
  const rangeQuery = useRangeApods(mode.kind === 'range' ? shownRange : null)
  const surpriseQuery = useSurpriseApods(mode.kind === 'surprise' ? shownSurprise : null)

  if (mode.kind === 'day' && mode.date === today && dayQuery.data && dayQuery.data.date !== today) {
    const next = { kind: 'day' as const, date: dayQuery.data.date }
    setMode(next)
    setMemory((current) => ({ ...current, day: next }))
    setOpened(null)
  }

  function remember(next: ViewerMode) {
    setMode(next)
    setMemory((current) => ({ ...current, [next.kind]: next }))
    setOpened(null)
  }

  function onKindChange(kind: ViewerMode['kind']) {
    remember(memory[kind] ?? rememberedDefaults(kind, today))
  }

  function openApod(apod: Apod, items: Apod[]) {
    const index = items.findIndex((item) => item.date === apod.date && item.title === apod.title)
    setOpened({ items, index: index === -1 ? 0 : index })
  }

  const dayApod = dayQuery.data ?? null
  const dayError = dayQuery.error ?? null
  const dayLoading = dayQuery.isFetching
  const collectionError =
    mode.kind === 'range'
      ? (rangeQuery.error ?? null)
      : mode.kind === 'surprise'
        ? (surpriseQuery.error ?? null)
        : null

  return (
    <div className="min-h-svh bg-background px-4 py-6 md:px-12 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <AppHeader kicker={kickerFor(mode)} />
        <QueryBar
          mode={mode}
          error={formError}
          onKindChange={onKindChange}
          onModeChange={remember}
          onShowRange={() => {
            if (mode.kind !== 'range' || formError) return
            setOpened(null)
            setShownRange({ start: mode.start, end: mode.end })
            void queryClient.resetQueries({ queryKey: apodKeys.range(mode.start, mode.end) })
          }}
          onSurprise={() => {
            if (mode.kind !== 'surprise' || formError) return
            setOpened(null)
            setShownSurprise(mode.count)
            void queryClient.resetQueries({ queryKey: apodKeys.surprise(mode.count) })
          }}
          onPreviousDay={() => {
            if (mode.kind !== 'day') return
            remember({ kind: 'day', date: stepDay(mode.date, -1, today) })
          }}
          onNextDay={() => {
            if (mode.kind !== 'day') return
            remember({ kind: 'day', date: stepDay(mode.date, 1, today) })
          }}
        />

        {mode.kind === 'day' ? (
          <DayView
            apod={dayApod}
            loading={dayLoading}
            dimmed={dayQuery.isFetching && Boolean(dayApod)}
            error={dayError}
            onOpen={(apod) => openApod(apod, [apod])}
            onRetry={() => {
              void dayQuery.refetch()
            }}
            onBackToToday={() => remember({ kind: 'day', date: today })}
          />
        ) : null}

        {mode.kind === 'range' && (shownRange || rangeQuery.isFetching) && !formError ? (
          <RangeStrip
            start={shownRange?.start ?? mode.start}
            end={shownRange?.end ?? mode.end}
            items={rangeQuery.data ?? []}
            loading={rangeQuery.isFetching}
            expectedCount={inclusiveDayCount(
              shownRange?.start ?? mode.start,
              shownRange?.end ?? mode.end,
            )}
            onOpen={openApod}
          />
        ) : null}

        {mode.kind === 'surprise' &&
        (shownSurprise !== null || surpriseQuery.isFetching) &&
        !formError ? (
          <SurpriseGrid
            items={surpriseQuery.data ?? []}
            loading={surpriseQuery.isFetching}
            expectedCount={shownSurprise ?? mode.count}
            onOpen={openApod}
          />
        ) : null}

        <ApodDialog
          items={opened?.items ?? []}
          index={opened?.index ?? 0}
          onIndexChange={(index) =>
            setOpened((current) => (current ? { ...current, index } : null))
          }
          onClose={() => setOpened(null)}
        />

        {collectionError && mode.kind !== 'day' ? (
          <p className="text-sm text-destructive">
            {collectionError.code === 'forbidden'
              ? 'This API key is not accepted.'
              : collectionError.code === 'rate-limited'
                ? 'NASA is rate-limiting this key. Wait and retry.'
                : collectionError.message}
          </p>
        ) : null}
      </div>
    </div>
  )
}
