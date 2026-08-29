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

export function parseModeFromSearch(search: string, today = todayInNewYork()): ViewerMode {
  const params = new URLSearchParams(search)
  const start = params.get('start')
  const end = params.get('end')
  const count = params.get('count')
  const date = params.get('date')

  if (start && end) return { kind: 'range', start, end }
  if (count) {
    const parsed = Number.parseInt(count, 10)
    return { kind: 'surprise', count: Number.isFinite(parsed) ? parsed : SURPRISE_DEFAULT }
  }
  if (date) return { kind: 'day', date }
  return { kind: 'day', date: today }
}

export function searchFromMode(mode: ViewerMode, today = todayInNewYork()): string {
  if (mode.kind === 'day') {
    return mode.date === today ? '' : `?date=${mode.date}`
  }
  if (mode.kind === 'range') return `?start=${mode.start}&end=${mode.end}`
  return `?count=${mode.count}`
}

export function validateMode(mode: ViewerMode, today = todayInNewYork()): FormError | null {
  if (mode.kind === 'day') {
    if (compareIsoDates(mode.date, ARCHIVE_FLOOR) < 0) {
      return { field: 'date', message: `The archive begins on ${ARCHIVE_FLOOR}.` }
    }
    if (compareIsoDates(mode.date, today) > 0) {
      return { field: 'date', message: 'There is no APOD for a future date.' }
    }
    return null
  }

  if (mode.kind === 'range') {
    if (compareIsoDates(mode.start, ARCHIVE_FLOOR) < 0) {
      return { field: 'start', message: `The archive begins on ${ARCHIVE_FLOOR}.` }
    }
    if (compareIsoDates(mode.end, today) > 0) {
      return { field: 'end', message: 'A Window cannot end after Today.' }
    }
    if (compareIsoDates(mode.start, mode.end) > 0) {
      return { field: 'window', message: 'Start must be on or before end.' }
    }
    if (inclusiveDayCount(mode.start, mode.end) > RANGE_MAX_DAYS) {
      return {
        field: 'window',
        message: `A Window can be at most ${RANGE_MAX_DAYS} days. This span was not requested.`,
      }
    }
    return null
  }

  if (!Number.isInteger(mode.count) || mode.count < 1) {
    return { field: 'count', message: 'Count must be at least 1.' }
  }
  if (mode.count > SURPRISE_MAX) {
    return { field: 'count', message: `A Sample can be at most ${SURPRISE_MAX} APODs.` }
  }
  return null
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
