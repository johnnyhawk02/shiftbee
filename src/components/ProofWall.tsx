import { useLiveQuery } from 'dexie-react-hooks'
import { db, deleteSession, type ShiftSession } from '../db'
import { formatDay, formatDuration } from '../lib/format'
import { usePhotoUrl } from '../lib/useObjectUrl'
import { BeforeAfterSlider } from './BeforeAfterSlider'

export function ProofWall({ onOpen }: { onOpen: (sessionId: number) => void }) {
  const sessions = useLiveQuery(
    () => db.sessions.where('status').equals('completed').reverse().sortBy('endedAt').then((s) => s.slice(0, 40)),
    [],
  )

  if (!sessions) return null

  return (
    <section aria-labelledby="proof-wall">
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 id="proof-wall" className="text-lg font-extrabold">Proof Wall</h2>
        {sessions.length > 0 && <span className="text-sm text-ink-soft">{sessions.length} shift{sessions.length === 1 ? '' : 's'}</span>}
      </div>
      {sessions.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-honey-300 bg-white/50 px-4 py-6 text-center text-ink-soft">
          Finished shifts land here. No pressure, no streaks. Just proof that you did a thing.
        </p>
      ) : (
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {sessions.map((s) => (
            <ProofCard key={s.id} session={s} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  )
}

function ProofCard({ session, onOpen }: { session: ShiftSession; onOpen: (id: number) => void }) {
  const before = usePhotoUrl(session.beforePhotoId)
  const after = usePhotoUrl(session.afterPhotoId)
  const single = after ?? before

  return (
    <article className="w-44 flex-none snap-start overflow-hidden rounded-2xl bg-white shadow-sm">
      {before && after ? (
        <BeforeAfterSlider beforeUrl={before} afterUrl={after} compact className="rounded-none rounded-t-2xl" />
      ) : single ? (
        <img src={single} alt="" className="aspect-[3/4] w-full object-cover" />
      ) : (
        <div className="flex aspect-[3/4] w-full items-center justify-center bg-honey-100 text-5xl">{session.templateIcon}</div>
      )}
      <button type="button" onClick={() => onOpen(session.id!)} className="block w-full px-3 py-2 text-left">
        <span className="block truncate text-sm font-bold">{session.templateName}</span>
        <span className="block text-xs text-ink-soft">
          {formatDay(session.endedAt ?? session.startedAt)} · {formatDuration(session.elapsedMs ?? 0)}
          {session.lowBattery ? ' · 🔋' : ''}
        </span>
      </button>
      <div className="flex justify-end px-2 pb-2">
        <button
          type="button"
          className="rounded-full px-2 py-0.5 text-xs text-ink-soft hover:bg-ink/5"
          onClick={() => {
            if (confirm('Remove this shift and its photos from this device?')) void deleteSession(session.id!)
          }}
        >
          Remove
        </button>
      </div>
    </article>
  )
}
