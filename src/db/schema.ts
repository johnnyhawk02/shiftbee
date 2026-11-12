import Dexie, { type EntityTable } from 'dexie'

export type ShiftCategory = 'home' | 'self_care'

export interface ShiftTemplate {
  id: string
  name: string
  subtitle: string
  icon: string
  category: ShiftCategory
  /** Self-care shifts suggest skipping the Before photo by default. */
  suggestPhoto: boolean
  durationSec: number
  standardSteps: string[]
  lowBatterySteps: string[]
  order: number
  isPreset: boolean
  createdAt: number
  updatedAt: number
}

export type SessionStatus = 'active' | 'completed'
export type SessionEndReason = 'timer' | 'all_done' | 'user'

/** Live state of a shift, persisted so a reload or a killed tab can resume. */
export interface ShiftRuntime {
  queue: string[]
  completed: string[]
  skipped: string[]
  /** Epoch ms when the timer hits 00:00. Null while paused. */
  endTime: number | null
  /** Remaining ms, authoritative while paused. */
  remainingMs: number
  /** Index of the last 2.5-minute chime already played. */
  lastChimeMark: number
}

export interface ShiftSession {
  id?: number
  templateId: string
  templateName: string
  templateIcon: string
  lowBattery: boolean
  status: SessionStatus
  startedAt: number
  endedAt?: number
  durationMs: number
  /** Active time actually spent (pauses excluded). */
  elapsedMs?: number
  endReason?: SessionEndReason
  totalSteps: number
  stepsCompleted: string[]
  beforePhotoId?: number
  afterPhotoId?: number
  runtime?: ShiftRuntime
}

export interface PhotoBlob {
  id?: number
  sessionId?: number
  kind: 'before' | 'after'
  blob: Blob
  width: number
  height: number
  bytes: number
  createdAt: number
}

export interface Setting {
  key: string
  value: unknown
}

export class ShiftBeeDB extends Dexie {
  templates!: EntityTable<ShiftTemplate, 'id'>
  sessions!: EntityTable<ShiftSession, 'id'>
  photos!: EntityTable<PhotoBlob, 'id'>
  settings!: EntityTable<Setting, 'key'>

  constructor() {
    super('shiftbee')
    this.version(1).stores({
      templates: 'id, order, category',
      sessions: '++id, templateId, status, startedAt, endedAt',
      photos: '++id, sessionId, kind, createdAt',
      settings: 'key',
    })
  }
}
