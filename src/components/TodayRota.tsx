import { useLiveQuery } from 'dexie-react-hooks'
import { db, type ShiftTemplate } from '../db'
import { DAY_NAMES, startOfToday, useRota } from '../lib/rota'

interface Props {
  templates: ShiftTemplate[] | undefined
  lowBattery: boolean
  onPick: (t: ShiftTemplate) => void
  onOpenRota: () => void
}

/** Home-screen card showing what the weekly rota suggests for today. */
export function TodayRota({ templates, lowBattery, onPick, onOpenRota }: Props) {
  const [rota] = useRota()
  const day = new Date().getDay()
  const doneToday = useLiveQuery(
    () =>
      db.sessions
        .where('endedAt')
        .aboveOrEqual(startOfToday())
        .filter((s) => s.status === 'completed')
        .toArray()
        .then((s) => new Set(s.map((x) => x.templateId))),
    [],
  )

  if (!rota || !templates) return null
  const byId = new Map(templates.map((t) => [t.id, t]))
  const today = rota[day].map((id) => byId.get(id)).filter((t): t is ShiftTemplate => !!t)

  return (
    <section aria-labelledby="today-rota">
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 id="today-rota" className="text-lg font-extrabold">
          Today <span className="font-semibold text-ink-soft">· {DAY_NAMES[day]}</span>
        </h2>
        <button type="button" className="text-sm font-bold text-honey-600" onClick={onOpenRota}>
          Weekly rota ›
        </button>
      </div>
      {today.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-honey-300 bg-white/50 px-4 py-4 text-center text-ink-soft">
          Nothing on the rota today. Rest counts too. Pick any shift below if you fancy one.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {today.map((t) => {
            const done = doneToday?.has(t.id)
            const steps = lowBattery ? t.lowBatterySteps : t.standardSteps
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onPick(t)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-honey-300 px-4 py-3.5 text-left shadow-sm active:bg-honey-400"
                >
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-white/70 text-2xl" aria-hidden>
                    {t.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-bold">{t.name}</span>
                    <span className="block truncate text-sm text-ink/70">
                      {done ? 'Done today. Nice one!' : `${steps.length} tiny step${steps.length === 1 ? '' : 's'} · on today’s rota`}
                    </span>
                  </span>
                  <span className="text-xl" aria-hidden>{done ? '✓' : '▶'}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
