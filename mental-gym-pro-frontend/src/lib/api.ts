// src/lib/api.ts
// ==============================================
//                IMPORTS / TIPOS
// ==============================================
import type {
  Exercise,
  Challenge,
  UserProgress,
  ExerciseResult,
  User,
  ExerciseSession,
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
} from '@/types'

// ==============================================
//            CONSTANTES / CONFIG / HELPERS
// ==============================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const ACTIVITY_KEY = 'mgp_activity_log' // localStorage key para actividad

// Fecha local YYYY-MM-DD (evita líos de zona horaria)
function toLocalYMD(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function todayKey(d = new Date()) {
  return toLocalYMD(d)
}

// ==============================================
//                 MOCKS (DEMO)
// ==============================================
const mockExercises: Exercise[] = [
  {
    _id: '1',
    title: 'Memoria de Números',
    description: 'Recuerda y repite secuencias numéricas de longitud creciente',
    category: 'memoria',
    difficulty: 'easy',
    duration: 5,
    instructions: [
      'Memoriza el número que aparecerá en pantalla.',
      'Espera a que desaparezca.',
      'Ingresa el número exacto que viste.',
      'Cada ronda aumenta la dificultad.',
      'Completa 5 rondas para finalizar.',
    ],
    createdAt: '2023-05-15T10:00:00Z',
    updatedAt: '2023-05-16T12:00:00Z',
  },
  {
    _id: '2',
    title: 'Búsqueda Rápida de Patrones',
    description: 'Encuentra el patrón que no encaja en una serie de imágenes.',
    category: 'atencion',
    difficulty: 'medium',
    duration: 8,
    instructions: [
      'Se mostrarán 9 imágenes con patrones.',
      'Uno de los patrones es diferente al resto.',
      'Haz clic en la imagen que contenga el patrón único.',
      'Tienes 10 segundos por ronda para encontrarlo.',
      'Completa 10 rondas para finalizar el ejercicio.',
    ],
    createdAt: '2023-06-20T12:30:00Z',
    updatedAt: '2023-05-16T12:00:00Z',
  },
  {
    _id: '3',
    title: 'Cálculo Mental Avanzado',
    description: 'Resuelve operaciones matemáticas complejas en poco tiempo.',
    category: 'calculo',
    difficulty: 'hard',
    duration: 10,
    instructions: [
      'Se te presentarán ecuaciones con tiempo limitado.',
      'Incluye suma, resta, multiplicación y división.',
      'Responde tan rápido como puedas.',
      'El tiempo se reduce en cada nivel.',
      'Completa 20 niveles para ganar.',
    ],
    createdAt: '2023-07-01T08:45:00Z',
    updatedAt: '2023-05-16T12:00:00Z',
  },
  {
    _id: '4',
    title: 'Lógica del Silogismo',
    description: 'Determina si la conclusión de un silogismo es válida.',
    category: 'logica',
    difficulty: 'medium',
    duration: 7,
    instructions: [
      'Lee las dos premisas y la conclusión.',
      'Pulsa "Válido" si la conclusión se deriva lógicamente.',
      'Pulsa "No Válido" si no es así.',
      'Responde a 15 silogismos.',
    ],
    createdAt: '2023-08-10T14:20:00Z',
    updatedAt: '2023-05-16T12:00:00Z',
  },
]

const mockUserProgress: UserProgress = {
  weeklyData: [5, 8, 12, 10, 15, 18, 20],
  streak: 7,
  totalExercises: 45,
  averageScore: 85,
}

const mockActiveChallenges: Challenge[] = [
  {
    _id: 'ch-1',
    title: 'Maratón de Memoria',
    description: 'Supera 50 niveles del juego de memoria.',
    objective: 'Completar 50 niveles',
    durationDays: 30,
    isCompleted: false,
    exercises: ['1', '2', '3'],
    expiresAt: '2025-09-01T00:00:00Z',
    participants: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'ch-2',
    title: 'El Lógico',
    description: 'Resuelve 20 enigmas de lógica en el menor tiempo.',
    objective: 'Resolver 20 enigmas',
    durationDays: 15,
    isCompleted: false,
    exercises: ['4', '5'],
    expiresAt: '2025-08-25T23:59:59Z',
    participants: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'ch-3',
    title: 'Atención al Detalle',
    description: 'Encuentra diferencias en imágenes complejas.',
    objective: 'Completar 30 niveles',
    durationDays: 7,
    isCompleted: false,
    exercises: ['6', '7'],
    expiresAt: '',
    participants: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// ==============================================
//          APIS DE EJERCICIOS (MOCK)
// ==============================================
export async function fetchExercises(): Promise<Exercise[]> {
  await new Promise((r) => setTimeout(r, 400))
  return mockExercises
}

export async function fetchExerciseCategories(): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 300))
  return Array.from(new Set(mockExercises.map((ex) => ex.category)))
}

