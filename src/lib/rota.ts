import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback } from 'react'
import { db, setSetting } from '../db'

/** Shift template ids planned for each weekday. Index 0 is Sunday, matching Date.getDay(). */
export type Rota = string[][]

/** Weekday indexes in the order the rota page shows them (Monday first). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** A gentle starting point: one room a day, Sunday off. */
export const DEFAULT_ROTA: Rota = [
  [], // Sunday: rest day
  ['quick-bathroom-wipe'], // Monday
  ['kitchen-triage'], // Tuesday
  ['bedroom-floor-reset'], // Wednesday
  ['chloes-bedroom'], // Thursday
  ['kitchen-triage'], // Friday
  ['quick-bathroom-wipe'], // Saturday
]

const KEY = 'rota'

function normalise(value: unknown): Rota {
  if (!Array.isArray(value) || value.length !== 7) return DEFAULT_ROTA
  return value.map((d) => (Array.isArray(d) ? d.filter((x): x is string => typeof x === 'string') : []))
}

/** The weekly rota, plus a setter that saves it. `undefined` while loading. */
export function useRota(): [Rota | undefined, (r: Rota) => void] {
  const row = useLiveQuery(() => db.settings.get(KEY).then((r) => r ?? { key: KEY, value: null }), [])
  const rota = row === undefined ? undefined : row.value == null ? DEFAULT_ROTA : normalise(row.value)
  const save = useCallback((r: Rota) => void setSetting(KEY, r), [])
  return [rota, save]
}

export function resetRota() {
  return db.settings.delete(KEY)
}

export function startOfToday(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}
