import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { AppHeader } from '@/components/AppHeader'
import { DayView } from '@/components/DayView'
import { QueryBar } from '@/components/QueryBar'
import { SurpriseGrid } from '@/components/SurpriseGrid'
import { RangeStrip } from '@/components/RangeStrip'
import type { Apod } from '@/lib/apod'
import { ApodRequestError, fetchDay, fetchSurprise, fetchRange } from '@/lib/client'
import {
  parseModeFromSearch,
  rememberedDefaults,
  searchFromMode,
  stepDay,
  validateMode,
  type ViewerMode,
} from '@/lib/mode'
import { addCalendarDays, inclusiveDayCount, todayInNewYork } from '@/lib/today'

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
  const initial = parseModeFromSearch(window.location.search, today)
  const [mode, setMode] = useState<ViewerMode>(initial)
  const [memory, setMemory] = useState<Record<ViewerMode['kind'], ViewerMode>>({
    day: initial.kind === 'day' ? initial : rememberedDefaults('day', today),
    window: initial.kind === 'range' ? initial : rememberedDefaults('range', today),
    sample: initial.kind === 'surprise' ? initial : rememberedDefaults('surprise', today),
  })
  const [dayApod, setDayApod] = useState<Apod | null>(null)
  const [collection, setCollection] = useState<Apod[]>([])
  const [loading, setLoading] = useState(false)
  const [dimmed, setDimmed] = useState(false)
  const [requestError, setRequestError] = useState<ApodRequestError | null>(null)
  const [shownRange, setShownRange] = useState<{ start: string; end: string } | null>(
    initial.kind === 'range' ? { start: initial.start, end: initial.end } : null,
  )
  const [shownSurprise, setShownSurprise] = useState<number | null>(
    initial.kind === 'surprise' ? initial.count : null,
  )
  const requestId = useRef(0)

  const formError = useMemo(() => validateMode(mode, today), [mode, today])

  function writeUrl(next: ViewerMode, replace = false) {
    const nextUrl = `${window.location.pathname}${searchFromMode(next, today)}`
    if (replace) window.history.replaceState(next, '', nextUrl)
    else window.history.pushState(next, '', nextUrl)
  }

  function remember(next: ViewerMode) {
    setMode(next)
    setMemory((current) => ({ ...current, [next.kind]: next }))
  }

  function applyMode(next: ViewerMode, replace = false) {
    remember(next)
    writeUrl(next, replace)
  }

  function onKindChange(kind: ViewerMode['kind']) {
    const next = memory[kind] ?? rememberedDefaults(kind, today)
    remember(next)
    if (kind === 'day') writeUrl(next)
    else window.history.pushState(next, '', window.location.pathname)
  }

  function onDraftChange(next: ViewerMode) {
    remember(next)
    if (next.kind === 'day') writeUrl(next)
  }

  const hasDayApod = useRef(false)
  useEffect(() => {
    hasDayApod.current = Boolean(dayApod)
  }, [dayApod])

  const loadDay = useCallback(
    async (date: string, keepCurrent: boolean) => {
      const id = ++requestId.current
      setRequestError(null)
      setLoading(true)
      setDimmed(keepCurrent)
      try {
        const apod = await fetchDay(date)
        if (id !== requestId.current) return
        setDayApod(apod)
      } catch (error) {
        if (id !== requestId.current) return
        if (error instanceof ApodRequestError && error.code === 'not-found' && date === today) {
          const yesterday = addCalendarDays(today, -1)
          setMode({ kind: 'day', date: yesterday })
          setMemory((current) => ({ ...current, day: { kind: 'day', date: yesterday } }))
          const nextUrl = `${window.location.pathname}${searchFromMode({ kind: 'day', date: yesterday }, today)}`
          window.history.replaceState({ kind: 'day', date: yesterday }, '', nextUrl)
          return
        }
        if (!keepCurrent) setDayApod(null)
        setRequestError(
          error instanceof ApodRequestError
            ? error
            : new ApodRequestError('Unknown error', 0, 'unknown'),
        )
      } finally {
        if (id === requestId.current) {
          setLoading(false)
          setDimmed(false)
        }
      }
    },
    [today],
  )

  const loadWindow = useCallback(async (start: string, end: string) => {
    const id = ++requestId.current
    setRequestError(null)
    setLoading(true)
    setCollection([])
    try {
      const items = await fetchRange(start, end)
      if (id !== requestId.current) return
      setCollection(items)
      setShownRange({ start, end })
    } catch (error) {
      if (id !== requestId.current) return
      setRequestError(
        error instanceof ApodRequestError
          ? error
          : new ApodRequestError('Unknown error', 0, 'unknown'),
      )
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  const loadSample = useCallback(async (count: number) => {
    const id = ++requestId.current
    setRequestError(null)
    setLoading(true)
    setCollection([])
    try {
      const items = await fetchSurprise(count)
      if (id !== requestId.current) return
      setCollection(items)
      setShownSurprise(count)
    } catch (error) {
      if (id !== requestId.current) return
      setRequestError(
        error instanceof ApodRequestError
          ? error
          : new ApodRequestError('Unknown error', 0, 'unknown'),
      )
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    function onPop() {
      const next = parseModeFromSearch(window.location.search, today)
      setMode(next)
      setMemory((current) => ({ ...current, [next.kind]: next }))
      const error = validateMode(next, today)
      if (error) return
      if (next.kind === 'range') void loadWindow(next.start, next.end)
      if (next.kind === 'surprise') void loadSample(next.count)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [loadSample, loadWindow, today])

  const dayDate = mode.kind === 'day' ? mode.date : null

  useEffect(() => {
    if (!dayDate || formError) return
    void loadDay(dayDate, hasDayApod.current)
  }, [dayDate, formError, loadDay])

  useEffect(() => {
    const parsed = parseModeFromSearch(window.location.search, today)
    const error = validateMode(parsed, today)
    if (error) return
    if (parsed.kind === 'range') void loadWindow(parsed.start, parsed.end)
    if (parsed.kind === 'surprise') void loadSample(parsed.count)
  }, [loadSample, loadWindow, today])

  function openDay(date: string) {
    applyMode({ kind: 'day', date })
  }

  return (
    <div className="min-h-svh bg-background px-4 py-6 md:px-12 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <AppHeader kicker={kickerFor(mode)} />
        <QueryBar
          mode={mode}
          error={formError}
          onKindChange={onKindChange}
          onModeChange={onDraftChange}
          onShowRange={() => {
            if (mode.kind !== 'range' || formError) return
            writeUrl(mode)
            void loadWindow(mode.start, mode.end)
          }}
          onSurprise={() => {
            if (mode.kind !== 'surprise' || formError) return
            writeUrl(mode)
            void loadSample(mode.count)
          }}
        />

        {mode.kind === 'day' ? (
          <DayView
            apod={dayApod}
            loading={loading}
            dimmed={dimmed}
            error={requestError}
            onPrevious={() => {
              if (mode.kind !== 'day') return
              applyMode({ kind: 'day', date: stepDay(mode.date, -1, today) })
            }}
            onNext={() => {
              if (mode.kind !== 'day') return
              applyMode({ kind: 'day', date: stepDay(mode.date, 1, today) })
            }}
            onRetry={() => {
              if (mode.kind === 'day') void loadDay(mode.date, Boolean(dayApod))
            }}
            onBackToToday={() => applyMode({ kind: 'day', date: today })}
          />
        ) : null}

        {mode.kind === 'range' && (shownRange || loading) && !formError ? (
          <RangeStrip
            start={shownRange?.start ?? mode.start}
            end={shownRange?.end ?? mode.end}
            items={collection}
            loading={loading}
            expectedCount={inclusiveDayCount(
              shownRange?.start ?? mode.start,
              shownRange?.end ?? mode.end,
            )}
            onOpen={openDay}
          />
        ) : null}

        {mode.kind === 'surprise' && (shownSurprise !== null || loading) && !formError ? (
          <SurpriseGrid
            items={collection}
            loading={loading}
            expectedCount={shownSurprise ?? mode.count}
            onOpen={openDay}
          />
        ) : null}

        {requestError && mode.kind !== 'day' ? (
          <p className="text-sm text-destructive">
            {requestError.code === 'forbidden'
              ? 'This API key is not accepted.'
              : requestError.code === 'rate-limited'
                ? 'NASA is rate-limiting this key. Wait and retry.'
                : requestError.message}
          </p>
        ) : null}
      </div>
    </div>
  )
}
