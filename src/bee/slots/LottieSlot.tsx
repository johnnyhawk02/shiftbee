import { useEffect, useState } from 'react'
import { Lottie } from 'lottie-react'
import type { LottieAsset } from '../types'

const cache = new Map<string, Promise<object>>()

// Fetch the JSON ourselves so a missing/broken file falls back to the placeholder bee.
function loadJson(url: string) {
  let p = cache.get(url)
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`Lottie ${url}: ${r.status}`)
      return r.json()
    })
    p.catch(() => cache.delete(url))
    cache.set(url, p)
  }
  return p
}

export default function LottieSlot({ asset, onError }: { asset: LottieAsset; onError: () => void }) {
  const [data, setData] = useState<object | null>(typeof asset.src === 'object' ? asset.src : null)

  useEffect(() => {
    if (typeof asset.src !== 'string') {
      setData(asset.src)
      return
    }
    let alive = true
    loadJson(asset.src).then(
      (json) => alive && setData(json),
      () => alive && onError(),
    )
    return () => {
      alive = false
    }
  }, [asset.src, onError])

  if (!data) return null
  return <Lottie src={data} loop={asset.loop ?? true} speed={asset.speed ?? 1} autoplay style={{ width: '100%', height: '100%' }} />
}
