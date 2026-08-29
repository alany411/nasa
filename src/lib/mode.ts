import * as v from 'valibot'

import {
  ARCHIVE_FLOOR,
  clampToArchive,
  compareIsoDates,
  defaultRange,
  inclusiveDayCount,
  todayInNewYork,
} from '@/lib/today'

export const SURPRISE_DEFAULT = 6
export const SURPRISE_MAX = 12
export const RANGE_MAX_DAYS = 7

export type DayMode = { kind: 'day'; date: string }
export type RangeMode = { kind: 'range'; start: string; end: string }
export type SurpriseMode = { kind: 'surprise'; count: number }
export type ViewerMode = DayMode | RangeMode | SurpriseMode

export type FormError = {
  field: 'date' | 'start' | 'end' | 'count' | 'range'
  message: string
}

function daySchema(today: string) {
  return v.object({
    kind: v.literal('day'),
    date: v.pipe(
      v.string(),
      v.check(
        (date) => compareIsoDates(date, ARCHIVE_FLOOR) >= 0,
        `The archive begins on ${ARCHIVE_FLOOR}.`,
      ),
      v.check((date) => compareIsoDates(date, today) <= 0, 'There is no APOD for a future date.'),
    ),
  })
}

function rangeSchema(today: string) {
  return v.pipe(
    v.object({
      kind: v.literal('range'),
      start: v.pipe(
        v.string(),
        v.check(
          (start) => compareIsoDates(start, ARCHIVE_FLOOR) >= 0,
          `The archive begins on ${ARCHIVE_FLOOR}.`,
        ),
      ),
      end: v.pipe(
        v.string(),
        v.check((end) => compareIsoDates(end, today) <= 0, 'A Range cannot end after Today.'),
      ),
    }),
    v.check(
      (mode) => compareIsoDates(mode.start, mode.end) <= 0,
      'Start must be on or before end.',
    ),
    v.check(
      (mode) => inclusiveDayCount(mode.start, mode.end) <= RANGE_MAX_DAYS,
      `A Range can be at most ${RANGE_MAX_DAYS} days.`,
    ),
  )
}

const surpriseSchema = v.object({
  kind: v.literal('surprise'),
  count: v.pipe(
    v.number(),
    v.integer('Count must be at least 1.'),
    v.minValue(1, 'Count must be at least 1.'),
    v.maxValue(SURPRISE_MAX, `Count can be at most ${SURPRISE_MAX}.`),
  ),
})

function modeSchema(today: string) {
  return v.variant('kind', [daySchema(today), rangeSchema(today), surpriseSchema])
}

function isFormField(path: string | null): path is FormError['field'] {
  return (
    path === 'date' || path === 'start' || path === 'end' || path === 'count' || path === 'range'
  )
}

function formErrorFromIssue(issue: v.BaseIssue<unknown>, kind: ViewerMode['kind']): FormError {
  const path = v.getDotPath(issue)
  const field = isFormField(path)
    ? path
    : kind === 'range'
      ? 'range'
      : kind === 'surprise'
        ? 'count'
        : 'date'
  return { field, message: issue.message }
}

export function validateMode(mode: ViewerMode, today = todayInNewYork()): FormError | null {
  const result = v.safeParse(modeSchema(today), mode)
  if (result.success) return null
  const issue = result.issues[0]
  if (!issue) return null
  return formErrorFromIssue(issue, mode.kind)
}

export function rememberedDefaults(kind: ViewerMode['kind'], today = todayInNewYork()): ViewerMode {
  if (kind === 'day') return { kind: 'day', date: today }
  if (kind === 'range') {
    const { start, end } = defaultRange(today)
    return { kind: 'range', start, end }
  }
  return { kind: 'surprise', count: SURPRISE_DEFAULT }
}

export function canStepPrevious(date: string): boolean {
  return compareIsoDates(date, ARCHIVE_FLOOR) > 0
}

export function canStepNext(date: string, today = todayInNewYork()): boolean {
  return compareIsoDates(date, today) < 0
}

export function stepDay(date: string, delta: -1 | 1, today = todayInNewYork()): string {
  const [year, month, day] = date.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + delta))
  return clampToArchive(next.toISOString().slice(0, 10), today)
}
