import { useState } from 'react'
import { db, type ShiftTemplate } from '../db'
import { buildSeedTemplates } from '../db/seed'

interface Props {
  template?: ShiftTemplate
  onClose: () => void
}

const toLines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean)

/** Bottom sheet to edit a shift's name and both step lists (one step per line). */
export function TemplateEditor({ template, onClose }: Props) {
  const [name, setName] = useState(template?.name ?? '')
  const [icon, setIcon] = useState(template?.icon ?? '✨')
  const [standard, setStandard] = useState(template?.standardSteps.join('\n') ?? '')
  const [low, setLow] = useState(template?.lowBatterySteps.join('\n') ?? '')
  const [photo, setPhoto] = useState(template?.suggestPhoto ?? true)

  const std = toLines(standard)
  const lb = toLines(low)
  const valid = name.trim() && std.length > 0

  async function save() {
    if (!valid) return
    const now = Date.now()
    if (template) {
      await db.templates.update(template.id, {
        name: name.trim(),
        icon: icon.trim() || template.icon,
        standardSteps: std,
        lowBatterySteps: lb.length ? lb : std.slice(0, 2),
        suggestPhoto: photo,
        updatedAt: now,
      })
    } else {
      const count = await db.templates.count()
      await db.templates.add({
        id: `custom-${now}`,
        name: name.trim(),
        subtitle: 'Your own shift',
        icon: icon.trim() || '✨',
        category: photo ? 'home' : 'self_care',
        suggestPhoto: photo,
        durationSec: 600,
        standardSteps: std,
        lowBatterySteps: lb.length ? lb : std.slice(0, 2),
        order: count,
        isPreset: false,
        createdAt: now,
        updatedAt: now,
      })
    }
    onClose()
  }

  async function resetPreset() {
    const seed = buildSeedTemplates().find((t) => t.id === template?.id)
    if (seed && confirm('Reset this shift to its original steps?')) {
      await db.templates.put({ ...seed, order: template!.order })
      onClose()
    }
  }

  async function remove() {
    if (template && confirm(`Delete “${template.name}”? Past shifts stay on your Proof Wall.`)) {
      await db.templates.delete(template.id)
      onClose()
    }
  }

  const field = 'w-full rounded-xl border-2 border-honey-200 bg-honey-50 px-3 py-2 text-base outline-none focus:border-honey-400'

  return (
    <div className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-ink/40" onClick={onClose}>
      <div
        className="card-in safe-pad max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={template ? 'Edit shift' : 'New shift'}
      >
        <h2 className="mb-4 text-xl font-extrabold">{template ? 'Edit shift' : 'New shift'}</h2>
        <div className="mb-3 flex gap-2">
          <input className={`${field} w-16 text-center text-2xl`} value={icon} onChange={(e) => setIcon(e.target.value)} aria-label="Icon" maxLength={4} />
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Shift name" aria-label="Name" />
        </div>
        <label className="mb-1 block text-sm font-bold">Standard steps <span className="font-normal text-ink-soft">(one per line)</span></label>
        <textarea className={`${field} mb-3 h-40`} value={standard} onChange={(e) => setStandard(e.target.value)} />
        <label className="mb-1 block text-sm font-bold">🔋 Low Battery steps <span className="font-normal text-ink-soft">(bare minimum)</span></label>
        <textarea className={`${field} mb-3 h-24`} value={low} onChange={(e) => setLow(e.target.value)} />
        <label className="mb-5 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={photo} onChange={(e) => setPhoto(e.target.checked)} className="h-5 w-5 accent-honey-500" />
          Suggest a Before photo (turn off for self-care)
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-ink/5 py-3 font-bold">Cancel</button>
          <button type="button" onClick={save} disabled={!valid} className="flex-1 rounded-2xl bg-honey-400 py-3 font-bold disabled:opacity-40">Save</button>
        </div>
        {template && (
          <div className="mt-4 flex justify-center gap-4 text-sm text-ink-soft">
            {template.isPreset && <button type="button" onClick={resetPreset}>Reset to original</button>}
            <button type="button" onClick={remove}>Delete shift</button>
          </div>
        )}
      </div>
    </div>
  )
}
