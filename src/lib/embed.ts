function youtubeId(url: string): string | null {
  return url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)?.[1] ?? null
}

function vimeoId(url: string): string | null {
  return url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1] ?? null
}

export function videoEmbedUrl(url: string): string | null {
  const youtube = youtubeId(url)
  if (youtube) return `https://www.youtube.com/embed/${youtube}`

  const vimeo = vimeoId(url)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}`

  return null
}

export function videoOpenLink(url: string): { href: string; label: string; ariaLabel: string } {
  const youtube = youtubeId(url)
  if (youtube) {
    return {
      href: `https://www.youtube.com/watch?v=${youtube}`,
      label: 'YouTube',
      ariaLabel: 'Open YouTube video in new tab',
    }
  }

  const vimeo = vimeoId(url)
  if (vimeo) {
    return {
      href: `https://vimeo.com/${vimeo}`,
      label: 'Vimeo',
      ariaLabel: 'Open Vimeo video in new tab',
    }
  }

  return { href: url, label: 'Video', ariaLabel: 'Open video in new tab' }
}
