import { useEffect, useMemo, useState } from 'react'

import { AppHeader } from '@/components/AppHeader'
import { QueryBar } from '@/components/QueryBar'
import {
  parseModeFromSearch,
  rememberedDefaults,
  searchFromMode,
  validateMode,
  type ViewerMode,
} from '@/lib/mode'
import { todayInNewYork } from '@/lib/today'

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
  const [mode, setMode] = useState<ViewerMode>(() => parseModeFromSearch(window.location.search, today))
  const [memory, setMemory] = useState<Record<ViewerMode['kind'], ViewerMode>>(() => {
    const initial = parseModeFromSearch(window.location.search, today)
    return {
      day: initial.kind === 'day' ? initial : rememberedDefaults('day', today),
      window: initial.kind === 'range' ? initial : rememberedDefaults('range', today),
      sample: initial.kind === 'surprise' ? initial : rememberedDefaults('surprise', today),
    }
  })

  const formError = useMemo(() => validateMode(mode, today), [mode, today])

  function writeUrl(next: ViewerMode) {
    const nextUrl = `${window.location.pathname}${searchFromMode(next, today)}`
    window.history.pushState(next, '', nextUrl)
  }

  function applyMode(next: ViewerMode) {
    setMode(next)
    setMemory((current) => ({ ...current, [next.kind]: next }))
    writeUrl(next)
  }

  function onKindChange(kind: ViewerMode['kind']) {
    applyMode(memory[kind] ?? rememberedDefaults(kind, today))
  }

  useEffect(() => {
    function onPop() {
      const next = parseModeFromSearch(window.location.search, today)
      setMode(next)
      setMemory((current) => ({ ...current, [next.kind]: next }))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [today])

  useEffect(() => {
    const expected = searchFromMode(mode, today)
    if (window.location.search !== expected && !window.location.search) {
      window.history.replaceState(mode, '', `${window.location.pathname}${expected}`)
    }
  }, [mode, today])

  return (
    <div className="min-h-svh bg-background px-4 py-6 md:px-12 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <AppHeader kicker={kickerFor(mode)} />
        <QueryBar
          mode={mode}
          error={formError}
          onKindChange={onKindChange}
          onModeChange={applyMode}
          onShowRange={() => applyMode(mode)}
          onSurprise={() => applyMode(mode)}
        />
      </div>
    </div>
  )
}
