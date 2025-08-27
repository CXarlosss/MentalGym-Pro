// src/lib/gamification/gamification.ts
import type { Challenge, UserChallenge, Badge, UserBadge } from '@/types';
import { USE_MOCK, get, postJSON, patchJSON, del, getJSON } from '../config';

/**
 * Gamificación: API + soporte MOCK local por usuario
 */

// -------------- Utils LS por usuario + eventos --------------
const uid = (): string => {
  if (typeof window === 'undefined') return 'anonymous';
  return localStorage.getItem('mg:userId') || 'anonymous';
};

const joinedKey = (u: string) => `mg:challenges:${u}:joined:v1`;
const completedKey = (u: string) => `mg:challenges:${u}:completed:v1`;
const myBadgesKey = (u: string) => `mg:badges:${u}:unlocked:v1`;

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set<string>();
    return new Set<string>(JSON.parse(raw) as string[]);
  } catch {
    return new Set<string>();
  }
}

function writeSet(key: string, set: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
}

function emitChallengesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mg:challenges-changed'));
  }
}

// -------------- Fallbacks MOCK --------------
const FALLBACK_CHALLENGES: Challenge[] = [
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

// Según tus errores, `Badge` es minimal (p.ej., { code; title })
const FALLBACK_BADGES: Badge[] = [
  { code: 'streak_7', title: 'Racha de 7 días' } as Badge,
  { code: 'first_challenge', title: 'Primer desafío' } as Badge,
];

// -------------- Auth header (API real) --------------
function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// =====================================================
//                  CHALLENGES (Catálogo)
// =====================================================
export async function fetchActiveChallenges(): Promise<Challenge[]> {
  if (USE_MOCK) {
    return FALLBACK_CHALLENGES;
  }
  return getJSON<Challenge[]>(
    ['/gamification/challenges/active', '/challenges/active'],
    { headers: authHeader() }
  );
}

export async function fetchAllChallenges(): Promise<Challenge[]> {
  if (USE_MOCK) {
    return FALLBACK_CHALLENGES;
  }
  return get<Challenge[]>('/gamification/challenges', { headers: authHeader() });
}

export async function fetchChallengeById(id: string): Promise<Challenge> {
  if (USE_MOCK) {
    const c = FALLBACK_CHALLENGES.find((x) => x._id === id);
    if (!c) throw new Error('Desafío no encontrado (mock)');
    return c;
  }
  return get<Challenge>(`/gamification/challenges/${id}`, { headers: authHeader() });
}

// =====================================================
//               CHALLENGES (Admin)
// =====================================================
export async function createChallenge(body: Partial<Challenge>): Promise<Challenge> {
  if (USE_MOCK) {
    const nowIso = new Date().toISOString();
    const newCh: Challenge = {
      _id: `ch_${Math.random().toString(36).slice(2, 10)}`,
      title: body.title ?? 'Nuevo desafío',
      description: body.description ?? '',
      objective: body.objective ?? '',
      durationDays: body.durationDays ?? 7,
      isCompleted: false,
      exercises: body.exercises ?? [],
      expiresAt: body.expiresAt ?? new Date(Date.now() + 7 * 864e5).toISOString(),
      participants: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    FALLBACK_CHALLENGES.push(newCh);
    emitChallengesChanged();
    return newCh;
  }
  return postJSON<Challenge>('/gamification/challenges', body, { headers: authHeader() });
}

export async function updateChallenge(id: string, body: Partial<Challenge>): Promise<Challenge> {
  if (USE_MOCK) {
    const i = FALLBACK_CHALLENGES.findIndex((c) => c._id === id);
    if (i === -1) throw new Error('Desafío no encontrado (mock)');
    const updatedCh: Challenge = {
      ...FALLBACK_CHALLENGES[i],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    FALLBACK_CHALLENGES[i] = updatedCh;
    emitChallengesChanged();
    return updatedCh;
  }
  return patchJSON<Challenge>(`/gamification/challenges/${id}`, body, { headers: authHeader() });
}

export async function deleteChallenge(id: string): Promise<{ ok: boolean }> {
  if (USE_MOCK) {
    const i = FALLBACK_CHALLENGES.findIndex((c) => c._id === id);
    if (i !== -1) FALLBACK_CHALLENGES.splice(i, 1);
    emitChallengesChanged();
    return { ok: true };
  }
  return del<{ ok: boolean }>(`/gamification/challenges/${id}`, { headers: authHeader() });
}

// =====================================================
//         CHALLENGES (Mi estado / progreso)
// =====================================================
export async function joinChallenge(id: string): Promise<UserChallenge> {
  if (USE_MOCK) {
    const u = uid();
    const k = joinedKey(u);
    const s = readSet(k);
    s.add(id);
    writeSet(k, s);
    emitChallengesChanged();

    const nowIso = new Date().toISOString();
    const uc: UserChallenge = {
      _id: `uch_${Math.random().toString(36).slice(2, 10)}`,
      user: u as unknown as UserChallenge['user'],
      challenge: id as unknown as UserChallenge['challenge'],
      progress: 0,
      isCompleted: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    } as UserChallenge;
    return uc;
  }
  return postJSON<UserChallenge>(`/gamification/challenges/${id}/join`, {}, { headers: authHeader() });
}

export async function updateMyChallengeProgress(
  id: string,
  body: { progress?: number; isCompleted?: boolean }
): Promise<UserChallenge> {
  if (USE_MOCK) {
    const u = uid();
    if (body.isCompleted) {
      const kc = completedKey(u);
      const sc = readSet(kc);
      sc.add(id);
      writeSet(kc, sc);
      emitChallengesChanged();
    }
    const nowIso = new Date().toISOString();
    const uc: UserChallenge = {
      _id: `uch_${Math.random().toString(36).slice(2, 10)}`,
      user: u as unknown as UserChallenge['user'],
      challenge: id as unknown as UserChallenge['challenge'],
      progress: body.progress ?? 0,
      isCompleted: Boolean(body.isCompleted),
      createdAt: nowIso,
      updatedAt: nowIso,
    } as UserChallenge;
    return uc;
  }
  return patchJSON<UserChallenge>(`/gamification/challenges/${id}/progress`, body, { headers: authHeader() });
}

export async function fetchMyChallenges(): Promise<UserChallenge[]> {
  if (USE_MOCK) {
    const u = uid();
    const joined = readSet(joinedKey(u));
    const completed = readSet(completedKey(u));

    const list: UserChallenge[] = FALLBACK_CHALLENGES
      .filter((ch) => joined.has(ch._id))
      .map((ch) => {
        const isCompleted = completed.has(ch._id);
        const uc: UserChallenge = {
          _id: `uch_${u}_${ch._id}`,
          user: u as unknown as UserChallenge['user'],
          challenge: ch._id as unknown as UserChallenge['challenge'],
          progress: isCompleted ? 100 : 0,
          isCompleted,
          createdAt: ch.createdAt,
          updatedAt: new Date().toISOString(),
        } as UserChallenge;
        return uc;
      });

    return list;
  }
  return get<UserChallenge[]>('/gamification/my-challenges', { headers: authHeader() });
}

// =====================================================
//                          BADGES
// =====================================================

/**
 * NOTA: Tu tipo `Badge` parece minimal (sin _id/fechas). En mock usamos `code` como identificador.
 */
export async function fetchBadges(): Promise<Badge[]> {
  if (USE_MOCK) {
    return FALLBACK_BADGES;
  }
  return get<Badge[]>('/gamification/badges', { headers: authHeader() });
}

export async function createBadge(
  body: Pick<Badge, 'code' | 'title'> & Partial<Badge>
): Promise<Badge> {
  if (USE_MOCK) {
    const exists = FALLBACK_BADGES.some((b) => b.code === body.code);
    if (!exists) {
      FALLBACK_BADGES.push({ code: body.code, title: body.title } as Badge);
    }
    return { code: body.code, title: body.title } as Badge;
  }
  return postJSON<Badge>('/gamification/badges', body, { headers: authHeader() });
}

export async function updateBadge(id: string, body: Partial<Badge>): Promise<Badge> {
  if (USE_MOCK) {
    const i = FALLBACK_BADGES.findIndex((b) => b.code === id);
    if (i === -1) throw new Error('Badge no encontrado (mock)');
    const updated: Badge = { ...FALLBACK_BADGES[i], ...body } as Badge;
    FALLBACK_BADGES[i] = updated;
    return updated;
  }
  return patchJSON<Badge>(`/gamification/badges/${id}`, body, { headers: authHeader() });
}

export async function deleteBadge(id: string): Promise<{ ok: boolean }> {
  if (USE_MOCK) {
    const i = FALLBACK_BADGES.findIndex((b) => b.code === id);
    if (i !== -1) FALLBACK_BADGES.splice(i, 1);
    return { ok: true };
  }
  return del<{ ok: boolean }>(`/gamification/badges/${id}`, { headers: authHeader() });
}

export async function fetchMyBadges(): Promise<UserBadge[]> {
  if (USE_MOCK) {
    const u = uid();
    const set = readSet(myBadgesKey(u)); // guardamos codes
    const nowIso = new Date().toISOString();
    const mine: UserBadge[] = Array.from(set).map((code) => {
      const ub: UserBadge = {
        _id: `ub_${u}_${code}`,
        user: u as unknown as UserBadge['user'],
        badge: code as unknown as UserBadge['badge'],
        unlockedAt: nowIso,
      } as UserBadge;
      return ub;
    });
    return mine;
  }
  return get<UserBadge[]>('/gamification/user-badges', { headers: authHeader() });
}

export async function unlockBadgeForMe(badgeId: string): Promise<UserBadge> {
  if (USE_MOCK) {
    const u = uid();
    const set = readSet(myBadgesKey(u));
    set.add(badgeId); // guardamos por code
    writeSet(myBadgesKey(u), set);

    const ub: UserBadge = {
      _id: `ub_${u}_${badgeId}`,
      user: u as unknown as UserBadge['user'],
      badge: badgeId as unknown as UserBadge['badge'],
      unlockedAt: new Date().toISOString(),
    } as UserBadge;
    return ub;
  }
  return postJSON<UserBadge>(`/gamification/user-badges/${badgeId}/unlock`, {}, { headers: authHeader() });
}
