// src/lib/api/fitness.local.ts
import type {
  ActivityEntry,
  WeeklyActivitySummary,
  WorkoutEntry,
  WorkoutWeeklySummary,
  LiftSet,
  LiftTag,
  RoutineTemplate,
  GroupVolume,
  CardioEntry,
  CardioGoals,
  Badge,
  User,
} from '@/types';

import { LS_KEYS, toLocalYMD, todayKey } from './config';

// ===============================
//      Utils LocalStorage
// ===============================
function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ===============================
//        ACTIVIDAD (pasos)
// ===============================
const ACTIVITY_KEY = LS_KEYS.activity;

function readActivity(): ActivityEntry[] {
  return readJSON<ActivityEntry[]>(ACTIVITY_KEY, []);
}
function writeActivity(list: ActivityEntry[]) {
  writeJSON(ACTIVITY_KEY, list);
}

export async function getActivities(): Promise<ActivityEntry[]> {
  await new Promise((r) => setTimeout(r, 150));
  return readActivity().sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function upsertTodayActivity(input: {
  steps: number;
  minutes?: number;
  calories?: number;
  note?: string;
}): Promise<ActivityEntry> {
  await new Promise((r) => setTimeout(r, 150));
  const list = readActivity();
  const date = todayKey();
  const now = new Date().toISOString();
  const idx = list.findIndex((e) => e.date === date);

  if (idx >= 0) {
    const updated: ActivityEntry = {
      ...list[idx],
      ...input,
      steps: Math.max(0, Math.floor(input.steps || 0)),
      updatedAt: now,
    };
    list[idx] = updated;
    writeActivity(list);
    return updated;
  }

  const created: ActivityEntry = {
    _id: `act_${Math.random().toString(36).slice(2, 10)}`,
    date,
    steps: Math.max(0, Math.floor(input.steps || 0)),
    minutes: input.minutes,
    calories: input.calories,
    note: input.note,
    createdAt: now,
    updatedAt: now,
  } as ActivityEntry;

  list.push(created);
  writeActivity(list);
  return created;
}

export async function getWeeklyActivity(): Promise<WeeklyActivitySummary> {
  await new Promise((r) => setTimeout(r, 120));
  const list = readActivity();

  const days: Array<{ date: string; steps: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    const found = list.find((e) => e.date === key);
    days.push({ date: key, steps: found?.steps ?? 0 });
  }

  const totalSteps = days.reduce((acc, d) => acc + d.steps, 0);
  const avgSteps = Math.round(totalSteps / 7);

  let bestDay: WeeklyActivitySummary['bestDay'] = null;
  for (const d of days) {
    if (!bestDay || d.steps > bestDay.steps) bestDay = { date: d.date, steps: d.steps };
  }

  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].steps > 0) streak++;
    else break;
  }

  return { totalSteps, avgSteps, bestDay, streak, last7Days: days };
}

// ===============================
//            GYM (sets)
// ===============================
const GYM_KEY = LS_KEYS.gym;

function readGym(): WorkoutEntry[] {
  return readJSON<WorkoutEntry[]>(GYM_KEY, []);
}
function writeGym(list: WorkoutEntry[]) {
  writeJSON(GYM_KEY, list);
}

export async function addGymSetToday(set: Omit<LiftSet, '_id' | 'createdAt'>) {
  await new Promise((r) => setTimeout(r, 50));
  const list = readGym();
  const date = todayKey();
  const now = new Date().toISOString();
  let entry = list.find((w) => w.date === date);

  const newSet: LiftSet = { _id: `set_${Math.random().toString(36).slice(2, 9)}`, createdAt: now, ...set };

  if (!entry) {
    entry = { _id: `wo_${Math.random().toString(36).slice(2, 9)}`, date, sets: [newSet], createdAt: now, updatedAt: now };
    list.push(entry);
  } else {
    entry.sets.push(newSet);
    entry.updatedAt = now;
  }
  writeGym(list);
  return entry;
}

export async function getGymWorkouts(): Promise<WorkoutEntry[]> {
  await new Promise((r) => setTimeout(r, 30));
  return readGym().sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getGymWeeklySummary(): Promise<WorkoutWeeklySummary> {
  await new Promise((r) => setTimeout(r, 30));
  const list = readGym();

  const days: Array<{ date: string; totalSets: number; totalVolume: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toLocalYMD(d);
    const entry = list.find((w) => w.date === key);
    const totalVolume = entry ? entry.sets.reduce((a, s) => a + s.weight * s.reps, 0) : 0;
    const totalSets = entry ? entry.sets.length : 0;
    days.push({ date: key, totalSets, totalVolume });
  }

  const totalVolume = days.reduce((a, d) => a + d.totalVolume, 0);

  let topVolumeDay: WorkoutWeeklySummary['topVolumeDay'] = null;
  for (const d of days) {
    if (!topVolumeDay || d.totalVolume > topVolumeDay.totalVolume)
      topVolumeDay = { date: d.date, totalVolume: d.totalVolume };
  }

  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].totalSets > 0) streak++;
    else break;
  }

  return { last7Days: days, totalVolume, topVolumeDay, streak };
}