export async function fetchUserProgress(): Promise<UserProgress> {
  await new Promise((r) => setTimeout(r, 500))
  return mockUserProgress
}

export async function fetchActiveChallenges(): Promise<Challenge[]> {
  await new Promise((r) => setTimeout(r, 600))
  return mockActiveChallenges
}

export async function fetchRecentExercises(limit: number): Promise<Exercise[]> {
  await new Promise((r) => setTimeout(r, 400))
  return mockExercises.slice(0, limit)
}

export async function fetchExerciseById(id: string): Promise<Exercise> {
  await new Promise((r) => setTimeout(r, 500))
  if (Math.random() < 0.1) throw new Error('Simulación de error de red o servidor.')
  const exercise = mockExercises.find((ex) => ex._id === id)
  if (!exercise) throw new Error(`Exercise with ID '${id}' not found.`)
  return exercise
}

export async function startExerciseSession(exerciseId: string): Promise<{ _id: string }> {
  await new Promise((r) => setTimeout(r, 300))
  console.log(`Simulando inicio de sesión para el ejercicio ${exerciseId}`)
  return { _id: `sess_${Math.random().toString(36).slice(2, 11)}` }
}

export async function completeExercise(
  sessionId: string,
  data: { score: number; timeSpent: number; metadata: Record<string, unknown> }
): Promise<ExerciseResult> {
  await new Promise((r) => setTimeout(r, 400))
  if (!sessionId || !sessionId.startsWith('sess_')) throw new Error('Invalid sessionId.')
  console.log(`Simulando finalización de sesión ${sessionId} con datos:`, data)
  return {
    _id: `res_${Math.random().toString(36).slice(2, 11)}`,
    sessionId,
    score: data.score,
    timeSpent: data.timeSpent,
    createdAt: new Date().toISOString(),
    metadata: data.metadata,
  }
}

// ==============================================
//               AUTENTICACIÓN (MOCK)
// ==============================================
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const validUsers = [
    { email: 'test@example.com', password: '123456', name: 'Carlos Test' },
    { email: 'carlos@test.com', password: '123456', name: 'Carlos Dev' },
  ]
  const u = validUsers.find((x) => x.email === email && x.password === password)
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
    }
  }
  throw new Error('Credenciales inválidas')
}

export async function getCurrentUser(token: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 300))
  const user = localStorage.getItem('user')
  if (!token || !user) throw new Error('No hay sesión válida')
  return JSON.parse(user)
}

// ==============================================
//        SESIONES DE EJERCICIO (BACKEND)
// ==============================================
export async function fetchMySessions(): Promise<ExerciseSession[]> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}/api/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('No se pudieron cargar las sesiones')
  return res.json()
}

// ==============================================
//            ACTIVIDAD FÍSICA (LOCALSTORE)
// ==============================================
function readActivity(): ActivityEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY)
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : []
  } catch {
    return []
  }
}
function writeActivity(list: ActivityEntry[]) {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(list))
}

export async function getActivities(): Promise<ActivityEntry[]> {
  await new Promise((r) => setTimeout(r, 150))
  return readActivity().sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function upsertTodayActivity(input: {
  steps: number
  minutes?: number
  calories?: number
  note?: string
}): Promise<ActivityEntry> {
  await new Promise((r) => setTimeout(r, 150))
  const list = readActivity()
  const date = todayKey()
  const now = new Date().toISOString()
  const idx = list.findIndex((e) => e.date === date)

  if (idx >= 0) {
    const updated: ActivityEntry = {
      ...list[idx],
      ...input,
      steps: Math.max(0, Math.floor(input.steps || 0)),
      updatedAt: now,
    }
    list[idx] = updated
    writeActivity(list)
    return updated
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
  } as ActivityEntry

  list.push(created)
  writeActivity(list)
  return created
}

export async function getWeeklyActivity(): Promise<WeeklyActivitySummary> {
  await new Promise((r) => setTimeout(r, 120))
  const list = readActivity()

  // últimos 7 días (incluye hoy)
  const days: Array<{ date: string; steps: number }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const key = todayKey(d)
    const found = list.find((e) => e.date === key)
    days.push({ date: key, steps: found?.steps ?? 0 })
  }

  const totalSteps = days.reduce((acc, d) => acc + d.steps, 0)
  const avgSteps = Math.round(totalSteps / 7)

  let bestDay: WeeklyActivitySummary['bestDay'] = null
  for (const d of days) {
    if (!bestDay || d.steps > bestDay.steps) bestDay = { date: d.date, steps: d.steps }
  }

  // racha: días consecutivos desde hoy con steps > 0
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].steps > 0) streak++
    else break
  }

  return { totalSteps, avgSteps, bestDay, streak, last7Days: days }
}


