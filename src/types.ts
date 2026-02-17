import type { KPIKey } from './data/gameData'

// ── Resource Allocation ──
export type ResourceChannel = 'it' | 'comms' | 'ops' | 'people'

export interface ResourceAllocation {
  it: number
  comms: number
  ops: number
  people: number
}

export const CHANNEL_KPI_MAP: Record<ResourceChannel, KPIKey> = {
  it: 'regulatory',
  comms: 'reputation',
  ops: 'revenue',
  people: 'morale',
}

export const CHANNEL_META: Record<ResourceChannel, { label: string; icon: string; color: string }> = {
  it:     { label: 'IT & Security',   icon: '🔒', color: '#b388ff' },
  comms:  { label: 'Communications',  icon: '📡', color: '#00e5ff' },
  ops:    { label: 'Operations',      icon: '⚙️', color: '#00e676' },
  people: { label: 'People',          icon: '👥', color: '#ffab00' },
}

export const RESOURCE_CHANNELS: ResourceChannel[] = ['it', 'comms', 'ops', 'people']
export const TOTAL_BUDGET = 100
export const MIN_ALLOCATION = 5
export const MAX_ALLOCATION = 85 // 100 - 3 * MIN_ALLOCATION
export const DEFAULT_ALLOCATION: ResourceAllocation = { it: 25, comms: 25, ops: 25, people: 25 }

// ── Comms Feed ──
export type CommMessageType = 'alert' | 'intel' | 'outcome' | 'system'

export interface CommMessage {
  id: string
  source: string
  text: string
  type: CommMessageType
}

// ── Phase ──
export type Phase = 'title' | 'briefing' | 'decision' | 'consequence' | 'debrief'
