import type { EditorDraft } from './editorModel'
import type { UiProfile } from './uiTypes'
import type { ReviewPackageDeps, ReviewRenderSettings } from '../storage/reviewPackage'
import { captureDeviceMockup } from './deviceMockupModel'
import { capturePresentation } from './previewPresentation'

type ReviewPackageResult = Awaited<
  ReturnType<typeof import('../storage/reviewPackage').createReviewPackage>
>

type ExportSettings = Pick<ReviewRenderSettings, 'fit' | 'safeZone'> &
  Partial<
    Pick<
      ReviewRenderSettings,
      | 'focalX'
      | 'focalY'
      | 'videoTimeMs'
      | 'cardIndex'
      | 'searchCombinationIndex'
      | 'formStage'
      | 'locale'
      | 'appChrome'
      | 'captionMask'
      | 'topViewPhase'
      | 'deviceMockup'
    >
  >

type ExportArgs = {
  element: HTMLElement
  draft: EditorDraft
  profile: UiProfile
  settings: ExportSettings
  kind: 'png' | 'package'
  formStage?: ReviewRenderSettings['formStage']
  signal?: AbortSignal
  timeoutMs?: number
  packageDeps?: ReviewPackageDeps
}

export type ReviewExportResult = {
  blob: Blob
  filename: string
  manifest?: ReviewPackageResult['manifest']
}

const DEFAULT_TIMEOUT_MS = 20_000

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Review export aborted.', 'AbortError')
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise
  let timer: ReturnType<typeof setTimeout> | undefined
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Hết thời gian tạo review snapshot.')), timeoutMs)
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer)
  })
}

function filenamePart(value: string): string {
  const clean = value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
  return clean || 'preview'
}

function renderSettings(settings: ExportSettings): ReviewRenderSettings {
  return {
    fit: settings.fit,
    safeZone: settings.safeZone,
    focalX: settings.focalX ?? 50,
    focalY: settings.focalY ?? 50,
    videoTimeMs: settings.videoTimeMs,
    cardIndex: settings.cardIndex,
    searchCombinationIndex: settings.searchCombinationIndex,
    formStage: settings.formStage,
    locale: settings.locale,
    appChrome: settings.appChrome,
    captionMask: settings.captionMask,
    topViewPhase: settings.topViewPhase,
    deviceMockup: settings.deviceMockup,
  }
}

async function waitForElementMedia(element: HTMLElement, timeoutMs: number) {
  const images = Array.from(element.querySelectorAll<HTMLImageElement>('img'))
  const videos = Array.from(element.querySelectorAll<HTMLVideoElement>('video'))
  await Promise.all(
    images.map((node) =>
      withTimeout(
        new Promise<void>((resolve, reject) => {
          if (node.complete) {
            if (node.naturalWidth > 0) resolve()
            else reject(new Error(`Không đọc được ảnh ${node.alt || 'creative'}.`))
            return
          }
          const onLoad = () => {
            cleanup()
            resolve()
          }
          const onError = () => {
            cleanup()
            reject(new Error(`Không đọc được ảnh ${node.alt || 'creative'}.`))
          }
          const cleanup = () => {
            node.removeEventListener('load', onLoad)
            node.removeEventListener('error', onError)
          }
          node.addEventListener('load', onLoad, { once: true })
          node.addEventListener('error', onError, { once: true })
          void node.decode?.().catch(() => undefined)
        }),
        timeoutMs,
      ),
    ),
  )
  await Promise.all(
    videos.map((node) =>
      withTimeout(
        new Promise<void>((resolve, reject) => {
          if (node.readyState >= 2) {
            resolve()
            return
          }
          const onReady = () => {
            cleanup()
            resolve()
          }
          const onError = () => {
            cleanup()
            reject(new Error('Không đọc được video preview.'))
          }
          const cleanup = () => {
            node.removeEventListener('loadeddata', onReady)
            node.removeEventListener('canplay', onReady)
            node.removeEventListener('error', onError)
          }
          node.addEventListener('loadeddata', onReady, { once: true })
          node.addEventListener('canplay', onReady, { once: true })
          node.addEventListener('error', onError, { once: true })
        }),
        timeoutMs,
      ),
    ),
  )
}

