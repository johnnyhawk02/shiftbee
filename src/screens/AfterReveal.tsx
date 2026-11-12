import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { BeeCompanion, useBeeScene } from '../bee'
import { PhotoCapture } from '../components/PhotoCapture'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'
import { formatDay, formatDuration } from '../lib/format'
import { usePhotoUrl } from '../lib/useObjectUrl'

interface Props {
  sessionId: number
  fromHistory?: boolean
  onHome: () => void
}

export function AfterReveal({ sessionId, fromHistory, onHome }: Props) {
  const session = useLiveQuery(() => db.sessions.get(sessionId), [sessionId])
  const [skippedAfter, setSkippedAfter] = useState(false)
  const beforeUrl = usePhotoUrl(session?.beforePhotoId)
  const afterUrl = usePhotoUrl(session?.afterPhotoId)

  const needsAfter = !fromHistory && !!session?.beforePhotoId && !session.afterPhotoId && !skippedAfter

  useBeeScene(
    needsAfter ? 'encouraging' : 'shift_finished',
    needsAfter ? 'Bell’s rung! Snap the After shot from the same spot.' : undefined,
  )

  if (!session) return null

  const bigBtn = 'flex w-full items-center justify-center gap-2 rounded-3xl px-6 py-5 text-xl font-extrabold shadow-[0_6px_0_rgba(59,42,10,0.18)] active:translate-y-[3px] transition-transform'

  if (needsAfter) {
    return (
      <main className="safe-pad mx-auto flex min-h-dvh max-w-lg flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <BeeCompanion size={150} />
          {beforeUrl && (
            <div className="w-40">
              <img src={beforeUrl} alt="Before" className="aspect-[3/4] w-full rounded-2xl object-cover opacity-90 shadow" />
              <p className="mt-1 text-center text-xs text-ink-soft">Match this angle</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <PhotoCapture
            kind="after"
            sessionId={session.id}
            onCaptured={(id) => void db.sessions.update(session.id!, { afterPhotoId: id })}
            className={`${bigBtn} bg-honey-400 text-ink`}
          >
            📸 Snap the After photo
          </PhotoCapture>
          <button type="button" onClick={() => setSkippedAfter(true)} className="py-3 font-bold text-ink-soft">
            Skip photo
          </button>
        </div>
      </main>
    )
  }

  const elapsed = formatDuration(session.elapsedMs ?? 0)
  const headline =
    session.endReason === 'all_done' ? 'Every step done!' : session.endReason === 'timer' ? 'Bell rang. Shift complete!' : 'Shift wrapped up!'

  return (
    <main className="safe-pad mx-auto flex min-h-dvh max-w-lg flex-col gap-5">
      {fromHistory && (
        <button type="button" onClick={onHome} className="self-start rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">
          ← Back
        </button>
      )}
      <div className="flex flex-col items-center pt-2">
        <BeeCompanion size={fromHistory ? 120 : 160} message={fromHistory ? null : undefined} />
        <h1 className="mt-3 text-center text-3xl font-black">{fromHistory ? session.templateName : headline}</h1>
        <p className="mt-1 text-center text-lg font-semibold text-ink-soft">
          {fromHistory ? `${formatDay(session.endedAt ?? session.startedAt)} · ` : ''}Completed in {elapsed}
        </p>
      </div>

      {beforeUrl && afterUrl ? (
        <div className="card-in">
          <BeforeAfterSlider beforeUrl={beforeUrl} afterUrl={afterUrl} />
          <p className="mt-2 text-center text-sm text-ink-soft">Drag to wipe between Before and After</p>
        </div>
      ) : (
        (beforeUrl || afterUrl) && <img src={afterUrl ?? beforeUrl} alt="" className="card-in aspect-[3/4] w-full rounded-2xl object-cover" />
      )}

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-extrabold">
          {session.stepsCompleted.length === 0
            ? 'You showed up. That’s the whole thing.'
            : `You did ${session.stepsCompleted.length} thing${session.stepsCompleted.length === 1 ? '' : 's'}:`}
        </h2>
        <ul className="flex flex-col gap-1.5">
          {session.stepsCompleted.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-honey-500">✓</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
        {session.lowBattery && <p className="mt-3 text-sm font-semibold text-night">🔋 Done on a low-battery day. Extra credit.</p>}
      </section>

      {!fromHistory && (
        <button type="button" onClick={onHome} className={`${bigBtn} mt-auto bg-honey-400 text-ink`}>
          Back to the hive
        </button>
      )}
    </main>
  )
}
