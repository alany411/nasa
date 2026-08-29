import { QueryClient } from '@tanstack/react-query'

import type { DateSpan } from '@/lib/today'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

export const apodKeys = {
  day: (date: string | null) => ['apod', 'day', date] as const,
  range: (range: DateSpan) => ['apod', 'range', range.start, range.end] as const,
  surprise: (count: number) => ['apod', 'surprise', count] as const,
}
