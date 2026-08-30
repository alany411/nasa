import { useEffect, useState } from 'react'

import { todayInNewYork } from '@/lib/today'

export function useNewYorkToday(): string {
  const [today, setToday] = useState(todayInNewYork)

  useEffect(() => {
    const sync = () => {
      const next = todayInNewYork()
      setToday((current) => (current === next ? current : next))
    }

    const interval = window.setInterval(sync, 30_000)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  return today
}
