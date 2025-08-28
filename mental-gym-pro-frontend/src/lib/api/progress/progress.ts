import type { UserProgress, Challenge, DashboardStats, UserChallenge } from '@/types';
import { USE_MOCK } from '../config'; // Si existe
import { getJSON, get } from '../config'; // Mueve estas funciones
// ===============================
//       FUNCIONES DE SOPORTE
// ===============================

// Header de auth tipado (evita HeadersInit union raro)
function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Lógica para leer datos locales (legacy y actuales)
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
  const current = readLS<LocalSession[]>(userBucketKey(), [])
  const legacy = readLS<LocalSession[]>(LEGACY_KEY, [])
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

function normalizeScore(raw?: number): number {
  if (raw == null || Number.isNaN(raw)) return 0
  let n = raw
  if (n > 0 && n <= 1) n *= 100
  else if (n > 1 && n <= 10) n *= 10
  while (n > 100) n /= 10
  n = Math.round(n)
  return Math.max(0, Math.min(100, n))
}

async function fetchLocalProgress(): Promise<DashboardStats> {
  const sessions = readLocalSessions()
  const totalExercises = sessions.length
  const scores = sessions.map(s => normalizeScore(s.score)).filter(n => !Number.isNaN(n))
  const averageScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  const keys = lastNDaysKeys(7)
  const counts = new Map<string, number>(keys.map(k => [k, 0]))

  for (const s of sessions) {
    const iso = s.endedAt || s.updatedAt || s.startedAt || s.createdAt
    const k = toYMD(new Date(iso))
    if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1)
  }

  const weeklyData = keys.map(k => counts.get(k) ?? 0)
  let streak = 0
  for (let i = keys.length - 1; i >= 0; i--) {
    if ((counts.get(keys[i]) ?? 0) > 0) streak++
    else break
  }

  return { weeklyData, streak, totalExercises, averageScore }
}

// Mocks para el progreso del usuario
export const MOCK_PROGRESS: UserProgress = {
  weeklyData: [5, 8, 12, 10, 15, 18, 20],
  streak: 7,
  totalExercises: 45,
  averageScore: 85,
};

export const MOCK_CHALLENGES: Challenge[] = [
  {
    _id: 'ch-1',
    title: 'Maratón de Memoria',
    description: 'Supera 50 niveles del juego de memoria.',
    objective: 'Completar 50 niveles',
    durationDays: 30,
    isCompleted: false,
    exercises: ['ex_mem_pairs', 'ex_attention_sel', 'ex_calc_fast'],
    expiresAt: '2025-09-01T00:00:00Z',
    participants: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock para los desafíos del usuario - CORREGIDO
export const MOCK_MY_CHALLENGES: UserChallenge[] = [
  {
    _id: 'user-ch-1',
    user: 'user-123',
    challenge: {
      _id: 'ch-1',
      title: 'Maratón de Memoria',
      description: 'Supera 50 niveles del juego de memoria.',
      objective: 'Completar 50 niveles',
      durationDays: 30,
      isCompleted: false,
      exercises: ['ex_mem_pairs', 'ex_attention_sel', 'ex_calc_fast'],
      expiresAt: '2025-09-01T00:00:00Z',
      participants: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    progress: 15,
    isCompleted: false,
    joinedAt: new Date().toISOString(),
    completedAt: null,
    // Propiedades requeridas por BaseEntity
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ===============================
//       FUNCIONES EXPORTADAS
// ===============================

// Función principal para obtener el progreso
export async function fetchUserProgress(): Promise<DashboardStats> {
  if (USE_MOCK) {
    try {
      return await fetchLocalProgress();
    } catch (e) {
      console.warn('[fetchUserProgress] No se pudo obtener el progreso local, usando mock estático:', e);
      return MOCK_PROGRESS as DashboardStats;
    }
  }
  
  try {
    return get<DashboardStats>('/stats/me');
  } catch (e) {
    console.warn('[fetchUserProgress] backend falló, usando mock:', e);
    return MOCK_PROGRESS as DashboardStats;
  }
}

export async function fetchActiveChallenges(): Promise<Challenge[]> {
  console.log('🔍 fetchActiveChallenges called - function exists:', typeof fetchActiveChallenges === 'function');
  console.log('🔍 USE_MOCK value:', USE_MOCK);
  
  if (USE_MOCK) {
    console.log('🔍 Using MOCK_CHALLENGES');
    return MOCK_CHALLENGES;
  }
  
  try {
    console.log('🔍 Trying to fetch from backend...');
    const paths = [
      '/gamification/challenges/active',
      '/challenges/active',
      '/challenges/active',
    ];
    const result = await getJSON<Challenge[]>(paths, { headers: authHeader() });
    console.log('🔍 Backend response:', result);
    return result;
  } catch (e) {
    console.warn('[fetchActiveChallenges] backend falló, usando mock:', e);
    console.log('🔍 Falling back to MOCK_CHALLENGES');
    return MOCK_CHALLENGES;
  }
}
export async function fetchMyChallenges(): Promise<UserChallenge[]> {
  if (USE_MOCK) {
    return MOCK_MY_CHALLENGES;
  }
  try {
    const paths = [
      '/gamification/challenges/my-challenges',
      '/challenges/mine',
    ];
    return await getJSON<UserChallenge[]>(paths, { headers: authHeader() });
  } catch (e) {
    console.warn('[fetchMyChallenges] backend falló, usando mock:', e);
    return MOCK_MY_CHALLENGES;
  }
}