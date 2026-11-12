import { useCallback, useEffect, useRef, useState } from 'react'
import { db, type SessionEndReason, type ShiftRuntime, type ShiftSession } from '../db'
import { BeeCompanion, useBeeScene, useBeeState } from '../bee'
import { useCountdown, remainingOf } from '../lib/useCountdown'
import { useWakeLock } from '../lib/useWakeLock'
import { formatClock } from '../lib/format'
import { usePhotoUrl } from '../lib/useObjectUrl'
import { useSoundscape } from '../lib/settings'
import { haptic, playFinishChime, playIntervalChime, playStepDone, startSoundscape, stopSoundscape } from '../lib/audio'

const CHIME_EVERY_MS = 150_000 // 2.5 minutes

interface Props {
  sessionId: number
  onFinished: () => void
}

export function ActiveShift({ sessionId, onFinished }: Props) {
  const [session, setSession] = useState<ShiftSession | null>(null)

  useEffect(() => {
    let alive = true
    db.sessions.get(sessionId).then(async (s) => {
      if (!alive) return
      if (!s || s.status !== 'active' || !s.runtime) return onFinished()
      // Time ran out while the app was closed: wrap it up without fuss.
      if (remainingOf(s.runtime) <= 0) {
        await finishSession(s, s.runtime, 0, 'timer')
        return onFinished()
      }
      setSession(s)
    })
    return () => {
      alive = false
    }
  }, [sessionId, onFinished])

  if (!session?.runtime) return null
  return <ShiftRunner session={session} runtime={session.runtime} onFinished={onFinished} />
}

async function finishSession(s: ShiftSession, rt: ShiftRuntime, remainingMs: number, reason: SessionEndReason) {
  await db.sessions.update(s.id!, {
    status: 'completed',
    endedAt: Date.now(),
    elapsedMs: Math.min(s.durationMs, s.durationMs - remainingMs),
    endReason: reason,
    stepsCompleted: rt.completed,
    runtime: undefined,
  })
}

