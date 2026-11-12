import type { BeeState } from './types'

/** Compassionate, no-guilt copy. Never mention streaks, failure or "should". */
export const BEE_COPY: Record<BeeState, string[]> = {
  idle: [
    'Hi! Pick a tiny shift whenever you’re ready.',
    'Ten minutes is plenty. Stop when the bell rings.',
    'No pressure. Small is still something.',
    'Whatever you do today counts.',
  ],
  encouraging: [
    'Just one tiny thing at a time.',
    'You’re doing it. That’s the hard part.',
    'Good enough is great.',
    'Slow and steady is still moving.',
    'Skipping is allowed. It’ll wait at the back.',
    'I’m buzzing along with you.',
  ],
  low_battery: [
    'Low battery days are allowed. Bare minimum is enough.',
    'Let’s just do the survival basics. Be gentle with you.',
    'Tiny steps only today. That still counts.',
  ],
  step_complete: ['Nice one!', 'Done! Look at you.', 'Buzz buzz, that’s one.', 'Yes! One less thing.', 'Lovely.'],
  shift_finished: [
    'Bell rang, shift’s done. You showed up and that matters.',
    'Look what ten minutes did!',
    'That’s a whole shift. Go have a sit down.',
    'Whatever got done is a win.',
  ],
}

const lastPick: Partial<Record<BeeState, number>> = {}

/** Random line for a state, never the same twice in a row. */
export function pickCopy(state: BeeState): string {
  const lines = BEE_COPY[state]
  if (lines.length === 1) return lines[0]
  let i = Math.floor(Math.random() * lines.length)
  if (i === lastPick[state]) i = (i + 1) % lines.length
  lastPick[state] = i
  return lines[i]
}