// ====== GYM WORKOUT (localStorage) ======
// ===== Constantes =====
const GYM_KEY = 'mgp_gym_workouts';
const ROUTINES_KEY = 'mgp_routines';
const FAVORITES_KEY = 'mgp_fav_exercises';
const CARDIO_KEY = 'mgp_cardio';
const GOALS_KEY = 'mgp_goals';
const BADGES_KEY = 'mgp_badges';

// ===== Utils =====
function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback }
}
function writeJSON<T>(key: string, val: T) { localStorage.setItem(key, JSON.stringify(val)) }

// ===== 1RM Helpers =====
export function epley1RM(weight: number, reps: number) { return Math.round(weight * (1 + reps/30)) }
export function brzycki1RM(weight: number, reps: number) { return Math.round(weight * (36 / (37 - reps))) }

// Calcular peso objetivo por %1RM (redondea a 2.5kg):
export function targetFromPercent1RM(oneRm: number, percent: number) {
  const raw = oneRm * (percent/100);
  return Math.round(raw / 2.5) * 2.5;
}

// ===== Rutinas / plantillas =====
export function getRoutines(): RoutineTemplate[] {
  return readJSON<RoutineTemplate[]>(ROUTINES_KEY, []);
}
export function saveRoutine(rt: RoutineTemplate) {
  const list = getRoutines();
  const idx = list.findIndex(r => r._id === rt._id);
  const now = new Date().toISOString();
  if (idx >= 0) list[idx] = {...rt, updatedAt: now}; else list.push({...rt, createdAt: now, updatedAt: now});
  writeJSON(ROUTINES_KEY, list);
}
export function duplicateRoutine(id: string) {
  const list = getRoutines();
  const found = list.find(r => r._id === id); if (!found) return;
  const copy = {...found, _id: `rt_${crypto.randomUUID().slice(0,8)}`, name: `${found.name} (copia)`};
  saveRoutine(copy);
  return copy;
}
export function seedDefaultRoutinesOnce() {
  const list = getRoutines(); if (list.length) return;
  const now = new Date().toISOString();
  const seed: RoutineTemplate[] = [
    {
      _id: 'rt_ppl',
      name: 'PPL (Push/Pull/Legs)',
      createdAt: now, updatedAt: now,
      days: [
        { name:'Push', blocks:[
          { exercise:'Press banca', tags:['pecho','empuje'], targetScheme:'5x5 @80%' },
          { exercise:'Press militar', tags:['hombro','empuje'], targetScheme:'3x8 @70%' },
          { exercise:'Fondos', tags:['pecho','hombro'] },
        ]},
        { name:'Pull', blocks:[
          { exercise:'Dominadas', tags:['espalda','tirón'], targetScheme:'5x5 @BW' },
          { exercise:'Remo con barra', tags:['espalda','tirón'], targetScheme:'4x8 @72%' },
        ]},
        { name:'Legs', blocks:[
          { exercise:'Sentadilla', tags:['pierna','cuádriceps'], targetScheme:'5x5 @80%' },
          { exercise:'Peso muerto rumano', tags:['isquios','glúteo'], targetScheme:'3x8 @70%' },
        ]},
      ]
    },
    {
      _id: 'rt_fb3',
      name: 'Full Body 3x',
      createdAt: now, updatedAt: now,
      days: [
        { name:'Día A', blocks:[
          { exercise:'Sentadilla', tags:['pierna'], targetScheme:'3x5 @75%' },
          { exercise:'Press banca', tags:['pecho'], targetScheme:'3x5 @75%' },
          { exercise:'Remo con barra', tags:['espalda'], targetScheme:'3x8 @70%' },
        ]},
        { name:'Día B', blocks:[
          { exercise:'Peso muerto', tags:['espalda','pierna'], targetScheme:'3x3 @85%' },
          { exercise:'Press militar', tags:['hombro'], targetScheme:'3x5 @75%' },
          { exercise:'Dominadas', tags:['espalda','tirón'], targetScheme:'3xAMRAP' },
        ]},
        { name:'Día C', blocks:[
          { exercise:'Zancadas', tags:['pierna'], targetScheme:'3x10' },
          { exercise:'Press inclinado', tags:['pecho'], targetScheme:'3x8 @70%' },
          { exercise:'Face pull', tags:['hombro'], targetScheme:'3x12' },
        ]},
      ]
    }
  ];
  writeJSON(ROUTINES_KEY, seed);
}

// ===== Favoritos de ejercicios =====
export function toggleFavoriteExercise(name: string) {
  const favs = readJSON<string[]>(FAVORITES_KEY, []);
  const i = favs.indexOf(name);
  if (i >= 0) favs.splice(i,1); else favs.push(name);
  writeJSON(FAVORITES_KEY, favs);
  return favs;
}
export function getFavoriteExercises() {
  return readJSON<string[]>(FAVORITES_KEY, []);
}

