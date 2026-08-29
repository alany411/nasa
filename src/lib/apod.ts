export type MediaKind = 'image' | 'video' | 'other'

export type Apod = {
  date: string
  title: string
  explanation: string
  mediaType: MediaKind
  url: string
  hdUrl?: string
  thumbnailUrl?: string
  copyright?: string
}

export type ApodPayload = {
  date: string
  title: string
  explanation: string
  media_type: string
  url: string
  hdurl?: string
  thumbnail_url?: string
  copyright?: string
}

export function parseApod(payload: ApodPayload): Apod {
  const mediaType: MediaKind =
    payload.media_type === 'video' ? 'video' : payload.media_type === 'image' ? 'image' : 'other'

  return {
    date: payload.date,
    title: payload.title,
    explanation: payload.explanation,
    mediaType,
    url: payload.url,
    hdUrl: payload.hdurl,
    thumbnailUrl: payload.thumbnail_url,
    copyright: payload.copyright,
  }
}
