export const BEE_STATES = ['idle', 'encouraging', 'low_battery', 'step_complete', 'shift_finished'] as const
export type BeeState = (typeof BEE_STATES)[number]

/** Use the built-in SVG/CSS placeholder bee. */
export interface PlaceholderAsset {
  kind: 'placeholder'
}

/** Lottie JSON export. `src` is a URL under /public (e.g. '/bee/idle.json') or an imported JSON object. */
export interface LottieAsset {
  kind: 'lottie'
  src: string | object
  loop?: boolean
  speed?: number
}

/**
 * Video export. List a transparent WebM (VP9 alpha) for Chrome/Android and an
 * HEVC-with-alpha MP4 for Safari/iOS; the browser picks the first it can play.
 */
export interface VideoAsset {
  kind: 'video'
  sources: { src: string; type: string }[]
  loop?: boolean
  poster?: string
}

/** Horizontal PNG/WebP sprite sheet (or a single-row PNG sequence stitched together). */
export interface SpriteAsset {
  kind: 'sprite'
  src: string
  frames: number
  fps: number
  frameWidth: number
  frameHeight: number
  loop?: boolean
}

/** Rive export. Needs `npm i @rive-app/react-canvas` and the RiveSlot in BeeCompanion filled in. */
export interface RiveAsset {
  kind: 'rive'
  src: string
  stateMachine?: string
  artboard?: string
}

export type AssetConfig = PlaceholderAsset | LottieAsset | VideoAsset | SpriteAsset | RiveAsset