export async function getGroupVolumeThisWeek(): Promise<GroupVolume[]> {
  const list = readGym();
  const map = new Map<LiftTag, number>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toLocalYMD(d);
    const entry = list.find((w) => w.date === key);
    if (!entry) continue;

    for (const s of entry.sets) {
      if (s.marker === 'warmup') continue;
      (s.tags || []).forEach((tag) => map.set(tag, (map.get(tag) || 0) + 1));
    }
  }

  return Array.from(map.entries()).map(([group, sets]) => ({ group, sets }));
}

// ===============================
//          RUTINAS (LS)
// ===============================
const ROUTINES_KEY = LS_KEYS.routines;

export function getRoutines(): RoutineTemplate[] {
  return readJSON<RoutineTemplate[]>(ROUTINES_KEY, []);
}

export function saveRoutine(rt: RoutineTemplate) {
  const list = getRoutines();
  const idx = list.findIndex((r) => r._id === rt._id);
  const now = new Date().toISOString();
  if (idx >= 0) list[idx] = { ...rt, updatedAt: now };
  else list.push({ ...rt, createdAt: now, updatedAt: now });
  writeJSON(ROUTINES_KEY, list);
}
function shortId(prefix = ''): string {
  // tipamos sin usar "any"
  const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
  const uuid = g.crypto?.randomUUID?.();
  const base = uuid ?? Math.random().toString(36).slice(2, 10);
  return `${prefix}${base.slice(0, 8)}`;
}

export function duplicateRoutine(id: string) {
  const list = getRoutines();
  const found = list.find((r) => r._id === id);
  if (!found) return;

  const copy: RoutineTemplate = {
    ...found,
    _id: shortId('rt_'),
    name: `${found.name} (copia)`,
  };

  saveRoutine(copy);
  return copy;
}


export function seedDefaultRoutinesOnce() {
  const list = getRoutines();
  if (list.length) return;
  const now = new Date().toISOString();
  const seed: RoutineTemplate[] = [
    {
      _id: 'rt_ppl',
      name: 'PPL (Push/Pull/Legs)',
      createdAt: now,
      updatedAt: now,
      days: [
        {
          name: 'Push',
          blocks: [
            { exercise: 'Press banca', tags: ['pecho', 'empuje'], targetScheme: '5x5 @80%' },
            { exercise: 'Press militar', tags: ['hombro', 'empuje'], targetScheme: '3x8 @70%' },
            { exercise: 'Fondos', tags: ['pecho', 'hombro'] },
          ],
        },
        {
          name: 'Pull',
          blocks: [
            { exercise: 'Dominadas', tags: ['espalda', 'tirón'], targetScheme: '5x5 @BW' },
            { exercise: 'Remo con barra', tags: ['espalda', 'tirón'], targetScheme: '4x8 @72%' },
          ],
        },
        {
          name: 'Legs',
          blocks: [
            { exercise: 'Sentadilla', tags: ['pierna', 'cuádriceps'], targetScheme: '5x5 @80%' },
            { exercise: 'Peso muerto rumano', tags: ['isquios', 'glúteo'], targetScheme: '3x8 @70%' },
          ],
        },
      ],
    },
    {
      _id: 'rt_fb3',
      name: 'Full Body 3x',
      createdAt: now,
      updatedAt: now,
      days: [
        {
          name: 'Día A',
          blocks: [
            { exercise: 'Sentadilla', tags: ['pierna'], targetScheme: '3x5 @75%' },
            { exercise: 'Press banca', tags: ['pecho'], targetScheme: '3x5 @75%' },
            { exercise: 'Remo con barra', tags: ['espalda'], targetScheme: '3x8 @70%' },
          ],
        },
        {
          name: 'Día B',
          blocks: [
            { exercise: 'Peso muerto', tags: ['espalda', 'pierna'], targetScheme: '3x3 @85%' },
            { exercise: 'Press militar', tags: ['hombro'], targetScheme: '3x5 @75%' },
            { exercise: 'Dominadas', tags: ['espalda', 'tirón'], targetScheme: '3xAMRAP' },
          ],
        },
        {
          name: 'Día C',
          blocks: [
            { exercise: 'Zancadas', tags: ['pierna'], targetScheme: '3x10' },
            { exercise: 'Press inclinado', tags: ['pecho'], targetScheme: '3x8 @70%' },
            { exercise: 'Face pull', tags: ['hombro'], targetScheme: '3x12' },
          ],
        },
      ],
    },
  ];
  writeJSON(ROUTINES_KEY, seed);
}

