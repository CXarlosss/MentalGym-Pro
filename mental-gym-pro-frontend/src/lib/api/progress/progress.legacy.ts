// src/lib/api/progress.ts
import type { UserProgress, Challenge } from '@/types';
import { USE_MOCK, getJSON } from '../config';

// ===============================
//            MOCKS
// ===============================
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

// Header de auth tipado (evita HeadersInit union raro)
function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ===============================
//       PROGRESO DEL USUARIO
// ===============================
export async function fetchUserProgress(): Promise<UserProgress> {
  if (USE_MOCK) return MOCK_PROGRESS;

  try {
    const paths = [
      '/stats/me',
      '/api/stats/me',
      // si más adelante expones uno específico de gamificación:
      // '/api/gamification/progress/me',
    ];
    return await getJSON<UserProgress>(paths, { headers: authHeader() });
  } catch (e) {
    console.warn('[fetchUserProgress] backend falló, usando mock:', e);
    return MOCK_PROGRESS;
  }
}

// ===============================
//        DESAFÍOS ACTIVOS
// ===============================
export async function fetchActiveChallenges(): Promise<Challenge[]> {
  if (USE_MOCK) return MOCK_CHALLENGES;

  try {
    const paths = [
      // nuevo namespace
      '/api/gamification/challenges/active',
      // compat que dejaste en el backend
      '/api/challenges/active',
      // por si el front antiguo llamaba sin /api
      '/challenges/active',
    ];
    return await getJSON<Challenge[]>(paths, { headers: authHeader() });
  } catch (e) {
    console.warn('[fetchActiveChallenges] backend falló, usando mock:', e);
    return MOCK_CHALLENGES;
  }
}
