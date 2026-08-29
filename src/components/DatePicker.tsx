import { useState } from 'react'
import { CalendarDays, CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RANGE_MAX_DAYS } from '@/lib/mode'
import {
  addCalendarDays,
  ARCHIVE_FLOOR,
  clampToArchive,
  formatDisplayDate,
  parseIsoDate,
  toIsoDate,
  type DateSpan,
} from '@/lib/today'
import { cn } from '@/lib/utils'

type DatePickerProps = {
  id: string
  value: string
  max: string
  min?: string
  invalid?: boolean
  disabled?: boolean
  describedBy?: string
  className?: string
  onChange: (date: string) => void
}

export function DatePicker({
  id,
  value,
  max,
  min = ARCHIVE_FLOOR,
  invalid = false,
  disabled = false,
  describedBy,
  className,
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseIsoDate(value)
  const startMonth = parseIsoDate(min)
  const endMonth = parseIsoDate(max)

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={(next) => {
        if (!disabled) setOpen(next)
      }}
    >
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={cn('w-[13.5rem] justify-start rounded-md font-normal', className)}
          />
        }
      >
        <CalendarIcon className="size-4" aria-hidden />
        {formatDisplayDate(value)}
      </PopoverTrigger>
      <PopoverContent align="start" aria-label="Choose date" className="w-auto p-0">
        <Calendar
          mode="single"
          required
          selected={selected}
          defaultMonth={selected}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={{ before: startMonth, after: endMonth }}
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange(toIsoDate(date))
            setOpen(false)
          }}
        />
        <div className="border-t p-2">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-md"
            disabled={value === max}
            onClick={() => {
              onChange(max)
              setOpen(false)
            }}
          >
            <CalendarDays data-icon="inline-start" aria-hidden />
            Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

type DateRangePickerProps = {
  id: string
  start: string
  end: string
  max: string
  min?: string
  invalid?: boolean
  disabled?: boolean
  describedBy?: string
  className?: string
  onChange: (range: DateSpan) => void
}

export function DateRangePicker({
  id,
  start,
  end,
  max,
  min = ARCHIVE_FLOOR,
  invalid = false,
  disabled = false,
  describedBy,
  className,
  onChange,
}: DateRangePickerProps) {
  const committed = { from: parseIsoDate(start), to: parseIsoDate(end) }
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | null>(null)
  const range = draft ?? committed
  const startMonth = parseIsoDate(min)
  const endMonth = parseIsoDate(max)

  const label =
    range.from && range.to
      ? `${formatShortDate(range.from)} – ${formatShortDate(range.to)}`
      : range.from
        ? formatShortDate(range.from)
        : 'Pick a range'

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={(next) => {
        if (disabled) return
        setOpen(next)
        setDraft(next ? committed : null)
      }}
    >
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={cn('w-[17.5rem] justify-start rounded-md font-normal', className)}
          />
        }
      >
        <CalendarIcon className="size-4" aria-hidden />
        {label}
      </PopoverTrigger>
      <PopoverContent align="start" aria-label="Choose date range" className="w-auto p-0">
        <Calendar
          mode="range"
          resetOnSelect
          selected={range}
          defaultMonth={range.from ?? committed.from}
          numberOfMonths={2}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={disabledForRange(range, min, max)}
          captionLayout="dropdown"
          onSelect={(next) => {
            const resolved = next ?? committed
            setDraft(resolved)
            if (resolved.from && resolved.to) {
              onChange({ start: toIsoDate(resolved.from), end: toIsoDate(resolved.to) })
              setOpen(false)
              setDraft(null)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function disabledForRange(range: DateRange | undefined, min: string, max: string) {
  const bounds = { before: parseIsoDate(min), after: parseIsoDate(max) }
  if (!range?.from || range.to) return bounds
  const from = toIsoDate(range.from)
  return [
    bounds,
    { before: parseIsoDate(clampToArchive(addCalendarDays(from, 1 - RANGE_MAX_DAYS), max)) },
    { after: parseIsoDate(clampToArchive(addCalendarDays(from, RANGE_MAX_DAYS - 1), max)) },
  ]
}