// ===== Workouts (sets) =====
function readGym(): WorkoutEntry[] { return readJSON<WorkoutEntry[]>(GYM_KEY, []) }
function writeGym(list: WorkoutEntry[]) { writeJSON(GYM_KEY, list) }

export async function addGymSetToday(set: Omit<LiftSet,'_id'|'createdAt'>) {
  await new Promise(r => setTimeout(r, 50));
  const list = readGym();
  const date = todayKey();
  const now = new Date().toISOString();
  let entry = list.find(w => w.date === date);

  const newSet: LiftSet = { _id:`set_${Math.random().toString(36).slice(2,9)}`, createdAt: now, ...set };
  if (!entry) {
    entry = { _id:`wo_${Math.random().toString(36).slice(2,9)}`, date, sets:[newSet], createdAt: now, updatedAt: now };
    list.push(entry);
  } else {
    entry.sets.push(newSet);
    entry.updatedAt = now;
  }
  writeGym(list);
  return entry;
}
export async function getGymWorkouts(): Promise<WorkoutEntry[]> {
  await new Promise(r => setTimeout(r, 30));
  return readGym().sort((a,b) => (a.date < b.date ? 1 : -1));
}
export async function getGymWeeklySummary(): Promise<WorkoutWeeklySummary> {
  await new Promise(r => setTimeout(r, 30));
  const list = readGym();
  const days: Array<{date:string; totalSets:number; totalVolume:number}> = [];
  for (let i=6;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const key = toLocalYMD(d);
    const entry = list.find(w=>w.date===key);
    const totalVolume = entry ? entry.sets.reduce((a,s)=>a + s.weight*s.reps,0) : 0;
    const totalSets = entry ? entry.sets.length : 0;
    days.push({ date:key, totalSets, totalVolume });
  }
  const totalVolume = days.reduce((a,d)=>a+d.totalVolume,0);
  let topVolumeDay: WorkoutWeeklySummary['topVolumeDay'] = null;
  for (const d of days) if (!topVolumeDay || d.totalVolume>topVolumeDay.totalVolume) topVolumeDay = {date:d.date, totalVolume:d.totalVolume};
  let streak = 0; for (let i=days.length-1;i>=0;i--) { if (days[i].totalSets>0) streak++; else break }
  return { last7Days: days, totalVolume, topVolumeDay, streak };
}
// Volumen por grupo muscular (series efectivas = sets no warmup):
export async function getGroupVolumeThisWeek(): Promise<GroupVolume[]> {
  const list = readGym(); const map = new Map<LiftTag,number>();
  for (let i=6;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const key = toLocalYMD(d);
    const entry = list.find(w=>w.date===key);
    if (!entry) continue;
    for (const s of entry.sets) {
      if (s.marker==='warmup') continue;
      (s.tags||[]).forEach(tag => map.set(tag, (map.get(tag)||0)+1));
    }
  }
  return Array.from(map.entries()).map(([group,sets])=>({group,sets}));
}

// ===== Cardio =====
function readCardio(): CardioEntry[] { return readJSON<CardioEntry[]>(CARDIO_KEY, []) }
function writeCardio(list: CardioEntry[]) { writeJSON(CARDIO_KEY, list) }

export async function addCardioToday(input: Omit<CardioEntry,'_id'|'date'|'createdAt'|'updatedAt'>) {
  const date = todayKey(); const now = new Date().toISOString();
  const entry: CardioEntry = { _id:`ca_${Math.random().toString(36).slice(2,9)}`, date, createdAt: now, updatedAt: now, ...input };
  const list = readCardio(); list.push(entry); writeCardio(list); return entry;
}
export async function getCardioWeek() {
  const list = readCardio();
  const days: Array<{date:string; minutes:number; distanceKm:number}> = [];
  for (let i=6;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const key = toLocalYMD(d);
    const ofDay = list.filter(c=>c.date===key);
    days.push({
      date: key,
      minutes: ofDay.reduce((a,c)=>a+c.minutes,0),
      distanceKm: ofDay.reduce((a,c)=>a+(c.distanceKm||0),0),
    });
  }
  return { days };
}

// ===== Goals & Badges =====
export function getGoals(): CardioGoals { return readJSON<CardioGoals>(GOALS_KEY, { dailySteps:10000, weeklySessions:3 }) }
export function setGoals(g: CardioGoals) { writeJSON(GOALS_KEY, g) }
export function getBadges(): Badge[] { return readJSON<Badge[]>(BADGES_KEY, []) }
export function unlockBadge(code: string, title: string) {
  const badges = getBadges(); if (badges.some(b=>b.code===code)) return badges;
  badges.push({ code, title, unlockedAt: new Date().toISOString() }); writeJSON(BADGES_KEY, badges); return badges;
}