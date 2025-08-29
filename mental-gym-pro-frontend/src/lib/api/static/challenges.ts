// src/lib/static/challenges.ts
import type { Challenge, UserChallenge } from '@/types';

// Lista fija de retos (puedes editar a tu gusto)
export const CHALLENGES: Challenge[] = [
  {
    _id: 'ch-memory-7',
    title: 'Reto Memoria (7 días)',
    description: 'Completa un ejercicio de memoria cada día durante 7 días.',
    objective: '7 ejercicios de memoria',
    durationDays: 7,
    isCompleted: false,
    exercises: ['ex_mem_pairs', 'ex_attention_sel'],
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    participants: 128,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'ch-logic-10',
    title: 'Maratón de Lógica',
    description: 'Resuelve 10 retos de lógica antes de que termine el mes.',
    objective: '10 ejercicios de lógica',
    durationDays: 30,
    isCompleted: false,
    exercises: ['ex_logic_seq'],
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    participants: 87,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'ch-focus-5',
    title: 'Enfoque x5',
    description: 'Completa 5 ejercicios de atención selectiva esta semana.',
    objective: '5 ejercicios de atención',
    durationDays: 7,
    isCompleted: false,
    exercises: ['ex_attention_sel'],
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    participants: 64,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helpers de perfil (LocalStorage por usuario)
export const joinedKey = (uid: string) => `mg:challenges:${uid}:joined:v1`;
export const completedKey = (uid: string) => `mg:challenges:${uid}:completed:v1`;

export function getUid(): string {
  if (typeof window === 'undefined') return 'anonymous';
  return localStorage.getItem('mg:userId') || 'anonymous';
}

export function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function writeSet(key: string, set: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
}

export function emitChallengesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mg:challenges-changed'));
  }
}

// Utilidades para el dashboard (si las quieres usar)
export function getMyChallengesClient(): UserChallenge[] {
  const u = getUid();
  const joined = readSet(joinedKey(u));
  const completed = readSet(completedKey(u));
  return CHALLENGES.filter(c => joined.has(c._id)).map(c => ({
    _id: `uch_${u}_${c._id}`,
    user: u as unknown as UserChallenge['user'],
    challenge: c._id as unknown as UserChallenge['challenge'],
    progress: completed.has(c._id) ? 100 : 0,
    isCompleted: completed.has(c._id),
    createdAt: c.createdAt,
    updatedAt: new Date().toISOString(),
  }) as UserChallenge);
}
