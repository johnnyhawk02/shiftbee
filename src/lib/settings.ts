import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback } from 'react'
import { db, setSetting } from '../db'

function useSetting<T>(key: string, fallback: T): [T, (v: T) => void, boolean] {
  const row = useLiveQuery(() => db.settings.get(key), [key], null)
  const loaded = row !== null
  const value = row ? (row.value as T) : fallback
  const set = useCallback((v: T) => void setSetting(key, v), [key])
  return [value, set, loaded]
}

export const useLowBattery = () => useSetting('lowBattery', false)
export const useSoundscape = () => useSetting('soundscape', true)
