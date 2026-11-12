import { useCallback, useEffect, useRef, useState } from 'react'

export interface CountdownState {
  /** Epoch ms when time runs out, or null while paused. */
  endTime: number | null
  /** Remaining ms; authoritative while paused. */
  remainingMs: number
}

export function remainingOf(s: CountdownState, now = Date.now()) {
  return s.endTime === null ? s.remainingMs : Math.max(0, s.endTime - now)
}

/**
 * Drift-free countdown: remaining time is always derived from `endTime - Date.now()`,
 * so throttled timers in a backgrounded tab never slow the clock. The interval
 * only triggers re-renders.
 */
export function useCountdown(initial: CountdownState, onExpire: () => void) {
  const [state, setState] = useState<CountdownState>(initial)
  const [now, setNow] = useState(() => Date.now())
  const expired = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  const remainingMs = remainingOf(state, now)

  useEffect(() => {
    if (state.endTime === null) return
    const tick = () => setNow(Date.now())
    const id = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [state.endTime])

  useEffect(() => {
    if (remainingMs <= 0 && !expired.current) {
      expired.current = true
      onExpireRef.current()
    }
  }, [remainingMs])

  const pause = useCallback(() => {
    setState((s) => (s.endTime === null ? s : { endTime: null, remainingMs: remainingOf(s) }))
  }, [])

  const resume = useCallback(() => {
    setState((s) => (s.endTime !== null ? s : { endTime: Date.now() + s.remainingMs, remainingMs: s.remainingMs }))
    setNow(Date.now())
  }, [])

  return { state, remainingMs, paused: state.endTime === null, pause, resume }
}
