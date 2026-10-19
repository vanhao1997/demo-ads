export type InspectedMedia = {
  id: string
  name: string
  kind: 'image' | 'video' | 'audio'
  mime: string
  bytes: number
  width?: number
  height?: number
  durationMs?: number
  codec?: string
  sha256: string
  url: string
  metadataStatus: 'ready' | 'partial'
  role: 'creative' | 'logo' | 'avatar' | 'form_cover' | 'audio'
}

export const APP_FILE_BUDGET = 256 * 1024 * 1024
export const APP_SESSION_BUDGET = 512 * 1024 * 1024
export const MAX_CAROUSEL_FILES = 10

export function sniffType(
  bytes: Uint8Array,
): { kind: InspectedMedia['kind']; mime: string } | null {
  const text = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end))
  if (bytes[0] === 0x89 && text(1, 4) === 'PNG') return { kind: 'image', mime: 'image/png' }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return { kind: 'image', mime: 'image/jpeg' }
  if (text(0, 3) === 'GIF') return { kind: 'image', mime: 'image/gif' }
  if (text(0, 4) === 'RIFF' && text(8, 12) === 'WEBP') return { kind: 'image', mime: 'image/webp' }
  if (text(4, 8) === 'ftyp') return { kind: 'video', mime: 'video/mp4' }
  if (text(0, 3) === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0))
    return { kind: 'audio', mime: 'audio/mpeg' }
  if (text(0, 4) === 'RIFF' && text(8, 12) === 'WAVE') return { kind: 'audio', mime: 'audio/wav' }
  return null
}

async function inspectTimeMedia(url: string, kind: 'video' | 'audio') {
  const el = document.createElement(kind)
  el.preload = 'metadata'
  try {
    return await new Promise<{ width?: number; height?: number; durationMs?: number }>(
      (resolve, reject) => {
        const timer = window.setTimeout(
          () => reject(new Error('Không đọc được metadata trong 15 giây.')),
          15000,
        )
        el.onloadedmetadata = () => {
          window.clearTimeout(timer)
          if (!Number.isFinite(el.duration))
            return reject(new Error('Không xác định được thời lượng media.'))
          resolve({
            width: el instanceof HTMLVideoElement ? el.videoWidth : undefined,
            height: el instanceof HTMLVideoElement ? el.videoHeight : undefined,
            durationMs: Math.round(el.duration * 1000),
          })
        }
        el.onerror = () => {
          window.clearTimeout(timer)
          reject(new Error('Trình duyệt không đọc được media này.'))
        }
        el.src = url
      },
    )
  } finally {
    el.removeAttribute('src')
    el.load()
  }
}

export async function inspectFile(file: File): Promise<InspectedMedia> {
  if (!file.size) throw new Error('Tệp rỗng.')
  if (file.size > APP_FILE_BUDGET)
    throw new Error('Vượt ngân sách ứng dụng 256 MB/tệp; đây không phải giới hạn nền tảng.')
  const type = sniffType(new Uint8Array(await file.slice(0, 16).arrayBuffer()))
  if (!type)
    throw new Error(
      'Chỉ nhận PNG, JPG, WebP, GIF, MP4, MP3 hoặc WAV. SVG/HTML không được thực thi.',
    )
  const blob = new Blob([file], { type: type.mime })
  const url = URL.createObjectURL(blob)
  try {
    let metadata: { width?: number; height?: number; durationMs?: number } = {}
    if (type.kind === 'image') {
      const image = await createImageBitmap(blob)
      metadata = { width: image.width, height: image.height }
      image.close()
    } else metadata = await inspectTimeMedia(url, type.kind)
    const hash = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
    return {
      id: crypto.randomUUID(),
      name: file.name,
      ...type,
      ...metadata,
      bytes: file.size,
      sha256: [...new Uint8Array(hash)]
        .map((value) => value.toString(16).padStart(2, '0'))
        .join(''),
      url,
      metadataStatus: type.kind === 'image' ? 'ready' : 'partial',
      role: type.kind === 'audio' ? 'audio' : 'creative',
    }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}
