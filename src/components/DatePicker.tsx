import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ARCHIVE_FLOOR, formatDisplayDate, parseIsoDate, toIsoDate } from '@/lib/today'
import { cn } from '@/lib/utils'

type DatePickerProps = {
  id: string
  value: string
  max: string
  min?: string
  invalid?: boolean
  className?: string
  onChange: (date: string) => void
}

export function DatePicker({
  id,
  value,
  max,
  min = ARCHIVE_FLOOR,
  invalid = false,
  className,
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseIsoDate(value)
  const startMonth = parseIsoDate(min)
  const endMonth = parseIsoDate(max)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={invalid}
            className={cn('w-[13.5rem] justify-start rounded-md font-normal', className)}
          />
        }
      >
        <CalendarIcon className="size-4" />
        {formatDisplayDate(value)}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
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
      </PopoverContent>
    </Popover>
  )
}
