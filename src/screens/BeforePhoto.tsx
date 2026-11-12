import { useEffect, useRef, useState } from 'react'
import { db, type ShiftRuntime, type ShiftTemplate } from '../db'
import { BeeCompanion, useBeeScene } from '../bee'
import { PhotoCapture } from '../components/PhotoCapture'
import { usePhotoUrl } from '../lib/useObjectUrl'
import { useLowBattery } from '../lib/settings'
import { playStepDone, startSoundscape, unlockAudio } from '../lib/audio'
import { getSetting } from '../db'

interface Props {
  template: ShiftTemplate
  onBack: () => void
  onStarted: (sessionId: number) => void
}

export function BeforePhoto({ template, onBack, onStarted }: Props) {
  const [lowBattery] = useLowBattery()
  const [photoId, setPhotoId] = useState<number>()
  const photoUrl = usePhotoUrl(photoId)
  const started = useRef(false)
  const photoRef = useRef<number | undefined>(undefined)
  photoRef.current = photoId

  useBeeScene(
    lowBattery ? 'low_battery' : 'idle',
    template.suggestPhoto ? 'Snap the mess as it is. No judgement, it’s just for the glow-up later.' : 'Self-care shift. Photo totally optional.',
  )

  // If the user backs out, don't leave an orphan photo behind.
  useEffect(
    () => () => {
      if (!started.current && photoRef.current) void db.photos.delete(photoRef.current)
    },
    [],
  )

  async function replacePhoto(id: number) {
    if (photoId) await db.photos.delete(photoId)
    setPhotoId(id)
  }

  async function start() {
    await unlockAudio()
    const steps = lowBattery ? template.lowBatterySteps : template.standardSteps
    const durationMs = template.durationSec * 1000
    const runtime: ShiftRuntime = {
      queue: [...steps],
      completed: [],
      skipped: [],
      endTime: Date.now() + durationMs,
      remainingMs: durationMs,
      lastChimeMark: 0,
    }
    const sessionId = (await db.transaction('rw', db.sessions, db.photos, async () => {
      const id = await db.sessions.add({
        templateId: template.id,
        templateName: template.name,
        templateIcon: template.icon,
        lowBattery,
        status: 'active',
        startedAt: Date.now(),
        durationMs,
        totalSteps: steps.length,
        stepsCompleted: [],
        beforePhotoId: photoId,
        runtime,
      })
      if (photoId) await db.photos.update(photoId, { sessionId: id as number })
      return id
    })) as number
    started.current = true
    if (await getSetting('soundscape', true)) startSoundscape()
    playStepDone()
    onStarted(sessionId)
  }

  const bigBtn = 'flex w-full items-center justify-center gap-2 rounded-3xl px-6 py-5 text-xl font-extrabold shadow-[0_6px_0_rgba(59,42,10,0.18)] active:translate-y-[3px] active:shadow-[0_3px_0_rgba(59,42,10,0.18)] transition-transform'

  return (
    <main className="safe-pad mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">
          ← Back
        </button>
        <div className="min-w-0">
          <p className="truncate font-extrabold">
            {template.icon} {template.name}
          </p>
          {lowBattery && <p className="text-xs font-semibold text-night">🔋 Low Battery Mode</p>}
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
        {photoUrl ? (
          <div className="card-in w-full max-w-xs">
            <img src={photoUrl} alt="Your Before photo" className="aspect-[3/4] w-full rounded-3xl object-cover shadow-lg" />
            <p className="mt-2 text-center text-sm text-ink-soft">Before photo saved on this device.</p>
          </div>
        ) : (
          <BeeCompanion size={170} />
        )}
      </div>

      <div className="flex flex-col gap-3">
        {photoUrl ? (
          <>
            <button type="button" onClick={start} className={`${bigBtn} bg-honey-400 text-ink`}>
              Start 10 minutes
            </button>
            <PhotoCapture kind="before" onCaptured={replacePhoto} className="block w-full py-2 text-center font-bold text-ink-soft">
              Retake photo
            </PhotoCapture>
          </>
        ) : (
          <>
            <PhotoCapture
              kind="before"
              onCaptured={replacePhoto}
              className={`${bigBtn} ${template.suggestPhoto ? 'bg-honey-400 text-ink' : 'bg-white text-ink'}`}
            >
              📸 Snap a Before photo
            </PhotoCapture>
            <button
              type="button"
              onClick={start}
              className={template.suggestPhoto ? 'py-3 text-center font-bold text-ink-soft' : `${bigBtn} bg-honey-400 text-ink`}
            >
              {template.suggestPhoto ? 'Skip photo, just start' : 'Skip photo and start'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
