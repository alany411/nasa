import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { Apod } from '@/lib/apod'
import { ApodRequestError, fetchDay, fetchSurprise, fetchRange } from '@/lib/client'
import { apodKeys } from '@/lib/query'
import { addCalendarDays, type DateSpan } from '@/lib/today'

async function fetchDayOrYesterday(
  date: string,
  today: string,
  remember: (date: string, apod: Apod) => void,
  signal?: AbortSignal,
): Promise<Apod> {
  try {
    return await fetchDay(date, { signal })
  } catch (error) {
    if (
      date === today &&
      error instanceof ApodRequestError &&
      (error.code === 'not-found' || error.code === 'bad-request')
    ) {
      const yesterday = addCalendarDays(today, -1)
      const apod = await fetchDay(yesterday, { signal })
      remember(yesterday, apod)
      return apod
    }
    throw error
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

export function useRangeApods(range: DateSpan, enabled = true) {
  return useQuery<Apod[], ApodRequestError>({
    queryKey: apodKeys.range(range),
    queryFn: ({ signal }) => fetchRange(range, { signal }),
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
