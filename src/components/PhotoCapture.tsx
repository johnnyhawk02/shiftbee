import { useId, useState, type ReactNode } from 'react'
import { db } from '../db'
import { compressImage } from '../lib/image'

interface Props {
  kind: 'before' | 'after'
  sessionId?: number
  onCaptured: (photoId: number) => void
  className?: string
  children: ReactNode
}

/** A big button that opens the rear camera, compresses the shot and saves it to IndexedDB. */
export function PhotoCapture({ kind, sessionId, onCaptured, className = '', children }: Props) {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  async function handle(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(undefined)
    try {
      const { blob, width, height } = await compressImage(file)
      const photoId = await db.photos.add({ kind, sessionId, blob, width, height, bytes: blob.size, createdAt: Date.now() })
      onCaptured(photoId as number)
    } catch (e) {
      console.error(e)
      setError('That photo didn’t work. Want to try again, or skip it?')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full">
      <input
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          void handle(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <label htmlFor={id} className={`${className} ${busy ? 'pointer-events-none opacity-70' : ''} cursor-pointer select-none`} aria-busy={busy}>
        {busy ? 'Saving photo…' : children}
      </label>
      {error && <p className="mt-2 text-center text-sm text-red-700">{error}</p>}
    </div>
  )
}
