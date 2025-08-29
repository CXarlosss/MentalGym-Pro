import type { ExerciseSession, ExerciseResult } from '@/types'
import { USE_MOCK, getJSON, postJSON } from '../config'

// Fuerza el modo MOCK temporalmente
const FORCE_MOCK = true;
const ACTUAL_USE_MOCK = USE_MOCK || FORCE_MOCK;

console.log('🔍 USE_MOCK en sessionController.ts:', ACTUAL_USE_MOCK);

// --------- Tipos API (backend) ----------
type Difficulty = 'easy' | 'medium' | 'hard'
type ExerciseRefApi = {
  _id: string
  title?: string
  name?: string
  category?: string
  muscleGroup?: string
  difficulty?: Difficulty
}
type SessionApiShape = {
  _id: string
  user?: string
  exercise?: ExerciseRefApi | string
  score?: number
  durationMin?: number
  timeSpentSec?: number
  playedAt?: string
  completedAt?: string
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, unknown>
}

// --------- Mock persistente (localStorage) ----------
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

const LEGACY_KEY = 'mg:cog:sessions:v1'

// ---- helpers de bucket por-usuario ----
type UserLike = {
  _id?: string
  id?: string
  email?: string
  username?: string
  name?: string
}

function deriveUserIdFromCache(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem('user')
    if (!cached) return null
    const u: unknown = JSON.parse(cached)

    if (typeof u === 'object' && u !== null) {
      const user = u as UserLike
      const id = user._id ?? user.id ?? user.email ?? user.username ?? user.name
      return id ? String(id) : null
    }
    return null
  } catch {
    return null
  }
}

function ensureUserBucketId() {
  if (typeof window === 'undefined') return
  const current = localStorage.getItem('mg:userId')
  if (!current) {
    const derived = deriveUserIdFromCache()
    if (derived) localStorage.setItem('mg:userId', derived)
  }
}

const userBucketKey = () => {
  if (typeof window === 'undefined') return LEGACY_KEY
  ensureUserBucketId()
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

function writeLS<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function emitSessionsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mg:sessions-changed'))
  }
}

// migra legacy → bucket de usuario (una vez)
function migrateLegacyIfNeeded() {
  if (typeof window === 'undefined') return
  const legacy = readLS<LocalSession[]>(LEGACY_KEY, [])
  if (!legacy.length) return
  const key = userBucketKey()
  const current = readLS<LocalSession[]>(key, [])
  writeLS(key, [...current, ...legacy])
  try { localStorage.removeItem(LEGACY_KEY) } catch {}
}

function readLocalSessions(): LocalSession[] {
  migrateLegacyIfNeeded()
  return readLS<LocalSession[]>(userBucketKey(), [])
}

function writeLocalSessions(arr: LocalSession[]) {
  writeLS(userBucketKey(), arr)
  emitSessionsChanged()
}

// --------- Normalizadores ----------
function normalizeSessionFromApi(api: SessionApiShape): ExerciseSession {
  const nowIso = new Date().toISOString()
  return {
    _id: api._id,
    user: api.user ?? '',
    exercise: (api.exercise ?? '') as unknown as ExerciseSession['exercise'],
    score: api.score ?? 0,
    durationMin: api.durationMin ?? 0,
    playedAt: api.playedAt ?? nowIso,
    createdAt: api.createdAt ?? api.playedAt ?? nowIso,
    updatedAt: api.updatedAt ?? api.playedAt ?? nowIso,
    startedAt: api.playedAt ?? nowIso,
    endedAt: api.completedAt,
  } as ExerciseSession
}

function normalizeSessionFromLocal(s: LocalSession): ExerciseSession {
  const durationMin =
    s.durationMin ??
    (s.endedAt
      ? Math.max(1, Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000))
      : 0)
  return {
    _id: s._id,
    user: s.user,
    exercise: s.exercise as unknown as ExerciseSession['exercise'],
    score: s.score ?? 0,
    durationMin,
    playedAt: s.startedAt,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
  } as ExerciseSession
}

// Endpoints
const LIST_PATHS = ['/sessions', '/cognitive/sessions']
const CREATE_PATHS = ['/sessions', '/cognitive/sessions']
const COMPLETE_PATHS = (id: string) => [
  `/sessions/${id}/complete`,
  `/cognitive/sessions/${id}/complete`,
]

// ===============================
//       LISTAR MIS SESIONES
// ===============================
export async function fetchMySessions(): Promise<ExerciseSession[]> {
  console.log('fetchMySessions - ACTUAL_USE_MOCK:', ACTUAL_USE_MOCK);
      console.log('➡️ Calling fetchMySessions...'); // Log at the start of the function

  if (ACTUAL_USE_MOCK) {
            console.log('✅ fetchMySessions: Using MOCK logic.');

    const arr = readLocalSessions()
    return arr
      .slice()
      .sort(
        (a, b) =>
          new Date(b.endedAt ?? b.updatedAt ?? b.startedAt).getTime() -
          new Date(a.endedAt ?? a.updatedAt ?? a.startedAt).getTime()
      )
      .map(normalizeSessionFromLocal)
  }

  try {
            console.log('🌐 fetchMySessions: Using backend logic.');

    const sessions = await getJSON<SessionApiShape[]>(LIST_PATHS)
    return sessions.map(normalizeSessionFromApi)
  } catch (err) {
    console.warn('[fetchMySessions] backend falló:', err)
    return []
  }
}



