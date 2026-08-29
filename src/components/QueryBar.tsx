import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SURPRISE_MAX, type FormError, type ViewerMode } from '@/lib/mode'
import { todayInNewYork } from '@/lib/today'
import { cn } from '@/lib/utils'

type QueryBarProps = {
  mode: ViewerMode
  error: FormError | null
  onKindChange: (kind: ViewerMode['kind']) => void
  onModeChange: (mode: ViewerMode) => void
  onShowRange: () => void
  onSurprise: () => void
}

export function QueryBar({
  mode,
  error,
  onKindChange,
  onModeChange,
  onShowRange,
  onSurprise,
}: QueryBarProps) {
  const today = todayInNewYork()

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-md border bg-card px-3 py-2.5',
        error ? 'border-destructive' : 'border-border',
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <ToggleGroup
          value={[mode.kind]}
          onValueChange={(values) => {
            const next = values[0]
            if (next === 'day' || next === 'range' || next === 'surprise') onKindChange(next)
          }}
          variant="default"
          size="sm"
          className="justify-start"
        >
          <ToggleGroupItem value="day" className="rounded-md px-3">
            Day
          </ToggleGroupItem>
          <ToggleGroupItem value="range" className="rounded-md px-3">
            Range
          </ToggleGroupItem>
          <ToggleGroupItem value="surprise" className="rounded-md px-3">
            Surprise
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex flex-wrap items-center gap-3">
          {mode.kind === 'day' ? (
            <div className="flex items-center gap-2">
              <Label htmlFor="day-date" className="text-xs font-medium text-muted-foreground">
                Date
              </Label>
              <Input
                id="day-date"
                type="date"
                min="1995-06-16"
                max={today}
                value={mode.date}
                aria-invalid={error?.field === 'date'}
                className="rounded-md md:w-44"
                onChange={(event) => onModeChange({ kind: 'day', date: event.target.value })}
              />
            </div>
          ) : null}

          {mode.kind === 'range' ? (
            <>
              <div className="flex items-center gap-2">
                <Label htmlFor="window-start" className="text-xs font-medium text-muted-foreground">
                  Start
                </Label>
                <Input
                  id="window-start"
                  type="date"
                  min="1995-06-16"
                  max={today}
                  value={mode.start}
                  aria-invalid={error?.field === 'start' || error?.field === 'range'}
                  className="rounded-md md:w-40"
                  onChange={(event) => onModeChange({ ...mode, start: event.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="window-end" className="text-xs font-medium text-muted-foreground">
                  End
                </Label>
                <Input
                  id="window-end"
                  type="date"
                  min="1995-06-16"
                  max={today}
                  value={mode.end}
                  aria-invalid={error?.field === 'end' || error?.field === 'range'}
                  className="rounded-md md:w-40"
                  onChange={(event) => onModeChange({ ...mode, end: event.target.value })}
                />
              </div>
              <Button type="button" className="rounded-md" onClick={onShowRange}>
                Show
              </Button>
            </>
          ) : null}

          {mode.kind === 'surprise' ? (
            <>
              <div className="flex items-center gap-2">
                <Label htmlFor="surprise-count" className="text-xs font-medium text-muted-foreground">
                  Count
                </Label>
                <Input
                  id="surprise-count"
                  type="number"
                  min={1}
                  max={SURPRISE_MAX}
                  value={mode.count}
                  aria-invalid={error?.field === 'count'}
                  className="w-20 rounded-md"
                  onChange={(event) =>
                    onModeChange({
                      kind: 'surprise',
                      count: Number.parseInt(event.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <Button type="button" className="rounded-md" onClick={onSurprise}>
                Surprise me
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error.message}</p> : null}
    </div>
  )
}