function captureRenderContext(element: HTMLElement, settings: ReviewRenderSettings) {
  const presentation = capturePresentation(element)
  const video = element.querySelector('video')
  const videoTimeAttribute =
    video?.dataset.videoTimeMs ??
    element.querySelector<HTMLElement>('[data-video-time-ms]')?.dataset.videoTimeMs
  const videoTimeMs = Number(videoTimeAttribute)
  const cardAttribute = element.querySelector<HTMLElement>('[data-renderer][data-preview-card]')
    ?.dataset.previewCard
  const cardText = element.querySelector('.carousel-controls span')?.textContent ?? ''
  const cardMatch = /^(\d+)\s*\/\s*\d+$/.exec(cardText.trim())
  const cardNumber = Number(cardAttribute ?? cardMatch?.[1])
  const combinationNumber = Number(
    element.querySelector<HTMLElement>('[data-preview-combination]')?.dataset.previewCombination,
  )
  const formStage = element.querySelector<HTMLElement>('[data-form-stage]')?.dataset.formStage
  return {
    ...settings,
    ...presentation,
    deviceMockup: captureDeviceMockup(element) ?? settings.deviceMockup,
    videoTimeMs:
      settings.videoTimeMs ??
      (Number.isFinite(videoTimeMs) && videoTimeMs >= 0 ? Math.round(videoTimeMs) : undefined) ??
      (video && Number.isFinite(video.currentTime)
        ? Math.round(video.currentTime * 1000)
        : undefined),
    cardIndex:
      settings.cardIndex ??
      (Number.isFinite(cardNumber) && cardNumber > 0 ? Math.max(0, cardNumber - 1) : undefined),
    searchCombinationIndex:
      settings.searchCombinationIndex ??
      (Number.isFinite(combinationNumber) && combinationNumber > 0
        ? combinationNumber - 1
        : undefined),
    formStage:
      settings.formStage ??
      (formStage === 'creative' || formStage === 'form' ? formStage : undefined),
  }
}

async function seekVideosToTime(
  element: HTMLElement,
  videoTimeMs: number | undefined,
  timeoutMs: number,
) {
  if (!Number.isFinite(videoTimeMs)) return () => undefined
  const videos = Array.from(element.querySelectorAll<HTMLVideoElement>('video'))
  const states = videos.map((video) => ({ video, currentTime: video.currentTime }))
  const targetSeconds = Math.max(0, Number(videoTimeMs) / 1000)
  await Promise.all(
    videos.map((video) =>
      withTimeout(
        new Promise<void>((resolve) => {
          const duration = Number.isFinite(video.duration) ? video.duration : undefined
          const next = duration === undefined ? targetSeconds : Math.min(targetSeconds, duration)
          const finish = () => {
            cleanup()
            resolve()
          }
          const fallback = setTimeout(finish, 160)
          const cleanup = () => {
            clearTimeout(fallback)
            video.removeEventListener('seeked', finish)
            video.removeEventListener('loadeddata', finish)
            video.removeEventListener('error', finish)
          }
          video.addEventListener('seeked', finish, { once: true })
          video.addEventListener('loadeddata', finish, { once: true })
          video.addEventListener('error', finish, { once: true })
          try {
            video.currentTime = next
          } catch {
            finish()
            return
          }
          if (!video.seeking) setTimeout(finish, 0)
        }),
        Math.min(timeoutMs, 1000),
      ).catch(() => undefined),
    ),
  )
  return () => {
    for (const state of states) {
      if (!Number.isFinite(state.currentTime)) continue
      try {
        state.video.currentTime = state.currentTime
      } catch {
        // Original node may have been detached while export was running.
      }
    }
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Không chuyển được media local sang data URL.'))
    reader.readAsDataURL(blob)
  })
}

