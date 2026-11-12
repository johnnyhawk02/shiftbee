import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type ShiftTemplate } from '../db'
import { BeeCompanion, useBeeScene } from '../bee'
import { Toggle } from '../components/Toggle'
import { ProofWall } from '../components/ProofWall'
import { TemplateEditor } from '../components/TemplateEditor'
import { InstallButton } from '../components/InstallButton'
import { useLowBattery } from '../lib/settings'

interface Props {
  onPick: (t: ShiftTemplate) => void
  onOpenSession: (id: number) => void
}

export function Home({ onPick, onOpenSession }: Props) {
  const [lowBattery, setLowBattery] = useLowBattery()
  const templates = useLiveQuery(() => db.templates.orderBy('order').toArray(), [])
  const [editing, setEditing] = useState<ShiftTemplate | 'new' | null>(null)

  useBeeScene(lowBattery ? 'low_battery' : 'idle')

  useEffect(() => {
    document.body.classList.toggle('low-battery', lowBattery)
  }, [lowBattery])

  return (
    <main className="safe-pad mx-auto flex min-h-dvh max-w-lg flex-col gap-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">
          Shift<span className="text-honey-500">Bee</span>
        </h1>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-ink-soft">🔒 On this device only</span>
      </header>

      <InstallButton />

      <BeeCompanion size={150} />

      <Toggle
        checked={lowBattery}
        onChange={setLowBattery}
        icon="🔋"
        label="Low Battery Mode"
        description={lowBattery ? 'Bare-minimum steps only. That counts.' : 'For low-energy days. Just the basics.'}
      />

      <section aria-labelledby="pick-shift">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 id="pick-shift" className="text-lg font-extrabold">Pick a 10-minute shift</h2>
          <button type="button" className="text-sm font-bold text-honey-600" onClick={() => setEditing('new')}>
            + New
          </button>
        </div>
        <ul className="flex flex-col gap-2.5">
          {templates?.map((t) => {
            const steps = lowBattery ? t.lowBatterySteps : t.standardSteps
            return (
              <li key={t.id} className="flex items-stretch overflow-hidden rounded-2xl bg-white shadow-sm">
                <button type="button" onClick={() => onPick(t)} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 text-left active:bg-honey-50">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-honey-100 text-2xl" aria-hidden>
                    {t.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-bold">{t.name}</span>
                    <span className="block truncate text-sm text-ink-soft">
                      {steps.length} tiny step{steps.length === 1 ? '' : 's'} · {t.subtitle}
                    </span>
                  </span>
                  <span className="text-xl text-honey-500" aria-hidden>▶</span>
                </button>
                <button type="button" onClick={() => setEditing(t)} className="px-3 text-ink-soft active:bg-honey-50" aria-label={`Edit ${t.name}`}>
                  ✎
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <ProofWall onOpen={onOpenSession} />

      {editing && <TemplateEditor template={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </main>
  )
}
