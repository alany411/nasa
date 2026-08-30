import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { Apod } from '@/lib/apod'
import {
  ApodRequestError,
  fetchDay,
  fetchRange,
  fetchSurprise,
  isUnpublishedTodayError,
} from '@/lib/client'
import { apodKeys } from '@/lib/query'
import { addCalendarDays, clampRange, type DateSpan } from '@/lib/today'

async function fetchDayOrYesterday(
  date: string,
  today: string,
  remember: (date: string, apod: Apod) => void,
  signal?: AbortSignal,
): Promise<Apod> {
  try {
    return await fetchDay(date, { signal })
  } catch (error) {
    if (date === today && isUnpublishedTodayError(error)) {
      const yesterday = addCalendarDays(today, -1)
      const apod = await fetchDay(yesterday, { signal })
      remember(yesterday, apod)
      return apod
    }
    throw error
  }
}

async function fetchRangeOrUntilPublished(
  range: DateSpan,
  today: string,
  remember: (range: DateSpan, items: Apod[]) => void,
  signal?: AbortSignal,
): Promise<Apod[]> {
  try {
    return await fetchRange(range, { signal })
  } catch (error) {
    if (range.end !== today || !isUnpublishedTodayError(error)) throw error
    const yesterday = addCalendarDays(today, -1)
    const clamped = clampRange({ start: range.start, end: yesterday }, yesterday)
    const items = await fetchRange(clamped, { signal })
    remember(clamped, items)
    return items
  }
}

export function useDayApod(date: string | null, today: string) {
  const queryClient = useQueryClient()
  return useQuery<Apod, ApodRequestError>({
    queryKey: apodKeys.day(date),
    queryFn: ({ signal }) => {
      if (date === null) throw new ApodRequestError('No APOD for this date.', 404, 'not-found')
      return fetchDayOrYesterday(
        date,
        today,
        (resolved, apod) => {
          queryClient.setQueryData(apodKeys.day(resolved), apod)
        },
        signal,
      )
    },
    enabled: date !== null,
    staleTime: Infinity,
  })
}

export function useRangeApods(
  range: DateSpan,
  today: string,
  enabled = true,
  onClamped?: (range: DateSpan) => void,
) {
  const queryClient = useQueryClient()
  return useQuery<Apod[], ApodRequestError>({
    queryKey: apodKeys.range(range),
    queryFn: ({ signal }) =>
      fetchRangeOrUntilPublished(
        range,
        today,
        (resolved, items) => {
          queryClient.setQueryData(apodKeys.range(resolved), items)
          onClamped?.(resolved)
        },
        signal,
      ),
    staleTime: Infinity,
    enabled,
  })
}

export function useSurpriseApods(count: number, enabled = true) {
  return useQuery<Apod[], ApodRequestError>({
    queryKey: apodKeys.surprise(count),
    queryFn: ({ signal }) => fetchSurprise(count, { signal }),
    staleTime: Infinity,
    enabled,
  })
}
