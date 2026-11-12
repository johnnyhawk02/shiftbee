import type { AssetConfig, BeeState } from './types'

/** App base path ('/' locally, '/shiftbee/' on GitHub Pages). */
export const BASE = import.meta.env.BASE_URL

/**
 * The single place to swap in the final Fable 5.2 bee exports.
 *
 * Drop files into /public/bee/ and change an entry. Prefix paths with BASE (the app may be served
 * from a sub-path such as GitHub Pages), e.g.
 *   idle: { kind: 'lottie', src: `${BASE}bee/idle.json`, loop: true },
 *   shift_finished: {
 *     kind: 'video',
 *     sources: [
 *       { src: `${BASE}bee/shift_finished.webm`, type: 'video/webm' },
 *       { src: `${BASE}bee/shift_finished.mov`, type: 'video/mp4; codecs="hvc1"' },
 *     ],
 *   },
 *   step_complete: { kind: 'sprite', src: `${BASE}bee/step_complete.png`, frames: 24, fps: 24, frameWidth: 256, frameHeight: 256, loop: false },
 *
 * Anything that fails to load falls back to the placeholder automatically.
 */
export const BEE_ANIMATIONS: Record<BeeState, AssetConfig> = {
  idle: { kind: 'placeholder' },
  encouraging: { kind: 'placeholder' },
  low_battery: { kind: 'placeholder' },
  step_complete: { kind: 'placeholder' },
  shift_finished: { kind: 'placeholder' },
}

/** How long the transient one-shot states play before the bee returns to its base state. */
export const BEE_TRANSIENT_MS: Partial<Record<BeeState, number>> = {
  step_complete: 1300,
}
