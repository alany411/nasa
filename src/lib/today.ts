export const ARCHIVE_FLOOR = '1995-06-16'

export function todayInNewYork(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + days))
  return next.toISOString().slice(0, 10)
}

export function compareIsoDates(a: string, b: string): number {
  if (a === b) return 0
  return a < b ? -1 : 1
}

export function clampToArchive(isoDate: string, ceiling = todayInNewYork()): string {
  if (compareIsoDates(isoDate, ARCHIVE_FLOOR) < 0) return ARCHIVE_FLOOR
  if (compareIsoDates(isoDate, ceiling) > 0) return ceiling
  return isoDate
}

export function defaultRange(ceiling = todayInNewYork()): { start: string; end: string } {
  const start = clampToArchive(addCalendarDays(ceiling, -6), ceiling)
  return { start, end: ceiling }
}

export function inclusiveDayCount(start: string, end: string): number {
  const startUtc = Date.parse(`${start}T00:00:00Z`)
  const endUtc = Date.parse(`${end}T00:00:00Z`)
  return Math.floor((endUtc - startUtc) / 86_400_000) + 1
}

export function formatDisplayDate(isoDate: string): string {
  return parseIsoDate(isoDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
