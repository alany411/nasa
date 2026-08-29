import { DatePicker, DateRangePicker } from '@/components/DatePicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  canStepNext,
  canStepPrevious,
  SURPRISE_MAX,
  type FormError,
  type ViewerMode,
} from '@/lib/mode'
import { todayInNewYork } from '@/lib/today'
import { cn } from '@/lib/utils'

type QueryBarProps = {
  mode: ViewerMode
  error: FormError | null
  onKindChange: (kind: ViewerMode['kind']) => void
  onModeChange: (mode: ViewerMode) => void
  onShowRange: () => void
  onSurprise: () => void
  onPreviousDay: () => void
  onNextDay: () => void
}

export function QueryBar({
  mode,
  error,
  onKindChange,
  onModeChange,
  onShowRange,
  onSurprise,
  onPreviousDay,
  onNextDay,
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
              <Button
                type="button"
                className="rounded-md"
                disabled={!canStepPrevious(mode.date)}
                onClick={onPreviousDay}
              >
                Previous
              </Button>
              <Label htmlFor="day-date" className="sr-only">
                Date
              </Label>
              <DatePicker
                id="day-date"
                value={mode.date}
                max={today}
                invalid={error?.field === 'date'}
                onChange={(date) => onModeChange({ kind: 'day', date })}
              />
              <Button
                type="button"
                className="rounded-md"
                disabled={!canStepNext(mode.date, today)}
                onClick={onNextDay}
              >
                Next
              </Button>
            </div>
          ) : null}

          {mode.kind === 'range' ? (
            <>
              <div className="flex items-center gap-2">
                <Label htmlFor="range-dates" className="sr-only">
                  Range
                </Label>
                <DateRangePicker
                  id="range-dates"
                  start={mode.start}
                  end={mode.end}
                  max={today}
                  invalid={
                    error?.field === 'start' || error?.field === 'end' || error?.field === 'range'
                  }
                  onChange={(range) => onModeChange({ kind: 'range', ...range })}
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
