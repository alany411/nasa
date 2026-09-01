import * as v from 'valibot'

const optionalText = v.pipe(
  v.optional(v.nullish(v.string())),
  v.transform((value) => {
    const trimmed = value?.trim()
    return trimmed ? trimmed : undefined
  }),
)

const nasaApodSchema = v.pipe(
  v.object({
    date: v.pipe(v.string(), v.trim(), v.isoDate()),
    title: v.pipe(v.string(), v.trim(), v.minLength(1)),
    explanation: v.pipe(v.string(), v.trim(), v.minLength(0)),
    media_type: v.string(),
    url: v.pipe(v.string(), v.trim(), v.minLength(1)),
    hdurl: optionalText,
    thumbnail_url: optionalText,
    copyright: optionalText,
  }),
  v.transform((payload): Apod => {
    const base = {
      date: payload.date,
      title: payload.title,
      explanation: payload.explanation,
      copyright: payload.copyright,
    }
    if (payload.media_type === 'video') {
      return { ...base, mediaType: 'video', url: payload.url, thumbnailUrl: payload.thumbnail_url }
    }
    if (payload.media_type === 'image') {
      return { ...base, mediaType: 'image', url: payload.url, hdUrl: payload.hdurl }
    }
    return { ...base, mediaType: 'other', url: payload.url }
  }),
)

const nasaApodsSchema = v.union([nasaApodSchema, v.array(nasaApodSchema)])

export const NASA_LOGO_SRC = '/nasa-logo.svg'

export type Apod = {
  date: string
  title: string
  explanation: string
  copyright?: string
} & (
  | { mediaType: 'image'; url: string; hdUrl?: string }
  | { mediaType: 'video'; url: string; thumbnailUrl?: string }
  | { mediaType: 'other'; url: string }
)

export function parseApods(input: unknown): Apod[] {
  const result = v.safeParse(nasaApodsSchema, input)
  if (!result.success) throw new Error('NASA returned an unexpected APOD.')
  return Array.isArray(result.output) ? result.output : [result.output]
}
