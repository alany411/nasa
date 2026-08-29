import ky, { isHTTPError, isTimeoutError } from 'ky'

import { parseApod, type Apod, type ApodPayload } from '@/lib/apod'

const apod = ky.create({
  prefix: 'https://api.nasa.gov',
  retry: 0,
  timeout: 30_000,
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

function classifyNasaCode(code: string | undefined): ApodRequestError['code'] | null {
  if (code === 'API_KEY_INVALID') return 'forbidden'
  if (code === 'OVER_RATE_LIMIT') return 'rate-limited'
  return null
}

function nasaMessage(data: unknown, status: number): string {
  const fallback = `NASA returned ${status}.`
  if (!data || typeof data !== 'object') return fallback
  const body = data as { msg?: string; error?: { message?: string } }
  return body.msg ?? body.error?.message ?? fallback
}

function fromHttpError(error: { data: unknown; response: { status: number } }): ApodRequestError {
  const status = error.response.status
  const data = error.data
  const nasaCode =
    data && typeof data === 'object' && 'error' in data
      ? classifyNasaCode((data as { error?: { code?: string } }).error?.code)
      : null
  return new ApodRequestError(nasaMessage(data, status), status, nasaCode ?? classify(status))
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

async function request(
  searchParams: Record<string, string>,
  options: RequestOptions = {},
): Promise<ApodPayload | ApodPayload[]> {
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
      .json<ApodPayload | ApodPayload[]>()
  } catch (error) {
    if (isAbortError(error)) throw error
    if (isHTTPError(error)) throw fromHttpError(error)
    if (isTimeoutError(error)) {
      throw new ApodRequestError('The request timed out.', 0, 'network')
    }
    throw new ApodRequestError('The network request failed.', 0, 'network')
  }
}

export async function fetchDay(date: string, options?: RequestOptions): Promise<Apod> {
  const payload = await request({ date }, options)
  if (Array.isArray(payload)) {
    const first = payload[0]
    if (!first) throw new ApodRequestError('No APOD for this date.', 404, 'not-found')
    return parseApod(first)
  }
  return parseApod(payload)
}

export async function fetchRange(
  start: string,
  end: string,
  options?: RequestOptions,
): Promise<Apod[]> {
  const payload = await request({ start_date: start, end_date: end }, options)
  const items = Array.isArray(payload) ? payload : [payload]
  return items.map(parseApod)
}

export async function fetchSurprise(count: number, options?: RequestOptions): Promise<Apod[]> {
  const payload = await request({ count: String(count) }, options)
  const items = Array.isArray(payload) ? payload : [payload]
  return items.map(parseApod)
}
