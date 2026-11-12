import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { BEE_TRANSIENT_MS } from './animations'
import { pickCopy } from './copy'
import type { BeeState } from './types'

interface BeeCtx {
  /** What the bee is showing right now (a transient state wins over the base state). */
  state: BeeState
  message?: string
  /** The resting state for the current screen. */
  setBase: (state: BeeState, message?: string) => void
  /** Play a one-shot state (e.g. step_complete), then return to the base state. */
  pulse: (state: BeeState, opts?: { message?: string; durationMs?: number }) => void
  say: (message: string | undefined) => void
}

const Ctx = createContext<BeeCtx | null>(null)

export function BeeProvider({ children }: { children: ReactNode }) {
  const [base, setBaseState] = useState<{ state: BeeState; message?: string }>({ state: 'idle' })
  const [transient, setTransient] = useState<{ state: BeeState; message?: string } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const setBase = useCallback((state: BeeState, message?: string) => {
    setBaseState({ state, message: message ?? pickCopy(state) })
  }, [])

  const pulse = useCallback<BeeCtx['pulse']>((state, opts) => {
    window.clearTimeout(timer.current)
    setTransient({ state, message: opts?.message ?? pickCopy(state) })
    timer.current = window.setTimeout(() => setTransient(null), opts?.durationMs ?? BEE_TRANSIENT_MS[state] ?? 1200)
  }, [])

  const say = useCallback((message: string | undefined) => setBaseState((b) => ({ ...b, message })), [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const value = useMemo<BeeCtx>(() => {
    const cur = transient ?? base
    return { state: cur.state, message: cur.message, setBase, pulse, say }
  }, [base, transient, setBase, pulse, say])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useBeeState() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useBeeState must be used inside <BeeProvider>')
  return ctx
}

/** Declare the bee's resting state for a screen. Re-runs when `state` changes. */
export function useBeeScene(state: BeeState, message?: string) {
  const { setBase } = useBeeState()
  useEffect(() => {
    setBase(state, message)
  }, [state, message, setBase])
}