async function inlineBlobImages(source: HTMLElement, clone: HTMLElement, timeoutMs: number) {
  const sourceImages = Array.from(source.querySelectorAll<HTMLImageElement>('img'))
  const cloneImages = Array.from(clone.querySelectorAll<HTMLImageElement>('img'))
  await Promise.all(
    sourceImages.map(async (image, index) => {
      const target = cloneImages[index]
      const src = image.currentSrc || image.src
      if (!target || !src.startsWith('blob:')) return
      const blob = await withTimeout(
        fetch(src).then((response) => {
          if (!response.ok) throw new Error(`Không đọc được ảnh ${image.alt || 'creative'}.`)
          return response.blob()
        }),
        timeoutMs,
      )
      target.src = await blobToDataUrl(blob)
      await target.decode?.().catch(() => undefined)
    }),
  )
}

function inlineVideoFrames(source: HTMLElement, clone: HTMLElement) {
  const sourceVideos = Array.from(source.querySelectorAll<HTMLVideoElement>('video'))
  const cloneVideos = Array.from(clone.querySelectorAll<HTMLVideoElement>('video'))
  sourceVideos.forEach((video, index) => {
    const target = cloneVideos[index]
    if (!target || video.readyState < 2) return
    const width = video.videoWidth || video.clientWidth || target.clientWidth
    const height = video.videoHeight || video.clientHeight || target.clientHeight
    if (!width || !height) return
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return
    try {
      context.drawImage(video, 0, 0, width, height)
      const image = document.createElement('img')
      image.src = canvas.toDataURL('image/png')
      image.alt = target.getAttribute('aria-label') ?? 'Video frame'
      image.className = target.className
      image.style.cssText = target.style.cssText
      image.setAttribute('data-media-kind', 'video-frame')
      target.replaceWith(image)
    } catch {
      // Keep original clone video; html-to-image still has its native video fallback.
    }
  })
}

function copyFormState(source: HTMLElement, clone: HTMLElement) {
  const sourceControls = Array.from(
    source.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input, textarea, select',
    ),
  )
  const cloneControls = Array.from(
    clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input, textarea, select',
    ),
  )
  sourceControls.forEach((control, index) => {
    const target = cloneControls[index]
    if (!target) return
    target.value = control.value
    if (control instanceof HTMLInputElement && target instanceof HTMLInputElement) {
      target.checked = control.checked
    }
  })
}

async function makeExportClone(element: HTMLElement, width: number, timeoutMs: number) {
  const clone = element.cloneNode(true) as HTMLElement
  clone.style.position = 'fixed'
  clone.style.left = '0'
  clone.style.top = '0'
  clone.style.right = 'auto'
  clone.style.bottom = 'auto'
  clone.style.zIndex = '-1'
  clone.style.width = `${width}px`
  clone.style.transform = 'none'
  clone.style.transformOrigin = 'top left'
  clone.style.pointerEvents = 'none'
  clone.style.opacity = '1'
  clone.style.visibility = 'visible'
  document.body.appendChild(clone)
  try {
    copyFormState(element, clone)
    const sourceScrollers = element.querySelectorAll<HTMLElement>('[data-device-scroll]')
    const cloneScrollers = clone.querySelectorAll<HTMLElement>('[data-device-scroll]')
    sourceScrollers.forEach((scroller, index) => {
      const clonedScroller = cloneScrollers[index]
      const content = clonedScroller?.querySelector<HTMLElement>('[data-device-scroll-content]')
      if (!content) return
      // html-to-image reclones nodes and loses scroll offsets; bake the viewed position into the clone.
      clonedScroller.style.overflow = 'hidden'
      content.style.transform = `translateY(${-scroller.scrollTop}px)`
    })
    await inlineBlobImages(element, clone, timeoutMs)
    inlineVideoFrames(element, clone)
    return clone
  } catch (error) {
    clone.remove()
    throw error
  }
}

function normalizeSnapshotError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof Event !== 'undefined' && error instanceof Event)
    return new Error('Không tạo được PNG vì một media trong preview chưa render được.')
  return new Error('Không tạo được PNG. Hãy chờ media tải xong rồi thử lại.')
}

