// src/lib/api/cognitive/sessionController.ts
import type { ExerciseSession, ExerciseResult } from '@/types';
import { USE_MOCK, getJSON, postJSON } from '../config';

// ===============================
//     Tipos (forma que viene del API)
// ===============================
type Difficulty = 'easy' | 'medium' | 'hard';

type ExerciseRefApi = {
  _id: string;
  // El backend puede mandar distintos campos (title/name, category/muscleGroup)
  // Lo dejamos flexible y lo casteamos al tipo del cliente.
  title?: string;
  name?: string;
  category?: string;
  muscleGroup?: string;
  difficulty?: Difficulty;
};

type SessionApiShape = {
  _id: string;
  user?: string; // <- el backend suele incluirlo; lo mapeamos tal cual
  exercise?: ExerciseRefApi | string;
  score?: number;
  durationMin?: number;
  timeSpentSec?: number;          // existe en backend, pero NO en tu ExerciseSession
  playedAt?: string;
  completedAt?: string;           // existe en backend, pero NO en tu ExerciseSession
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>; // idem: backend puede mandarlo; tu tipo no lo tiene
};

// ===============================
//            MOCKS
// ===============================
const MOCK_SESSIONS_API: SessionApiShape[] = [
  {
    _id: 'sess_mock_1',
    user: 'me',
    exercise: { _id: 'ex_mem_pairs', title: 'Memoria de pares', category: 'memoria', difficulty: 'easy' },
    score: 820,
    durationMin: 5,
    timeSpentSec: 280,
    playedAt: '2025-08-14T10:00:00.000Z',
    completedAt: '2025-08-14T10:05:00.000Z',
    metadata: { moves: 22 },
    createdAt: '2025-08-14T10:00:00.000Z',
    updatedAt: '2025-08-14T10:05:00.000Z',
  },
  {
    _id: 'sess_mock_2',
    user: 'me',
    exercise: { _id: 'ex_logic_seq', title: 'Secuencias lógicas', category: 'logica', difficulty: 'medium' },
    score: 740,
    durationMin: 6,
    timeSpentSec: 330,
    playedAt: '2025-08-16T09:30:00.000Z',
    completedAt: '2025-08-16T09:36:00.000Z',
    metadata: { correct: 7, total: 9 },
    createdAt: '2025-08-16T09:30:00.000Z',
    updatedAt: '2025-08-16T09:36:00.000Z',
  },
];

// ===============================
//        Normalizador (API→UI)
// ===============================
function normalizeSession(api: SessionApiShape): ExerciseSession {
  const nowIso = new Date().toISOString();

  // Importante: NO incluimos completedAt/timeSpentSec/metadata porque tu ExerciseSession no los define
  return {
    _id: api._id,
    user: api.user ?? '', // tu tipo lo exige; si el backend no lo manda, ponemos cadena vacía
    exercise: (api.exercise ?? '') as unknown as ExerciseSession['exercise'],
    score: api.score ?? 0,
    durationMin: api.durationMin ?? 0,
    playedAt: api.playedAt ?? nowIso,
    createdAt: api.createdAt ?? api.playedAt ?? nowIso,
    updatedAt: api.updatedAt ?? api.playedAt ?? nowIso,
  } satisfies ExerciseSession;
}

// Endpoints (canónico + fallback “cognitive”)
const LIST_PATHS   = ['/api/sessions', '/api/cognitive/sessions'];
const CREATE_PATHS = ['/api/sessions', '/api/cognitive/sessions'];
const COMPLETE_PATHS = (id: string) => [
  `/api/sessions/${id}/complete`,
  `/api/cognitive/sessions/${id}/complete`,
];

// ===============================
//        LISTAR MIS SESIONES
// ===============================
export async function fetchMySessions(): Promise<ExerciseSession[]> {
  if (USE_MOCK) return MOCK_SESSIONS_API.map(normalizeSession);

  try {
    const sessions = await getJSON<SessionApiShape[]>(LIST_PATHS);
    return sessions.map(normalizeSession);
  } catch (err) {
    console.warn('[fetchMySessions] backend falló, usando mock:', err);
    return MOCK_SESSIONS_API.map(normalizeSession);
  }
}

// ===============================
//      CREAR / INICIAR SESIÓN
// ===============================
export async function startExerciseSession(
  exerciseId: string,
  opts?: {
    score?: number;
    durationMin?: number;
    timeSpentSec?: number;     // el backend lo acepta (no está en tu tipo de cliente)
    playedAt?: string | Date;
  }
): Promise<{ _id: string }> {
  if (USE_MOCK) {
    return { _id: `sess_${Math.random().toString(36).slice(2, 11)}` };
  }

  const body: Record<string, unknown> = { exerciseId };
  if (opts?.score != null) body.score = opts.score;
  if (opts?.durationMin != null) body.durationMin = opts.durationMin;
  if (opts?.timeSpentSec != null) body.timeSpentSec = opts.timeSpentSec;
  if (opts?.playedAt) body.playedAt = opts.playedAt;

  let lastErr: unknown;
  for (const path of CREATE_PATHS) {
    try {
      const created = await postJSON<{ _id?: string }>(path, body);
      if (typeof created?._id === 'string' && created._id) return { _id: created._id };
      lastErr = new Error('Respuesta sin _id');
    } catch (e) {
      lastErr = e;
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[startExerciseSession] backend falló, sesión mock:', lastErr);
    return { _id: `sess_${Math.random().toString(36).slice(2, 11)}` };
  }
  throw (lastErr instanceof Error ? lastErr : new Error(String(lastErr ?? 'Cannot start session')));
}

// ===============================
//         COMPLETAR SESIÓN
// ===============================
export async function completeExercise(
  sessionId: string,
  data: { score: number; timeSpent: number; metadata: Record<string, unknown> }
): Promise<ExerciseResult> {
  if (USE_MOCK || sessionId.startsWith('sess_')) {
    return {
      _id: `res_${Math.random().toString(36).slice(2, 11)}`,
      sessionId,
      score: data.score,
      timeSpent: data.timeSpent,
      createdAt: new Date().toISOString(),
      metadata: data.metadata,
    };
  }

  for (const p of COMPLETE_PATHS(sessionId)) {
    try {
      return await postJSON<ExerciseResult>(p, data);
    } catch {
      // probar siguiente
    }
  }

  console.warn('[completeExercise] backend no disponible, resultado mock');
  return {
    _id: `res_${Math.random().toString(36).slice(2, 11)}`,
    sessionId,
    score: data.score,
    timeSpent: data.timeSpent,
    createdAt: new Date().toISOString(),
    metadata: data.metadata,
  };
}
