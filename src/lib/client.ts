import ky, { isHTTPError, isTimeoutError } from 'ky'
import * as v from 'valibot'

import { parseApods, type Apod } from '@/lib/apod'
import type { DateSpan } from '@/lib/today'

const apod = ky.create({
  prefix: 'https://api.nasa.gov',
  retry: 0,
  timeout: 15_000,
})

type RequestOptions = {
  signal?: AbortSignal
}

export class ApodRequestError extends Error {
  readonly status: number
  readonly code: 'not-found' | 'forbidden' | 'rate-limited' | 'bad-request' | 'network' | 'unknown'

  constructor(message: string, status: number, code: ApodRequestError['code']) {
    super(message)
    this.name = 'ApodRequestError'
    this.status = status
    this.code = code
  }
}

export function requestErrorMessage(error: ApodRequestError): string {
  if (error.code === 'forbidden') return 'This API key is not accepted.'
  if (error.code === 'rate-limited') return 'NASA is rate-limiting this key. Wait and retry.'
  if (error.code === 'not-found') return 'No APOD for this date.'
  return error.message
}

function apiKey(): string {
  const key = import.meta.env.VITE_NASA_API_KEY
  return typeof key === 'string' && key.trim().length > 0 ? key.trim() : 'DEMO_KEY'
}

function classify(status: number): ApodRequestError['code'] {
  if (status === 404) return 'not-found'
  if (status === 403) return 'forbidden'
  if (status === 429) return 'rate-limited'
  if (status === 400) return 'bad-request'
  return 'unknown'
}

const nasaErrorSchema = v.union([
  v.object({
    error: v.object({
      code: v.optional(v.string()),
      message: v.pipe(v.string(), v.trim(), v.minLength(1)),
    }),
  }),
  v.object({
    msg: v.pipe(v.string(), v.trim(), v.minLength(1)),
  }),
])

function classifyNasaCode(code: string | undefined): ApodRequestError['code'] | null {
  if (code === 'API_KEY_INVALID') return 'forbidden'
  if (code === 'OVER_RATE_LIMIT') return 'rate-limited'
  return null
}

function fromHttpError(error: { data: unknown; response: { status: number } }): ApodRequestError {
  const status = error.response.status
  const parsed = v.safeParse(nasaErrorSchema, error.data)
  if (!parsed.success) {
    return new ApodRequestError(`NASA returned ${status}.`, status, classify(status))
  }
  if ('error' in parsed.output) {
    return new ApodRequestError(
      parsed.output.error.message,
      status,
      classifyNasaCode(parsed.output.error.code) ?? classify(status),
    )
  }
  return new ApodRequestError(parsed.output.msg, status, classify(status))
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

async function request(
  searchParams: Record<string, string>,
  options: RequestOptions = {},
): Promise<unknown> {
  try {
    return await apod
      .get('planetary/apod', {
        signal: options.signal,
        searchParams: {
          ...searchParams,
          api_key: apiKey(),
          thumbs: 'true',
        },
      })
      .json()
  } catch (error) {
    if (isAbortError(error)) throw error
    if (isHTTPError(error)) throw fromHttpError(error)
    if (isTimeoutError(error)) {
      throw new ApodRequestError('The request timed out.', 0, 'network')
    }
    throw new ApodRequestError('The network request failed.', 0, 'network')
  }
}

function readApods(payload: unknown): Apod[] {
  try {
    return parseApods(payload)
  } catch {
    throw new ApodRequestError('NASA returned an unexpected APOD.', 200, 'unknown')
  }
}

export async function fetchDay(date: string, options?: RequestOptions): Promise<Apod> {
  const items = readApods(await request({ date }, options))
  const first = items[0]
  if (!first) throw new ApodRequestError('No APOD for this date.', 404, 'not-found')
  return first
}

export async function fetchRange(range: DateSpan, options?: RequestOptions): Promise<Apod[]> {
  return readApods(await request({ start_date: range.start, end_date: range.end }, options))
}

export async function fetchSurprise(count: number, options?: RequestOptions): Promise<Apod[]> {
  return readApods(await request({ count: String(count) }, options))
}