function freezeVideos(element: HTMLElement) {
  const states = Array.from(element.querySelectorAll<HTMLVideoElement>('video')).map((video) => ({
    video,
    paused: video.paused,
    currentTime: video.currentTime,
  }))
  for (const state of states) state.video.pause()
  return () => {
    for (const state of states) {
      if (Number.isFinite(state.currentTime)) {
        try {
          state.video.currentTime = state.currentTime
        } catch {
          // Some browsers reject seeking a detached or not-yet-ready video.
        }
      }
      if (!state.paused) void state.video.play().catch(() => undefined)
    }
  }
}

async function renderPreview(
  element: HTMLElement,
  settings: ReviewRenderSettings,
  timeoutMs: number,
): Promise<{ blob: Blob; width: number; height: number; settings: ReviewRenderSettings }> {
  if (typeof document !== 'undefined')
    await withTimeout(document.fonts?.ready ?? Promise.resolve(), timeoutMs)
  await waitForElementMedia(element, timeoutMs)
  const capturedSettings = captureRenderContext(element, settings)
  const restoreSeek = await seekVideosToTime(element, capturedSettings.videoTimeMs, timeoutMs)
  const restoreVideos = freezeVideos(element)
  // PreviewSurface scales this element for narrow screens. Use its canonical
  // layout dimensions so downloaded PNG does not inherit mobile scale.
  const rect = element.getBoundingClientRect()
  const width = Math.max(1, Math.round(element.offsetWidth || rect.width || element.clientWidth))
  const height = Math.max(
    1,
    Math.round(element.offsetHeight || rect.height || element.clientHeight),
  )
  if (!width || !height) throw new Error('Preview chưa có kích thước để export.')

  let clone: HTMLElement | undefined
  let blob: Blob | null
  try {
    clone = await makeExportClone(element, width, timeoutMs)
    const { toBlob } = await import('html-to-image')
    blob = await withTimeout(
      toBlob(clone, {
        // Local media is inlined above; avoid cacheBust because it breaks blob URLs.
        cacheBust: false,
        pixelRatio: 2,
        width,
        height,
        backgroundColor: '#ffffff',
        style: {
          position: 'relative',
          left: '0',
          top: '0',
          right: 'auto',
          bottom: 'auto',
          opacity: '1',
          visibility: 'visible',
          transform: 'none',
          transformOrigin: 'top left',
          '--review-fit': capturedSettings.fit,
          '--review-focal-x': String(capturedSettings.focalX),
          '--review-focal-y': String(capturedSettings.focalY),
        } as Record<string, string>,
      }),
      timeoutMs,
    ).catch((error: unknown) => {
      throw normalizeSnapshotError(error)
    })
  } finally {
    clone?.remove()
    restoreVideos()
    restoreSeek()
  }
  if (!blob) throw new Error('Không tạo được PNG. Hãy chờ media tải xong rồi thử lại.')
  return { blob, width, height, settings: capturedSettings }
}

export async function exportReview({
  element,
  draft,
  profile,
  settings,
  kind,
  formStage,
  signal,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  packageDeps,
}: ExportArgs): Promise<ReviewExportResult> {
  if (!element) throw new Error('Không tìm thấy vùng preview để export.')
  assertNotAborted(signal)
  const resolvedSettings = {
    ...renderSettings(settings),
    formStage: formStage ?? settings.formStage,
  }
  const preview = await renderPreview(element, resolvedSettings, timeoutMs)
  assertNotAborted(signal)
  const stem = `adcraft-${filenamePart(profile.id)}-review`
  if (kind === 'png') return { blob: preview.blob, filename: `${stem}.png` }

  const { createReviewPackage } = await import('../storage/reviewPackage')
  const packaged = await createReviewPackage(
    {
      draft,
      profile,
      settings: preview.settings,
      preview: preview.blob,
      viewport: { width: preview.width, height: preview.height },
    },
    { ...packageDeps, signal, timeoutMs },
  )
  return { blob: packaged.blob, filename: `${stem}.zip`, manifest: packaged.manifest }
}
