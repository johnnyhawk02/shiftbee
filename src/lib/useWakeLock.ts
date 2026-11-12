import { useEffect, useState } from 'react'

/** Keep the screen on while `active` is true; re-acquire after the tab becomes visible again. */
export function useWakeLock(active: boolean) {
  const [held, setHeld] = useState(false)
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator

  useEffect(() => {
    if (!active || !supported) return
    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      if (document.visibilityState !== 'visible' || (sentinel && !sentinel.released)) return
      try {
        const s = await navigator.wakeLock.request('screen')
        if (cancelled) {
          s.release()
          return
        }
        sentinel = s
        setHeld(true)
        s.addEventListener('release', () => setHeld(false))
      } catch {
        setHeld(false)
      }
    }

    acquire()
    document.addEventListener('visibilitychange', acquire)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', acquire)
      sentinel?.release().catch(() => {})
      setHeld(false)
    }
  }, [active, supported])

  return { supported, held }
}
