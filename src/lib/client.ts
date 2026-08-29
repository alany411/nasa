import ky, { isHTTPError } from 'ky'

import { parseApod, type Apod, type ApodPayload } from '@/lib/apod'

const apod = ky.create({
  prefix: 'https://api.nasa.gov',
})

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

function nasaMessage(data: unknown, status: number): string {
  const fallback = `NASA returned ${status}.`
  if (!data || typeof data !== 'object') return fallback
  const body = data as { msg?: string; error?: { message?: string } }
  return body.msg ?? body.error?.message ?? fallback
}

async function request(searchParams: Record<string, string>): Promise<ApodPayload | ApodPayload[]> {
  try {
    return await apod
      .get('planetary/apod', {
        searchParams: {
          ...searchParams,
          api_key: apiKey(),
          thumbs: 'true',
        },
      })
      .json<ApodPayload | ApodPayload[]>()
  } catch (error) {
    if (isHTTPError(error)) {
      throw new ApodRequestError(
        nasaMessage(error.data, error.response.status),
        error.response.status,
        classify(error.response.status),
      )
    }
    throw new ApodRequestError('The network request failed.', 0, 'network')
  }
}

export async function fetchDay(date: string): Promise<Apod> {
  const payload = await request({ date })
  if (Array.isArray(payload)) {
    const first = payload[0]
    if (!first) throw new ApodRequestError('No APOD for this date.', 404, 'not-found')
    return parseApod(first)
  }
  return parseApod(payload)
}

export async function fetchRange(start: string, end: string): Promise<Apod[]> {
  const payload = await request({ start_date: start, end_date: end })
  const items = Array.isArray(payload) ? payload : [payload]
  return items.map(parseApod)
}

export async function fetchSurprise(count: number): Promise<Apod[]> {
  const payload = await request({ count: String(count) })
  const items = Array.isArray(payload) ? payload : [payload]
  return items.map(parseApod)
}
