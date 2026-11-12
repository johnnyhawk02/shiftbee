export interface CompressedImage {
  blob: Blob
  width: number
  height: number
}

const MAX_WIDTH = 900
const TARGET_BYTES = 220 * 1024

async function decode(file: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if ('createImageBitmap' in window) {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() }
    } catch {
      // fall through to <img> decoding (older Safari, HEIC edge cases)
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} }
  } finally {
    URL.revokeObjectURL(url)
  }
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas encoding failed'))), 'image/jpeg', quality),
  )
}

/**
 * Downscale a camera photo to max 900px wide and encode JPEG at 0.75,
 * stepping quality down a little if the result is still far over ~200KB.
 */
export async function compressImage(file: Blob): Promise<CompressedImage> {
  const { source, width, height, close } = await decode(file)
  const scale = Math.min(1, MAX_WIDTH / width)
  const w = Math.round(width * scale)
  const h = Math.round(height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, w, h)
  close()

  let quality = 0.75
  let blob = await toBlob(canvas, quality)
  while (blob.size > TARGET_BYTES && quality > 0.5) {
    quality -= 0.08
    blob = await toBlob(canvas, quality)
  }
  canvas.width = canvas.height = 0
  return { blob, width: w, height: h }
}
