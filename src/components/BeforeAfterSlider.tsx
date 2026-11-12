import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

interface Props {
  beforeUrl: string
  afterUrl: string
  className?: string
  compact?: boolean
}

/** Drag the handle to wipe between the Before and After photo. */
export function BeforeAfterSlider({ beforeUrl, afterUrl, className = '', compact = false }: Props) {
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const update = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }

  const onDown = (e: PointerEvent) => {
    dragging.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    update(e.clientX)
  }
  const onMove = (e: PointerEvent) => dragging.current && update(e.clientX)
  const onUp = () => (dragging.current = false)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5))
    if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5))
  }

  return (
    <div
      ref={ref}
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-ink/10 select-none ${className}`}
      style={{ touchAction: 'pan-y' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      role="slider"
      tabIndex={0}
      aria-label="Before and after comparison"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      onKeyDown={onKey}
    >
      <img src={afterUrl} alt="After" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <img
        src={beforeUrl}
        alt="Before"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-white shadow-[0_0_8px_rgba(0,0,0,.35)]" style={{ left: `${pos}%` }}>
        <div className={`absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lg ${compact ? 'h-7 w-7 text-xs' : 'h-11 w-11 text-base'}`}>
          ⇆
        </div>
      </div>
      {!compact && (
        <>
          <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-xs font-bold text-white">Before</span>
          <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/45 px-2.5 py-1 text-xs font-bold text-white">After</span>
        </>
      )}
    </div>
  )
}
