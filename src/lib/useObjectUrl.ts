import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function useObjectUrl(blob: Blob | undefined | null) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!blob) {
      setUrl(undefined)
      return
    }
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}

/** Load a stored photo from IndexedDB and expose it as an object URL. */
export function usePhotoUrl(id: number | undefined) {
  const photo = useLiveQuery(() => (id ? db.photos.get(id) : undefined), [id])
  return useObjectUrl(photo?.blob)
}
