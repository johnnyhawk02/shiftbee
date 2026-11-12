import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { BEE_ANIMATIONS } from './animations'
import { useBeeState } from './BeeContext'
import { BeePlaceholder } from './BeePlaceholder'
import type { AssetConfig, BeeState, SpriteAsset, VideoAsset } from './types'
import './bee.css'

// Only pulled into the bundle (and network) once a Lottie asset is actually configured.
const LottieSlot = lazy(() => import('./slots/LottieSlot'))

interface Props {
  /** Override the context state (useful for previews/tests). */
  state?: BeeState
  /** Override the speech bubble. Pass null to hide it. */
  message?: string | null
  size?: number
  className?: string
  bubblePosition?: 'top' | 'none'
}

/**
 * The bee mascot. Business logic never talks to animation files directly:
 * screens set a BeeState through useBeeState()/useBeeScene(), and this
 * component resolves it through BEE_ANIMATIONS.
 */
export function BeeCompanion({ state: stateProp, message: messageProp, size = 160, className = '', bubblePosition = 'top' }: Props) {
  const ctx = useBeeState()
  const state = stateProp ?? ctx.state
  const message = messageProp === null ? undefined : (messageProp ?? ctx.message)

  return (
    <div className={`bee-companion flex flex-col items-center ${className}`} style={{ ['--bee-size' as string]: `${size}px` }}>
      {bubblePosition === 'top' && message && (
        <div
          key={message}
          className="bee-bubble mb-3 max-w-[18rem] rounded-2xl bg-white px-4 py-2.5 text-center text-[15px] leading-snug font-semibold text-ink shadow-[0_4px_14px_rgba(59,42,10,0.12)]"
          aria-live="polite"
        >
          {message}
        </div>
      )}
      <div className="bee-stage">
        <BeeAnimation key={state} state={state} asset={BEE_ANIMATIONS[state]} />
      </div>
    </div>
  )
}

function BeeAnimation({ state, asset }: { state: BeeState; asset: AssetConfig }) {
  const [failed, setFailed] = useState(false)
  const fail = useCallback(() => setFailed(true), [])
  const fallback = <BeePlaceholder state={state} />

  if (failed || asset.kind === 'placeholder') return fallback

  switch (asset.kind) {
    case 'lottie':
      return (
        <SlotBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <LottieSlot asset={asset} onError={fail} />
          </Suspense>
        </SlotBoundary>
      )
    case 'video':
      return <VideoSlot asset={asset} onError={fail} />
    case 'sprite':
      return <SpriteSlot asset={asset} onError={fail} />
    case 'rive':
      // To enable: npm i @rive-app/react-canvas, then render
      //   <RiveComponent src={asset.src} stateMachines={asset.stateMachine} artboard={asset.artboard} />
      if (import.meta.env.DEV) console.warn('[BeeCompanion] Rive asset configured but no Rive runtime installed; using placeholder.')
      return fallback
  }
}

function VideoSlot({ asset, onError }: { asset: VideoAsset; onError: () => void }) {
  return (
    <video
      autoPlay
      muted
      playsInline
      loop={asset.loop ?? true}
      poster={asset.poster}
      disablePictureInPicture
      className="pointer-events-none object-contain"
      onError={onError}
    >
      {asset.sources.map((s, i) => (
        <source key={s.src} src={s.src} type={s.type} onError={i === asset.sources.length - 1 ? onError : undefined} />
      ))}
    </video>
  )
}

function SpriteSlot({ asset, onError }: { asset: SpriteAsset; onError: () => void }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const img = new Image()
    img.onload = () => setReady(true)
    img.onerror = onError
    img.src = asset.src
  }, [asset.src, onError])
  if (!ready) return null
  return (
    <div
      className="bee-sprite"
      role="img"
      aria-label="Bee"
      style={{
        backgroundImage: `url(${asset.src})`,
        aspectRatio: `${asset.frameWidth} / ${asset.frameHeight}`,
        ['--frames' as string]: asset.frames,
        ['--dur' as string]: `${asset.frames / asset.fps}s`,
        ['--iter' as string]: asset.loop === false ? 1 : 'infinite',
      }}
    />
  )
}

class SlotBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children
  }
}
