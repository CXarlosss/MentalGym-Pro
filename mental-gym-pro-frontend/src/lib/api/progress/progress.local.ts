// src/lib/api/progress/progress.local.ts
import type { DashboardStats } from '@/types'

// Debe coincidir con cómo las guarda sessionController
type LocalSession = {
  _id: string
  user: string
  exercise: { _id: string; title?: string; category?: string }
  score?: number
  durationMin?: number
  startedAt: string // ISO
  endedAt?: string  // ISO
  createdAt: string // ISO
  updatedAt: string // ISO
}

// Clave legacy global (por compat)
const LEGACY_KEY = 'mg:cog:sessions:v1'
// Clave actual por usuario activo (se basa en mg:userId que pone AuthContext)
const userBucketKey = (): string => {
  if (typeof window === 'undefined') return LEGACY_KEY
  const uid = localStorage.getItem('mg:userId') || 'anonymous'
  return `mg:cog:sessions:${uid}:v1`
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function readLocalSessions(): LocalSession[] {
  // Lee el bucket vigente del usuario + legacy por compatibilidad
  const current = readLS<LocalSession[]>(userBucketKey(), [])
  const legacy  = readLS<LocalSession[]>(LEGACY_KEY, [])
  return [...current, ...legacy]
}

function toYMD(d: Date): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const dd = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function lastNDaysKeys(n: number): string[] {
  const out: string[] = []
  const base = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base)
    d.setDate(base.getDate() - i)
    out.push(toYMD(d))
  }
  return out
}

// Normaliza scores a 0..100 por si vienen como 0..1, 1..10, etc.
function normalizeScore(raw?: number): number {
  if (raw == null || Number.isNaN(raw)) return 0
  let n = raw
  if (n > 0 && n <= 1) n *= 100
  else if (n > 1 && n <= 10) n *= 10
  while (n > 100) n /= 10
  n = Math.round(n)
  return Math.max(0, Math.min(100, n))
}

export async function fetchUserProgress(): Promise<DashboardStats> {
  const sessions = readLocalSessions()

  // Total y media
  const totalExercises = sessions.length
  const scores = sessions.map(s => normalizeScore(s.score)).filter(n => !Number.isNaN(n))
  const averageScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  // weeklyData: conteo por día (últimos 7)
  const keys = lastNDaysKeys(7)
  const counts = new Map<string, number>(keys.map(k => [k, 0]))

  for (const s of sessions) {
    const iso = s.endedAt || s.updatedAt || s.startedAt || s.createdAt
    const k = toYMD(new Date(iso))
    if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1)
  }

  const weeklyData = keys.map(k => counts.get(k) ?? 0)

  // racha: días consecutivos desde hoy hacia atrás con actividad > 0
  let streak = 0
  for (let i = keys.length - 1; i >= 0; i--) {
    if ((counts.get(keys[i]) ?? 0) > 0) streak++
    else break
  }

  return { weeklyData, streak, totalExercises, averageScore }
}

// Si no usas retos locales en mock, devuelve vacío (no se reexporta desde index)
export async function fetchActiveChallenges() {
  return []
}
