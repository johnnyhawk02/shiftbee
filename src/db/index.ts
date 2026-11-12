import { ShiftBeeDB } from './schema'
import { buildSeedTemplates } from './seed'

export * from './schema'

export const db = new ShiftBeeDB()

// Seed the editable preset templates the very first time the database is created.
db.on('populate', (tx) => {
  tx.table('templates').bulkAdd(buildSeedTemplates())
})

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.settings.get(key)
  return row ? (row.value as T) : fallback
}

export function setSetting(key: string, value: unknown) {
  return db.settings.put({ key, value })
}

/** Remove a session and its photos together. */
export async function deleteSession(id: number) {
  await db.transaction('rw', db.sessions, db.photos, async () => {
    await db.photos.where('sessionId').equals(id).delete()
    await db.sessions.delete(id)
  })
}
