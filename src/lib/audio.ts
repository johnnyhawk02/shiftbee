/**
 * All sound is synthesised with the Web Audio API: no audio files.
 * The AudioContext must be created/resumed from a user gesture (iOS),
 * so call `unlockAudio()` from the "Start shift" tap.
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noise: { src: AudioBufferSourceNode; gain: GainNode } | null = null

function getCtx(): AudioContext | null {
  if (ctx) return ctx
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0.9
  master.connect(ctx.destination)
  return ctx
}

export async function unlockAudio() {
  const c = getCtx()
  if (c && c.state !== 'running') {
    try {
      await c.resume()
    } catch {
      /* ignore */
    }
  }
}

function brownNoiseBuffer(c: AudioContext, seconds = 6): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    let last = 0
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
    // Crossfade the loop seam so there is no click.
    const fade = Math.floor(c.sampleRate * 0.05)
    for (let i = 0; i < fade; i++) {
      const t = i / fade
      data[len - fade + i] = data[len - fade + i] * (1 - t) + data[i] * t
    }
  }
  return buf
}

export function startSoundscape() {
  const c = getCtx()
  if (!c || !master || noise) return
  const src = c.createBufferSource()
  src.buffer = brownNoiseBuffer(c)
  src.loop = true
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 900
  const gain = c.createGain()
  gain.gain.setValueAtTime(0, c.currentTime)
  gain.gain.linearRampToValueAtTime(0.22, c.currentTime + 1.5)
  src.connect(lp).connect(gain).connect(master)
  src.start()
  noise = { src, gain }
}

export function stopSoundscape() {
  if (!ctx || !noise) return
  const { src, gain } = noise
  noise = null
  const t = ctx.currentTime
  gain.gain.cancelScheduledValues(t)
  gain.gain.setValueAtTime(gain.gain.value, t)
  gain.gain.linearRampToValueAtTime(0, t + 0.6)
  src.stop(t + 0.7)
}

function bell(freq: number, start: number, dur: number, peak: number) {
  const c = ctx!
  // A soft bell: fundamental plus a couple of inharmonic partials.
  const partials: [number, number][] = [
    [1, 1],
    [2.76, 0.35],
    [5.4, 0.12],
  ]
  for (const [ratio, amp] of partials) {
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq * ratio
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, start)
    g.gain.exponentialRampToValueAtTime(peak * amp, start + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur / ratio ** 0.5)
    osc.connect(g).connect(master!)
    osc.start(start)
    osc.stop(start + dur + 0.1)
  }
}

/** Gentle single chime for each 2.5-minute mark. */
export function playIntervalChime() {
  const c = getCtx()
  if (!c) return
  bell(784, c.currentTime + 0.02, 2.2, 0.18)
}

/** Warm three-note chime when the 10 minutes are up. */
export function playFinishChime() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime + 0.02
  bell(523.25, t, 2.8, 0.2)
  bell(659.25, t + 0.28, 2.8, 0.18)
  bell(783.99, t + 0.56, 3.4, 0.2)
}

/** Tiny "pop" when a micro-step is marked done. */
export function playStepDone() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  const osc = c.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(660, t)
  osc.frequency.exponentialRampToValueAtTime(1320, t + 0.09)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
  osc.connect(g).connect(master!)
  osc.start(t)
  osc.stop(t + 0.3)
}

export function haptic(pattern: number | number[] = 25) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* unsupported */
  }
}
