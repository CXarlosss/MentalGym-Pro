// src/lib/api/gamification.ts
import { api } from '../config';

// ===== Tipos (opcionales, bórralos si ya los tienes en "@/types") =====
export type Challenge = {
  _id: string;
  title: string;
  description?: string;
  objective?: string;
  durationDays?: number | null;
  exercises: string[];
  expiresAt?: string;
  participants: number;
  isCompleted: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserChallenge = {
  _id: string;
  user: string;
  challenge: Challenge; // viene populado en algunos endpoints
  progress: number;
  isCompleted: boolean;
  joinedAt: string;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Badge = {
  _id: string;
  code: string;
  title: string;
  description?: string;
  icon?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserBadge = {
  _id: string;
  user: string;
  badge: Badge; // populado
  unlockedAt: string;
};

// =====================
//     Challenges
// =====================

// Catálogo público activo
export async function fetchActiveChallenges() {
  const { data } = await api.get('/gamification/challenges/active');
  return data as Challenge[];
}

// Todos los desafíos (admin o sección interna)
export async function fetchAllChallenges() {
  const { data } = await api.get('/gamification/challenges');
  return data as Challenge[];
}

// Desafío por id
export async function fetchChallengeById(id: string) {
  const { data } = await api.get(`/gamification/challenges/${id}`);
  return data as Challenge;
}

// Crear desafío (admin)
export async function createChallenge(body: Partial<Challenge>) {
  const { data } = await api.post('/gamification/challenges', body);
  return data as Challenge;
}

// Actualizar desafío (admin)
export async function updateChallenge(id: string, body: Partial<Challenge>) {
  const { data } = await api.patch(`/gamification/challenges/${id}`, body);
  return data as Challenge;
}

// Borrado lógico (admin)
export async function deleteChallenge(id: string) {
  const { data } = await api.delete(`/gamification/challenges/${id}`);
  return data as { ok: boolean };
}

// Unirse a un desafío
export async function joinChallenge(id: string) {
  const { data } = await api.post(`/gamification/challenges/${id}/join`);
  return data as UserChallenge;
}

// Mi progreso en un desafío
export async function updateMyChallengeProgress(
  id: string,
  body: { progress?: number; isCompleted?: boolean }
) {
  const { data } = await api.patch(`/gamification/challenges/${id}/progress`, body);
  return data as UserChallenge;
}

// Mis desafíos
export async function fetchMyChallenges() {
  const { data } = await api.get('/gamification/my-challenges');
  return data as UserChallenge[];
}

// =====================
//        Badges
// =====================

// Catálogo
export async function fetchBadges() {
  const { data } = await api.get('/gamification/badges');
  return data as Badge[];
}

// Crear badge (admin)
export async function createBadge(body: Pick<Badge, 'code' | 'title'> & Partial<Badge>) {
  const { data } = await api.post('/gamification/badges', body);
  return data as Badge;
}

// Actualizar badge (admin)
export async function updateBadge(id: string, body: Partial<Badge>) {
  const { data } = await api.patch(`/gamification/badges/${id}`, body);
  return data as Badge;
}

// Borrado lógico badge (admin)
export async function deleteBadge(id: string) {
  const { data } = await api.delete(`/gamification/badges/${id}`);
  return data as { ok: boolean };
}

// Mis badges
export async function fetchMyBadges() {
  const { data } = await api.get('/gamification/user-badges');
  return data as UserBadge[];
}

// 🔓 Desbloquear un badge para mí
export async function unlockBadgeForMe(badgeId: string) {
  const { data } = await api.post(`/gamification/user-badges/${badgeId}/unlock`);
  return data as UserBadge;
}