// ===============================
//     CREAR / INICIAR SESIÓN
// ===============================
export async function startExerciseSession(
  exerciseId: string,
  opts?: {
    title?: string
    category?: string
    score?: number
    durationMin?: number
    timeSpentSec?: number
    playedAt?: string | Date
  }
): Promise<{ _id: string }> {
    console.log(`➡️ Calling startExerciseSession with exerciseId: ${exerciseId}`); // Log at the start of the function
  if (ACTUAL_USE_MOCK) {
        console.log('✅ startExerciseSession: Using MOCK logic.');
    ensureUserBucketId()
    const now = new Date()
    const id = `sess_${Math.random().toString(36).slice(2, 11)}`
    const iso = now.toISOString()
    const startedAtIso =
      opts?.playedAt
        ? typeof opts.playedAt === 'string'
          ? opts.playedAt
          : (opts.playedAt as Date).toISOString()
        : iso

    const local: LocalSession = {
      _id: id,
      user: 'me',
      exercise: { _id: exerciseId, title: opts?.title, category: opts?.category },
      score: opts?.score,
      durationMin: opts?.durationMin,
      startedAt: startedAtIso,
      createdAt: iso,
      updatedAt: iso,
    }

    const arr = readLocalSessions()
    arr.push(local)
    writeLocalSessions(arr)
        console.log(`✅ Session started successfully (MOCK), ID: ${id}`);
    return { _id: id }
  }

  const body: Record<string, unknown> = { exerciseId }
  if (opts?.score != null) body.score = opts.score
  if (opts?.durationMin != null) body.durationMin = opts.durationMin
  if (opts?.timeSpentSec != null) body.timeSpentSec = opts.timeSpentSec
  if (opts?.playedAt) body.playedAt = opts.playedAt

  let lastErr: unknown
  for (const path of CREATE_PATHS) {
        console.log(`🌐 startExerciseSession: Trying backend path: ${path}`);
    try {
      const created = await postJSON<{ _id?: string }>(path, body)
      if (typeof created?._id === 'string' && created._id) {
            console.log(`✅ Session started successfully (backend), ID: ${created._id}`);
            return { _id: created._id };
        }
      lastErr = new Error('Respuesta sin _id')
    } catch (e) {
        console.warn(`❌ startExerciseSession: Path ${path} failed. Error: ${e}`);
      lastErr = e
    }
  }
  throw (lastErr instanceof Error ? lastErr : new Error(String(lastErr ?? 'Cannot start session')))
}

// ===============================
//         COMPLETAR SESIÓN
// ===============================
export async function completeExercise(
  sessionId: string,
  data: { score: number; timeSpent: number; metadata: Record<string, unknown> }
): Promise<ExerciseResult> {
    console.log(`➡️ Calling completeExercise for session ID: ${sessionId}`); // Log at the start of the function
  
  // Lógica de MOCK (o si el ID es de mock)
  if (ACTUAL_USE_MOCK || sessionId.startsWith('sess_')) {
        console.log('✅ completeExercise: Using MOCK logic.');
    ensureUserBucketId()
    const arr = readLocalSessions()
    const i = arr.findIndex(s => s._id === sessionId)
    const nowIso = new Date().toISOString()

    if (i !== -1) {
      const minutes =
        data.timeSpent > 0
          ? Math.max(1, Math.round(data.timeSpent / 60))
          : Math.max(
              1,
              Math.round((new Date(nowIso).getTime() - new Date(arr[i].startedAt).getTime()) / 60000)
            )

      arr[i] = {
        ...arr[i],
        score: data.score,
        durationMin: minutes,
        endedAt: nowIso,
        updatedAt: nowIso,
      }
      writeLocalSessions(arr)
    console.log(`✅ Session completed successfully (MOCK). Score: ${data.score}`);
    }

    return {
      _id: `res_${Math.random().toString(36).slice(2, 11)}`,
      sessionId,
      score: data.score,
      timeSpent: data.timeSpent,
      createdAt: nowIso,
      metadata: data.metadata,
    }
  }

  // Lógica de backend
  for (const p of COMPLETE_PATHS(sessionId)) {
        console.log(`🌐 completeExercise: Trying backend path: ${p}`);
    try {
      return await postJSON<ExerciseResult>(p, data)
    } catch {
        console.warn(`❌ completeExercise: Path ${p} failed.`);
      // probar siguiente
    }
  }

  // Fallback si todos los backends fallan
  const nowIso = new Date().toISOString()
    console.log('⚠️ completeExercise: All backend paths failed, returning fallback result.');
  return {
    _id: `res_${Math.random().toString(36).slice(2, 11)}`,
    sessionId,
    score: data.score,
    timeSpent: data.timeSpent,
    createdAt: nowIso,
    metadata: data.metadata,
  }
}