// src/lib/api/gamification.ts
import type { Challenge, UserChallenge, Badge, UserBadge } from '@/types';
import { get, postJSON, patchJSON, del, getJSON } from '../config';

// =====================
//     Challenges
// =====================

// Catálogo público activo (con fallback a la ruta compat)
export async function fetchActiveChallenges() {
  const data = await getJSON<Challenge[]>(
    ['/api/gamification/challenges/active', '/api/challenges/active']
  );
  return data;
}

// Todos los desafíos (admin o sección interna)
export async function fetchAllChallenges() {
  return get<Challenge[]>('/api/gamification/challenges');
}

// Desafío por id
export async function fetchChallengeById(id: string) {
  return get<Challenge>(`/api/gamification/challenges/${id}`);
}

// Crear desafío (admin)
export async function createChallenge(body: Partial<Challenge>) {
  return postJSON<Challenge>('/api/gamification/challenges', body);
}

// Actualizar desafío (admin)
export async function updateChallenge(id: string, body: Partial<Challenge>) {
  return patchJSON<Challenge>(`/api/gamification/challenges/${id}`, body);
}

// Borrado lógico (admin)
export async function deleteChallenge(id: string) {
  return del<{ ok: boolean }>(`/api/gamification/challenges/${id}`);
}

// Unirse a un desafío
export async function joinChallenge(id: string) {
  return postJSON<UserChallenge>(`/api/gamification/challenges/${id}/join`, {});
}

// Mi progreso en un desafío
export async function updateMyChallengeProgress(
  id: string,
  body: { progress?: number; isCompleted?: boolean }
) {
  return patchJSON<UserChallenge>(`/api/gamification/challenges/${id}/progress`, body);
}

// Mis desafíos
export async function fetchMyChallenges() {
  return get<UserChallenge[]>('/api/gamification/my-challenges');
}

// =====================
//        Badges
// =====================

// Catálogo
export async function fetchBadges() {
  return get<Badge[]>('/api/gamification/badges');
}

// Crear badge (admin)
export async function createBadge(body: Pick<Badge, 'code' | 'title'> & Partial<Badge>) {
  return postJSON<Badge>('/api/gamification/badges', body);
}

// Actualizar badge (admin)
export async function updateBadge(id: string, body: Partial<Badge>) {
  return patchJSON<Badge>(`/api/gamification/badges/${id}`, body);
}

// Borrado lógico badge (admin)
export async function deleteBadge(id: string) {
  return del<{ ok: boolean }>(`/api/gamification/badges/${id}`);
}

// Mis badges
export async function fetchMyBadges() {
  return get<UserBadge[]>('/api/gamification/user-badges');
}

// 🔓 Desbloquear un badge para mí
export async function unlockBadgeForMe(badgeId: string) {
  return postJSON<UserBadge>(`/api/gamification/user-badges/${badgeId}/unlock`, {});
}
