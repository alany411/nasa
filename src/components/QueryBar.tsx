import { CalendarRange, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

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

type QueryBarProps = {
  mode: ViewerMode
  error: FormError | null
  onKindChange: (kind: ViewerMode['kind']) => void
  onModeChange: (mode: ViewerMode) => void
  onShowRange: () => void
  onSurprise: () => void
  onPreviousDay: () => void
  onNextDay: () => void
  today: string
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
  today,
}: QueryBarProps) {
  const dateInvalid = error?.field === 'date'
  const rangeInvalid =
    error?.field === 'start' || error?.field === 'end' || error?.field === 'range'
  const countInvalid = error?.field === 'count'

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card px-3 py-2.5 md:flex-row md:items-start md:justify-between">
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

      <div className="flex flex-wrap items-start gap-3">
        {mode.kind === 'day' ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="rounded-md"
                disabled={!canStepPrevious(mode.date)}
                onClick={onPreviousDay}
              >
                <ChevronLeft data-icon="inline-start" />
                Previous
              </Button>
              <Label htmlFor="day-date" className="sr-only">
                Date
              </Label>
              <DatePicker
                id="day-date"
                value={mode.date}
                max={today}
                invalid={dateInvalid}
                describedBy={dateInvalid ? 'day-date-error' : undefined}
                onChange={(date) => onModeChange({ kind: 'day', date })}
              />
              <Button
                type="button"
                className="rounded-md"
                disabled={!canStepNext(mode.date, today)}
                onClick={onNextDay}
              >
                Next
                <ChevronRight data-icon="inline-end" />
              </Button>
            </div>
            <FieldError id="day-date-error" message={dateInvalid ? error?.message : undefined} />
          </div>
        ) : null}

        {mode.kind === 'range' ? (
          <>
            <div className="flex flex-col gap-1">
              <Label htmlFor="range-dates" className="sr-only">
                Range
              </Label>
              <DateRangePicker
                id="range-dates"
                start={mode.start}
                end={mode.end}
                max={today}
                invalid={rangeInvalid}
                describedBy={rangeInvalid ? 'range-error' : undefined}
                onChange={(range) => onModeChange({ kind: 'range', ...range })}
              />
              <FieldError
                id="range-error"
                message={rangeInvalid ? error?.message : undefined}
              />
            </div>
            <Button
              type="button"
              className="rounded-md"
              disabled={Boolean(error)}
              onClick={onShowRange}
            >
              <CalendarRange data-icon="inline-start" />
              Show
            </Button>
          </>
        ) : null}

        {mode.kind === 'surprise' ? (
          <>
            <div className="flex flex-col gap-1">
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
                  aria-invalid={countInvalid}
                  aria-describedby={countInvalid ? 'surprise-count-error' : undefined}
                  className="w-20 rounded-md"
                  onChange={(event) =>
                    onModeChange({
                      kind: 'surprise',
                      count: Number.parseInt(event.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <FieldError
                id="surprise-count-error"
                message={countInvalid ? error?.message : undefined}
              />
            </div>
            <Button
              type="button"
              className="rounded-md"
              disabled={Boolean(error)}
              onClick={onSurprise}
            >
              <Sparkles data-icon="inline-start" />
              Surprise
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-xs text-destructive">
      {message}
    </p>
  )
}