// ===============================
//     Favoritos de Ejercicios
// ===============================
const FAVORITES_KEY = LS_KEYS.favExercises;

export function toggleFavoriteExercise(name: string) {
  const favs = readJSON<string[]>(FAVORITES_KEY, []);
  const i = favs.indexOf(name);
  if (i >= 0) favs.splice(i, 1);
  else favs.push(name);
  writeJSON(FAVORITES_KEY, favs);
  return favs;
}

export function getFavoriteExercises() {
  return readJSON<string[]>(FAVORITES_KEY, []);
}

// ===============================
//            CARDIO
// ===============================
const CARDIO_KEY = LS_KEYS.cardio;

function readCardio(): CardioEntry[] {
  return readJSON<CardioEntry[]>(CARDIO_KEY, []);
}
function writeCardio(list: CardioEntry[]) {
  writeJSON(CARDIO_KEY, list);
}

export async function addCardioToday(
  input: Omit<CardioEntry, '_id' | 'date' | 'createdAt' | 'updatedAt'>
) {
  const date = todayKey();
  const now = new Date().toISOString();
  const entry: CardioEntry = {
    _id: `ca_${Math.random().toString(36).slice(2, 9)}`,
    date,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  const list = readCardio();
  list.push(entry);
  writeCardio(list);
  return entry;
}

export async function getCardioWeek() {
  const list = readCardio();
  const days: Array<{ date: string; minutes: number; distanceKm: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toLocalYMD(d);
    const ofDay = list.filter((c) => c.date === key);
    days.push({
      date: key,
      minutes: ofDay.reduce((a, c) => a + c.minutes, 0),
      distanceKm: ofDay.reduce((a, c) => a + (c.distanceKm || 0), 0),
    });
  }
  return { days };
}

// ===============================
//        Goals & Badges (LS)
// ===============================
const GOALS_KEY = LS_KEYS.goals;
const BADGES_KEY = LS_KEYS.badges;

export function getGoals(): CardioGoals {
  return readJSON<CardioGoals>(GOALS_KEY, { dailySteps: 10000, weeklySessions: 3 });
}
export function setGoals(g: CardioGoals) {
  writeJSON(GOALS_KEY, g);
}
export function getBadges(): Badge[] {
  return readJSON<Badge[]>(BADGES_KEY, []);
}
export function unlockBadge(code: string, title: string) {
  const badges = getBadges();
  if (badges.some((b) => b.code === code)) return badges;
  badges.push({ code, title, unlockedAt: new Date().toISOString() });
  writeJSON(BADGES_KEY, badges);
  return badges;
}

// ===============================
//        Fórmulas de fuerza
// ===============================
export function epley1RM(weight: number, reps: number) {
  return Math.round(weight * (1 + reps / 30));
}
export function brzycki1RM(weight: number, reps: number) {
  return Math.round(weight * (36 / (37 - reps)));
}
export function targetFromPercent1RM(oneRm: number, percent: number) {
  const raw = oneRm * (percent / 100);
  return Math.round(raw / 2.5) * 2.5;
}

// ===============================
//  Auth & Perfil (mock/local)
//  (incluido aquí para mantener 5 archivos)
// ===============================
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const validUsers = [
    { email: 'test@example.com', password: '123456', name: 'Carlos Test' },
    { email: 'carlos@test.com', password: '123456', name: 'Carlos Dev' },
  ];
  const u = validUsers.find((x) => x.email === email && x.password === password);
  if (u) {
    return {
      token: 'fake-jwt-token',
      user: {
        _id: `user-${Math.random().toString(36).slice(2, 9)}`,
        name: u.name,
        email: u.email,
        avatar: `https://i.pravatar.cc/150?u=${u.email}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as User,
    };
  }
  throw new Error('Credenciales inválidas');
}

export async function getCurrentUser(token: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 300));
  const user = localStorage.getItem('user');
  if (!token || !user) throw new Error('No hay sesión válida');
  return JSON.parse(user);
}

export async function logoutUser(): Promise<void> {
  try {
    // Si tuvieras endpoint real de logout, podrías llamarlo aquí.
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export async function updateUserProfile(input: Partial<Pick<User, 'name' | 'avatar'>>) {
  await new Promise((r) => setTimeout(r, 200));
  const raw = localStorage.getItem('user');
  if (!raw) throw new Error('No hay sesión');
  const current = JSON.parse(raw) as User;
  const updated: User = { ...current, ...input, updatedAt: new Date().toISOString() };
  localStorage.setItem('user', JSON.stringify(updated));
  return updated;
}

export async function changePasswordMock(currentPass: string, newPass: string) {
  await new Promise((r) => setTimeout(r, 250));
  if (newPass.length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  localStorage.setItem('lastPasswordChangeAt', new Date().toISOString());
  return true;
}
