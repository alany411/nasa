import { parseApod, type Apod, type ApodPayload } from '@/lib/apod'

const API_ROOT = 'https://api.nasa.gov/planetary/apod'

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

async function request(params: URLSearchParams): Promise<ApodPayload | ApodPayload[]> {
  params.set('api_key', apiKey())
  params.set('thumbs', 'true')

  let response: Response
  try {
    response = await fetch(`${API_ROOT}?${params.toString()}`)
  } catch {
    throw new ApodRequestError('The network request failed.', 0, 'network')
  }

  if (!response.ok) {
    let detail = `NASA returned ${response.status}.`
    try {
      const body = (await response.json()) as { msg?: string; error?: { message?: string } }
      detail = body.msg ?? body.error?.message ?? detail
    } catch {
      // Keep the status fallback when the body is not JSON.
    }
    throw new ApodRequestError(detail, response.status, classify(response.status))
  }

  return (await response.json()) as ApodPayload | ApodPayload[]
}

export async function fetchDay(date: string): Promise<Apod> {
  const params = new URLSearchParams({ date })
  const payload = await request(params)
  if (Array.isArray(payload)) {
    const first = payload[0]
    if (!first) throw new ApodRequestError('No APOD for this date.', 404, 'not-found')
    return parseApod(first)
  }
  return parseApod(payload)
}

export async function fetchRange(start: string, end: string): Promise<Apod[]> {
  const params = new URLSearchParams({ start_date: start, end_date: end })
  const payload = await request(params)
  const items = Array.isArray(payload) ? payload : [payload]
  return items.map(parseApod)
}

export async function fetchSurprise(count: number): Promise<Apod[]> {
  const params = new URLSearchParams({ count: String(count) })
  const payload = await request(params)
  const items = Array.isArray(payload) ? payload : [payload]
  return items.map(parseApod)
}
