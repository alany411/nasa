import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { ApodDialog } from '@/components/ApodDialog'
import { AppHeader } from '@/components/AppHeader'
import { DayView } from '@/components/DayView'
import { QueryBar } from '@/components/QueryBar'
import { SurpriseGrid } from '@/components/SurpriseGrid'
import { RangeStrip } from '@/components/RangeStrip'
import type { Apod } from '@/lib/apod'
import { useDayApod, useSurpriseApods, useRangeApods } from '@/hooks/use-apod-query'
import { useRequestErrorToast } from '@/hooks/use-request-error-toast'
import {
  defaultMemory,
  rememberMode,
  rememberedDefaults,
  SURPRISE_DEFAULT,
  stepDay,
  validateMode,
  type ModeMemory,
  type ViewerMode,
} from '@/lib/mode'
import { apodKeys } from '@/lib/query'
import { clampRange, defaultRange, inclusiveDayCount, todayInNewYork } from '@/lib/today'

export default function App() {
  const clockToday = todayInNewYork()
  const queryClient = useQueryClient()
  const [today, setToday] = useState(clockToday)
  const [mode, setMode] = useState<ViewerMode>(() => rememberedDefaults('day', clockToday))
  const [memory, setMemory] = useState<ModeMemory>(() => defaultMemory(clockToday))
  const [shownRange, setShownRange] = useState(() => defaultRange(clockToday))
  const [shownSurprise, setShownSurprise] = useState(SURPRISE_DEFAULT)
  const [opened, setOpened] = useState<{ items: Apod[]; index: number } | null>(null)

  useEffect(() => {
    if (window.location.search || window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const formError = validateMode(mode, today)
  const dayDate = mode.kind === 'day' && !formError ? mode.date : null

  const dayQuery = useDayApod(dayDate, clockToday)
  const rangeQuery = useRangeApods(shownRange)
  const surpriseQuery = useSurpriseApods(shownSurprise)
  const activeQuery =
    mode.kind === 'day' ? dayQuery : mode.kind === 'range' ? rangeQuery : surpriseQuery
  const requestError =
    activeQuery.error?.code === 'not-found' && mode.kind === 'day'
      ? null
      : (activeQuery.error ?? null)

  useRequestErrorToast(requestError, () => {
    void activeQuery.refetch()
  })

  if (
    mode.kind === 'day' &&
    mode.date === clockToday &&
    dayQuery.data &&
    dayQuery.data.date !== clockToday
  ) {
    const resolved = dayQuery.data.date
    const next = { kind: 'day' as const, date: resolved }
    const range = clampRange(memory.range, resolved)
    setToday(resolved)
    setMode(next)
    setMemory((current) => ({
      ...current,
      day: next,
      range: { kind: 'range', ...range },
    }))
    setShownRange((current) => clampRange(current, resolved))
    setOpened(null)
  }

  function remember(next: ViewerMode) {
    setMode(next)
    setMemory((current) => rememberMode(current, next))
    setOpened(null)
  }

  function onKindChange(kind: ViewerMode['kind']) {
    remember(memory[kind])
  }

  function openApod(apod: Apod, items: Apod[]) {
    const index = items.findIndex((item) => item.date === apod.date && item.title === apod.title)
    setOpened({ items, index: index === -1 ? 0 : index })
  }

  const dayApod = dayQuery.data ?? null
  const dayError = dayQuery.error ?? null
  const dayLoading = dayQuery.isFetching

  return (
    <div className="min-h-svh bg-background px-4 py-6 md:px-12 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <AppHeader />
        <QueryBar
          mode={mode}
          today={today}
          error={formError}
          busy={
            mode.kind === 'day'
              ? dayQuery.isFetching
              : mode.kind === 'range'
                ? rangeQuery.isFetching
                : surpriseQuery.isFetching
          }
          onKindChange={onKindChange}
          onModeChange={remember}
          onShowRange={() => {
            if (mode.kind !== 'range' || formError || rangeQuery.isFetching) return
            setOpened(null)
            setShownRange({ start: mode.start, end: mode.end })
            void queryClient.resetQueries({ queryKey: apodKeys.range(mode) })
          }}
          onSurprise={() => {
            if (mode.kind !== 'surprise' || formError || surpriseQuery.isFetching) return
            setOpened(null)
            setShownSurprise(mode.count)
            void queryClient.resetQueries({ queryKey: apodKeys.surprise(mode.count) })
          }}
          onPreviousDay={() => {
            if (mode.kind !== 'day' || dayQuery.isFetching) return
            remember({ kind: 'day', date: stepDay(mode.date, -1, today) })
          }}
          onNextDay={() => {
            if (mode.kind !== 'day' || dayQuery.isFetching) return
            remember({ kind: 'day', date: stepDay(mode.date, 1, today) })
          }}
        />

        <main className="flex flex-col gap-6">
          {mode.kind === 'day' ? (
            <DayView
              apod={dayApod}
              loading={dayLoading}
              dimmed={dayQuery.isFetching && Boolean(dayApod)}
              error={dayError}
              onOpen={(apod) => openApod(apod, [apod])}
              onBackToToday={() => remember({ kind: 'day', date: today })}
            />
          ) : null}

          {mode.kind === 'range' ? (
            <RangeStrip
              items={rangeQuery.data ?? []}
              loading={rangeQuery.isFetching || (Boolean(rangeQuery.error) && !rangeQuery.data)}
              expectedCount={inclusiveDayCount(shownRange.start, shownRange.end)}
              onOpen={openApod}
            />
          ) : null}

          {mode.kind === 'surprise' ? (
            <SurpriseGrid
              items={surpriseQuery.data ?? []}
              loading={
                surpriseQuery.isFetching || (Boolean(surpriseQuery.error) && !surpriseQuery.data)
              }
              expectedCount={shownSurprise}
              onOpen={openApod}
            />
          ) : null}
        </main>

        <ApodDialog
          items={opened?.items ?? []}
          index={opened?.index ?? 0}
          onIndexChange={(index) =>
            setOpened((current) => (current ? { ...current, index } : null))
          }
          onClose={() => setOpened(null)}
        />
      </div>
    </div>
  )
}
