import { QueryClient } from '@tanstack/react-query'

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
  range: (start: string, end: string) => ['apod', 'range', start, end] as const,
  surprise: (count: number) => ['apod', 'surprise', count] as const,
}
