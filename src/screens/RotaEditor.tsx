import { useLiveQuery } from 'dexie-react-hooks'
import { db, type ShiftTemplate } from '../db'
import { DAY_NAMES, WEEK_ORDER, resetRota, useRota, type Rota } from '../lib/rota'

/** Separate page for planning which shifts happen on which day of the week. */
export function RotaEditor({ onBack }: { onBack: () => void }) {
  const [rota, saveRota] = useRota()
  const templates = useLiveQuery(() => db.templates.orderBy('order').toArray(), [])
  const today = new Date().getDay()

  if (!rota || !templates) return null
  const byId = new Map(templates.map((t) => [t.id, t]))

  function update(day: number, ids: string[]) {
    const next: Rota = rota!.map((d, i) => (i === day ? ids : d))
    saveRota(next)
  }

  return (
    <main className="safe-pad mx-auto flex min-h-dvh max-w-lg flex-col gap-4">
      <header className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-bold" aria-label="Back to home">
          ‹ Back
        </button>
        <h1 className="text-2xl font-black tracking-tight">Weekly rota</h1>
      </header>
      <p className="px-1 text-sm text-ink-soft">
        Plan a shift or two for each day. It’s a suggestion, not a rule: miss a day and nothing happens. Leave a day empty for a rest day.
      </p>

      <ul className="flex flex-col gap-2.5">
        {WEEK_ORDER.map((day) => {
          const ids = rota[day].filter((id) => byId.has(id))
          const available = templates.filter((t) => !ids.includes(t.id))
          return (
            <li key={day} className={`rounded-2xl bg-white px-4 py-3 shadow-sm ${day === today ? 'ring-2 ring-honey-400' : ''}`}>
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="font-extrabold">{DAY_NAMES[day]}</h2>
                {day === today && <span className="text-xs font-bold text-honey-600">Today</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {ids.length === 0 && <span className="py-1.5 text-sm text-ink-soft">Rest day 😴</span>}
                {ids.map((id) => (
                  <Chip key={id} template={byId.get(id)!} onRemove={() => update(day, ids.filter((x) => x !== id))} />
                ))}
                {available.length > 0 && (
                  <select
                    aria-label={`Add a shift to ${DAY_NAMES[day]}`}
                    value=""
                    onChange={(e) => e.target.value && update(day, [...ids, e.target.value])}
                    className="rounded-full border-2 border-dashed border-honey-300 bg-honey-50 px-3 py-1.5 text-sm font-bold text-honey-600"
                  >
                    <option value="">+ Add</option>
                    {available.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        className="mx-auto text-sm text-ink-soft"
        onClick={() => confirm('Go back to the suggested rota?') && void resetRota()}
      >
        Reset to suggested rota
      </button>
    </main>
  )
}

function Chip({ template, onRemove }: { template: ShiftTemplate; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-honey-100 py-1.5 pl-3 pr-1 text-sm font-bold">
      <span aria-hidden>{template.icon}</span>
      {template.name}
      <button type="button" onClick={onRemove} className="ml-0.5 rounded-full px-2 text-ink-soft active:bg-honey-200" aria-label={`Remove ${template.name}`}>
        ✕
      </button>
    </span>
  )
}
