import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { Apod } from '@/lib/apod'
import { ApodRequestError, fetchDay, fetchSurprise, fetchRange } from '@/lib/client'
import { apodKeys } from '@/lib/query'
import { addCalendarDays } from '@/lib/today'

async function fetchDayOrYesterday(
  date: string,
  today: string,
  remember: (date: string, apod: Apod) => void,
): Promise<Apod> {
  try {
    return await fetchDay(date)
  } catch (error) {
    if (date === today && error instanceof ApodRequestError && error.code === 'not-found') {
      const yesterday = addCalendarDays(today, -1)
      const apod = await fetchDay(yesterday)
      remember(yesterday, apod)
      return apod
    }
    throw error
  }
}

export function useDayApod(date: string | null, today: string) {
  const queryClient = useQueryClient()
  return useQuery<Apod, ApodRequestError>({
    queryKey: apodKeys.day(date ?? ''),
    queryFn: () =>
      fetchDayOrYesterday(date!, today, (resolved, apod) => {
        queryClient.setQueryData(apodKeys.day(resolved), apod)
      }),
    enabled: Boolean(date),
    staleTime: Infinity,
  })
}

export function useRangeApods(range: { start: string; end: string }) {
  return useQuery<Apod[], ApodRequestError>({
    queryKey: apodKeys.range(range.start, range.end),
    queryFn: () => fetchRange(range.start, range.end),
    staleTime: Infinity,
  })
}

export function useSurpriseApods(count: number) {
  return useQuery<Apod[], ApodRequestError>({
    queryKey: apodKeys.surprise(count),
    queryFn: () => fetchSurprise(count),
    staleTime: Infinity,
  })
}