function ShiftRunner({ session, runtime, onFinished }: { session: ShiftSession; runtime: ShiftRuntime; onFinished: () => void }) {
  const [queue, setQueue] = useState(runtime.queue)
  const [completed, setCompleted] = useState(runtime.completed)
  const [skipped, setSkipped] = useState(runtime.skipped)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [soundOn, setSoundOn] = useSoundscape()
  const lastChime = useRef(runtime.lastChimeMark)
  const finishing = useRef(false)
  const bee = useBeeState()
  const beforeUrl = usePhotoUrl(session.beforePhotoId)

  const finish = useCallback(
    async (reason: SessionEndReason, remaining: number, done: string[]) => {
      if (finishing.current) return
      finishing.current = true
      stopSoundscape()
      if (reason === 'timer') playFinishChime()
      haptic([60, 80, 60])
      await finishSession(session, { ...runtime, completed: done }, remaining, reason)
      onFinished()
    },
    [session, runtime, onFinished],
  )

  const completedRef = useRef(completed)
  completedRef.current = completed

  const timer = useCountdown({ endTime: runtime.endTime, remainingMs: runtime.remainingMs }, () => {
    void finish('timer', 0, completedRef.current)
  })

  useWakeLock(!timer.paused)
  useBeeScene(timer.paused ? 'idle' : 'encouraging', timer.paused ? 'Paused. Take the breather you need.' : undefined)

  // Gentle chime every 2.5 minutes (the 10:00 bell is handled by finish()).
  const elapsed = session.durationMs - timer.remainingMs
  useEffect(() => {
    const mark = Math.floor(elapsed / CHIME_EVERY_MS)
    if (mark > lastChime.current && elapsed < session.durationMs) {
      // After a long background gap only chime once, not for every missed mark.
      lastChime.current = mark
      playIntervalChime()
      haptic(20)
      bee.say(`${formatClock(timer.remainingMs)} left. You’re doing great.`)
    }
  }, [elapsed, session.durationMs, timer.remainingMs, bee])

  // Persist live state so a reload / killed tab resumes exactly here.
  useEffect(() => {
    if (finishing.current) return
    void db.sessions.update(session.id!, {
      stepsCompleted: completed,
      runtime: { queue, completed, skipped, endTime: timer.state.endTime, remainingMs: timer.state.remainingMs, lastChimeMark: lastChime.current },
    })
  }, [queue, completed, skipped, timer.state, session.id])

  // Soundscape follows the toggle and pauses with the timer.
  useEffect(() => {
    if (soundOn && !timer.paused) startSoundscape()
    else stopSoundscape()
  }, [soundOn, timer.paused])
  useEffect(() => () => stopSoundscape(), [])

  const current = queue[0]

  function done() {
    if (!current || timer.paused) return
    const nextCompleted = [...completed, current]
    const rest = queue.slice(1)
    setCompleted(nextCompleted)
    setQueue(rest)
    playStepDone()
    haptic(30)
    if (rest.length === 0) {
      void finish('all_done', timer.remainingMs, nextCompleted)
    } else {
      bee.pulse('step_complete')
    }
  }

  function skip() {
    if (queue.length < 2 || timer.paused) return
    setQueue([...queue.slice(1), current])
    if (!skipped.includes(current)) setSkipped([...skipped, current])
    haptic(10)
    bee.say('No problem. It’ll wait at the back of the line.')
  }

  const low = timer.remainingMs < 60_000

  return (
    <main className={`safe-pad mx-auto flex min-h-dvh max-w-lg flex-col ${session.lowBattery ? 'bg-[#eef2f8]' : ''}`}>
      {/* Top bar */}
      <header className="flex items-center gap-2">
        <div className={`flex-1 font-black tabular-nums tracking-tight ${low ? 'text-honey-600' : ''} text-5xl`} role="timer" aria-live="off" aria-label={`${formatClock(timer.remainingMs)} remaining`}>
          {formatClock(timer.remainingMs)}
        </div>
        <button
          type="button"
          onClick={() => setSoundOn(!soundOn)}
          className={`flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-sm ${soundOn ? 'bg-white' : 'bg-ink/10'}`}
          aria-label={soundOn ? 'Turn soundscape off' : 'Turn soundscape on'}
          aria-pressed={soundOn}
        >
          {soundOn ? '🔊' : '🔈'}
        </button>
        <button
          type="button"
          onClick={timer.paused ? timer.resume : timer.pause}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm"
          aria-label={timer.paused ? 'Resume' : 'Pause'}
        >
          {timer.paused ? '▶' : '❚❚'}
        </button>
        {beforeUrl && (
          <div className="h-12 w-12 flex-none overflow-hidden rounded-xl border-2 border-white shadow-sm" title="Before photo">
            <img src={beforeUrl} alt="Before (blurred)" className="h-full w-full scale-125 object-cover blur-[6px]" />
          </div>
        )}
      </header>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-honey-400 transition-[width] duration-300" style={{ width: `${(elapsed / session.durationMs) * 100}%` }} />
      </div>

      <div className="mt-4 flex justify-center">
        <BeeCompanion size={110} />
      </div>

      {/* Center stage: exactly one step */}
      <section className="flex flex-1 flex-col justify-center py-4">
        {current && (
          <div key={`${current}-${completed.length}-${queue.length}`} className={`card-in relative rounded-[2rem] bg-white px-6 py-10 text-center shadow-[0_10px_30px_rgba(59,42,10,0.12)] ${timer.paused ? 'opacity-50' : ''}`}>
            {completed.length > 0 && <p className="mb-3 text-sm font-bold text-honey-600">✓ {completed.length} done</p>}
            <p className="text-[clamp(1.75rem,7.5vw,2.5rem)] leading-tight font-black text-ink">{current}</p>
            {timer.paused && <p className="mt-4 font-bold text-ink-soft">Paused</p>}
          </div>
        )}
      </section>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={done}
          disabled={timer.paused}
          className="w-full rounded-3xl bg-honey-400 py-6 text-3xl font-black text-ink shadow-[0_7px_0_rgba(184,119,10,0.9)] transition-transform active:translate-y-[4px] active:shadow-[0_3px_0_rgba(184,119,10,0.9)] disabled:opacity-50"
        >
          Done
        </button>
        <button type="button" onClick={skip} disabled={queue.length < 2 || timer.paused} className="px-4 py-3 font-bold text-ink-soft disabled:opacity-40">
          {queue.length < 2 ? 'Last one!' : 'Skip for now'}
        </button>
        <button
          type="button"
          onClick={() => (confirmEnd ? void finish('user', timer.remainingMs, completed) : setConfirmEnd(true))}
          onBlur={() => setConfirmEnd(false)}
          className="px-3 py-1 text-xs text-ink-soft/80"
        >
          {confirmEnd ? 'Tap again to wrap up now' : 'I’m done for now'}
        </button>
      </div>
    </main>
  )
}
