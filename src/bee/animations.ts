import type { AssetConfig, BeeState } from './types'

/**
 * The single place to swap in the final Fable 5.2 bee exports.
 *
 * Drop files into /public/bee/ and change an entry, e.g.
 *   idle: { kind: 'lottie', src: '/bee/idle.json', loop: true },
 *   shift_finished: {
 *     kind: 'video',
 *     sources: [
 *       { src: '/bee/shift_finished.webm', type: 'video/webm' },
 *       { src: '/bee/shift_finished.mov', type: 'video/mp4; codecs="hvc1"' },
 *     ],
 *   },
 *   step_complete: { kind: 'sprite', src: '/bee/step_complete.png', frames: 24, fps: 24, frameWidth: 256, frameHeight: 256, loop: false },
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
