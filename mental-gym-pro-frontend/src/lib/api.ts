/* // src/lib/api.ts
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
   FoodItem,
  MealEntry,
  MealType,
  DailyNutrition,
  NutritionTargets,
  WeeklyNutritionSummary,
  FoodFavorite,
} from '@/types'

// ==============================================
//            CONSTANTES / CONFIG / HELPERS
// ==============================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const ACTIVITY_KEY = 'mgp_activity_log' // localStorage key para actividad
const API = API_URL; // 👈 asegúrate de que existe *una sola vez* y bien arriba

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
//          APIS DE EJERCICIOS (BACKEND + MOCK)
// ==============================================
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === '1';

// ——— Mock de ejercicios ———
const MOCK_EXERCISES: Exercise[] = [
  {
    _id: 'ex_mem_pairs',
    title: 'Memoria de pares',
    description: 'Encuentra todas las parejas de cartas iguales lo más rápido posible.',
    category: 'memoria',
    difficulty: 'easy',
    duration: 5,
    instructions: [
      'Haz clic en dos cartas para voltearlas.',
      'Si son iguales, quedarán descubiertas.',
      'Encuentra todas las parejas en el menor tiempo posible.'
    ],
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
    engine: 'memory-pairs'
  },
  {
    _id: 'ex_logic_seq',
    title: 'Secuencias lógicas',
    description: 'Identifica el patrón y completa la secuencia correctamente.',
    category: 'logica',
    difficulty: 'medium',
    duration: 6,
    instructions: [
      'Observa la secuencia de elementos mostrada.',
      'Identifica el patrón lógico que siguen.',
      'Selecciona la opción correcta para completarla.'
    ],
    createdAt: '2025-01-02T10:00:00Z',
    updatedAt: '2025-01-02T10:00:00Z',
    engine: 'logic-seq'
  },
  {
    _id: 'ex_attention_sel',
    title: 'Atención selectiva',
    description: 'Encuentra el elemento objetivo entre múltiples distractores.',
    category: 'atencion',
    difficulty: 'medium',
    duration: 4,
    instructions: [
      'Observa el conjunto de elementos en pantalla.',
      'Identifica el elemento objetivo indicado al inicio.',
      'Haz clic sobre todos los elementos que coincidan.'
    ],
    createdAt: '2025-01-03T10:00:00Z',
    updatedAt: '2025-01-03T10:00:00Z',
    engine: 'attention-selective'
  },
  {
    _id: 'ex_calc_fast',
    title: 'Cálculo rápido',
    description: 'Resuelve operaciones matemáticas lo más rápido posible.',
    category: 'calculo',
    difficulty: 'hard',
    duration: 6,
    instructions: [
      'Lee la operación matemática en pantalla.',
      'Escribe el resultado en el cuadro de respuesta.',
      'Resuelve tantas operaciones como puedas en el tiempo asignado.'
    ],
    createdAt: '2025-01-04T10:00:00Z',
    updatedAt: '2025-01-04T10:00:00Z',
    engine: 'mental-math'
  },
  {
    _id: 'ex_speed_react',
    title: 'Velocidad de reacción',
    description: 'Haz clic lo más rápido posible cuando aparezca la señal.',
    category: 'velocidad',
    difficulty: 'easy',
    duration: 3,
    instructions: [
      'Mantente atento a la pantalla.',
      'Haz clic tan pronto como aparezca la señal visual o sonora.',
      'Evita hacer clic antes de tiempo.'
    ],
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z',
    engine: 'reaction-speed'
  },
  {
    _id: 'ex_flex_cog',
    title: 'Flexibilidad cognitiva',
    description: 'Cambia entre diferentes reglas de clasificación lo más rápido posible.',
    category: 'flexibilidad',
    difficulty: 'medium',
    duration: 5,
    instructions: [
      'Observa la regla actual para clasificar los elementos.',
      'Cuando cambie la regla, adapta tu respuesta rápidamente.',
      'Clasifica tantos elementos como puedas en el tiempo disponible.'
    ],
    createdAt: '2025-01-06T10:00:00Z',
    updatedAt: '2025-01-06T10:00:00Z',
    engine: 'cognitive-flex'
  }
];


// ——— Helper genérico ———
async function getJSON<T>(paths: string[], init?: RequestInit): Promise<T> {
  let lastErr: unknown;
  for (const p of paths) {
    try {
      const res = await fetch(`${API}${p}`, { ...init, credentials: 'include' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return (await res.json()) as T;
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr instanceof Error) throw lastErr;
  throw new Error(String(lastErr ?? 'Fetch failed'));
}
function normalizeExercise(e: Exercise): Exercise {
  return {
    ...e,
    instructions: e.instructions ?? [],
    duration: e.duration ?? 5,
  };
}
// ——— API con fallback ———
export async function fetchExercises(): Promise<Exercise[]> {
  if (USE_MOCK) return MOCK_EXERCISES.map(normalizeExercise);
  try {
    const items = await getJSON<Exercise[]>(['/exercises', '/api/exercises']);
    return items.map(normalizeExercise);
  } catch (err) {
    console.warn('[fetchExercises] backend falló, usando mock:', err);
    return MOCK_EXERCISES.map(normalizeExercise);
  }
}
export async function fetchExerciseCategories(): Promise<string[]> {
  const items = await fetchExercises();
  return Array.from(new Set(items.map(e => e.category)));
}
export async function fetchExerciseById(id: string): Promise<Exercise> {
  if (USE_MOCK) {
    const found = MOCK_EXERCISES.find(e => e._id === id);
    if (!found) throw new Error(`Exercise ${id} not found (mock)`);
    return normalizeExercise(found);
  }
  try {
    const e = await getJSON<Exercise>([`/exercises/${id}`, `/api/exercises/${id}`]);
    return normalizeExercise(e);
  } catch (err) {
    const fallback = MOCK_EXERCISES.find(e => e._id === id);
    if (fallback) {
      console.warn('[fetchExerciseById] backend falló, usando mock:', err);
      return normalizeExercise(fallback);
    }
    throw err;
  }
}
export async function fetchRecentExercises(limit = 3): Promise<Exercise[]> {
  const items = await fetchExercises();
  return items
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit);
}
export async function startExerciseSession(exerciseId: string): Promise<{ _id: string }> {
  // Mock directo si está activado
  if (USE_MOCK) {
    return { _id: `sess_${Math.random().toString(36).slice(2, 11)}` };
  }

  // Rutas backend más comunes
  const tries: Array<{ path: string; init: RequestInit }> = [
    { path: `/exercises/${exerciseId}/sessions`, init: { method: 'POST', credentials: 'include' } },
    { path: `/api/exercises/${exerciseId}/sessions`, init: { method: 'POST', credentials: 'include' } },
    {
      path: `/sessions`,
      init: {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId }),
      },
    },
    {
      path: `/api/sessions`,
      init: {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId }),
      },
    },
  ];

  let lastErr: unknown;

  for (const t of tries) {
    try {
      const res = await fetch(`${API}${t.path}`, t.init);
      if (res.ok) return await res.json();
      lastErr = new Error(`${res.status} ${res.statusText} on ${t.path}`);
    } catch (e) {
      lastErr = e;
    }
  }

  // Fallback en desarrollo: crea sesión mock aunque el backend falle
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[startExerciseSession] backend falló, usando sesión mock:', lastErr);
    return { _id: `sess_${Math.random().toString(36).slice(2, 11)}` };
  }

  throw (lastErr instanceof Error ? lastErr : new Error(String(lastErr ?? 'Cannot start session')));
}
// ---- Progreso y desafíos (mock + fallback) ----
const MOCK_PROGRESS: UserProgress = {
  weeklyData: [5, 8, 12, 10, 15, 18, 20],
  streak: 7,
  totalExercises: 45,
  averageScore: 85,
};

const MOCK_CHALLENGES: Challenge[] = [
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
export async function fetchUserProgress(): Promise<UserProgress> {
  if (USE_MOCK) return MOCK_PROGRESS;
  try {
    const res = await fetch(`${API}/stats/me`, { credentials: 'include' });
    if (!res.ok) throw new Error('No se pudo cargar el progreso');
    return res.json();
  } catch (e) {
    console.warn('[fetchUserProgress] backend falló, usando mock:', e);
    return MOCK_PROGRESS;
  }
}
export async function fetchActiveChallenges(): Promise<Challenge[]> {
  if (USE_MOCK) return MOCK_CHALLENGES;
  try {
    const tryGet = async (p: string) => fetch(`${API}${p}`, { credentials: 'include' });
    let res = await tryGet('/challenges/active');
    if (!res.ok) res = await tryGet('/api/challenges/active');
    if (!res.ok) throw new Error('No se pudieron cargar los desafíos activos');
    return res.json();
  } catch (e) {
    console.warn('[fetchActiveChallenges] backend falló, usando mock:', e);
    return MOCK_CHALLENGES;
  }
}

// (Opcional) completar sesión con mock
export async function completeExercise(
  sessionId: string,
  data: { score: number; timeSpent: number; metadata: Record<string, unknown> }
): Promise<ExerciseResult> {
  // 1) Short-circuit en mock o sesiones locales
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

  // 2) Intentos contra backend; si fallan, devolvemos resultado local
  const body = JSON.stringify(data);
  const tries = [
    { path: `/sessions/${sessionId}/complete` },
    { path: `/api/sessions/${sessionId}/complete` },
  ];

  for (const t of tries) {
    try {
      const res = await fetch(`${API_URL}${t.path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body,
      });
      if (res.ok) return res.json();
    } catch {
      // seguimos con el siguiente intento
    }
  }

  // 3) Fallback: evita romper la UX
  console.warn('[completeExercise] backend no disponible, devolviendo resultado mock');
  return {
    _id: `res_${Math.random().toString(36).slice(2, 11)}`,
    sessionId,
    score: data.score,
    timeSpent: data.timeSpent,
    createdAt: new Date().toISOString(),
    metadata: data.metadata,
  };
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
// ===== NUTRICIÓN (localStorage) =====
const NUTR_DAY_KEY = 'mgp_nutrition_day';
const NUTR_FAV_KEY = 'mgp_nutrition_favs';
const NUTR_TARGETS_KEY = 'mgp_nutrition_targets';
const NUTR_FOOD_DB_KEY = 'mgp_food_db';

type LSAny = string;
function readLS<T>(k: string, fb: T): T {
  if (typeof window === 'undefined') return fb;
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) as T : fb; } catch { return fb; }
}
function writeLS<T>(k: string, v: T) { localStorage.setItem(k, JSON.stringify(v)); }

// Semilla de alimentos
export function seedFoodDbOnce() {
  const exist = readLS<LSAny[]>(NUTR_FOOD_DB_KEY, []);
  if (exist.length) return;
  const demo: FoodItem[] = [
    { _id:'f_apple', name:'Manzana', kcal:52, protein:0.3, carbs:14, fat:0.2, unit:'100g', tags:['fruta'] },
    { _id:'f_oats', name:'Avena', kcal:389, protein:16.9, carbs:66, fat:6.9, unit:'100g', tags:['cereal'] },
    { _id:'f_egg', name:'Huevo', kcal:70, protein:6, carbs:0.6, fat:5, unit:'unidad', tags:['proteína'] },
    { _id:'f_chicken', name:'Pollo pechuga', kcal:165, protein:31, carbs:0, fat:3.6, unit:'100g', tags:['proteína'] },
    { _id:'f_rice', name:'Arroz cocido', kcal:130, protein:2.7, carbs:28, fat:0.3, unit:'100g', tags:['cereal'] },
    { _id:'f_yogurt', name:'Yogur natural', kcal:61, protein:3.5, carbs:4.7, fat:3.3, unit:'100g', tags:['lácteo'] },
  ];
  writeLS(NUTR_FOOD_DB_KEY, demo);
}

export function getFoodDb(): FoodItem[] {
  return readLS<FoodItem[]>(NUTR_FOOD_DB_KEY, []);
}
export function addFoodToDb(item: Omit<FoodItem,'_id'>) {
  const list = getFoodDb();
  const withId: FoodItem = { ...item, _id: `f_${Math.random().toString(36).slice(2,9)}` };
  list.push(withId); writeLS(NUTR_FOOD_DB_KEY, list);
  return withId;
}
export function getNutritionTargets(): NutritionTargets {
  return readLS<NutritionTargets>(NUTR_TARGETS_KEY, { kcal: 2200, protein: 140, carbs: 220, fat: 70, waterMl: 2000 });
}
export function setNutritionTargets(t: NutritionTargets) { writeLS(NUTR_TARGETS_KEY, t); }

function dayKey(date = new Date()) { return toLocalYMD(date); }
function readDay(dateKey = dayKey()): DailyNutrition {
  const map = readLS<Record<string, DailyNutrition>>(NUTR_DAY_KEY, {});
  return map[dateKey] || { date: dateKey, kcal:0, protein:0, carbs:0, fat:0, waterMl:0, meals: [] };
}
function writeDay(day: DailyNutrition) {
  const map = readLS<Record<string, DailyNutrition>>(NUTR_DAY_KEY, {});
  map[day.date] = day; writeLS(NUTR_DAY_KEY, map);
}

export function getFavoritesFoods(): FoodFavorite[] {
  return readLS<FoodFavorite[]>(NUTR_FAV_KEY, []);
}
export function toggleFavoriteFood(name: string) {
  const favs = getFavoritesFoods();
  const i = favs.indexOf(name);
  if (i >= 0) favs.splice(i, 1); else favs.push(name);
  writeLS(NUTR_FAV_KEY, favs); return favs;
}

export function addWaterToday(ml: number) {
  const d = readDay(); d.waterMl = Math.max(0, d.waterMl + ml); writeDay(d); return d.waterMl;
}
export function addMealToday(input: { type: MealType; foodName: string; amount: number }) {
  const db = getFoodDb();
  const food = db.find(f => f.name.toLowerCase() === input.foodName.toLowerCase());
  if (!food) throw new Error('Alimento no encontrado en DB');

  // si la unidad es '100g', amount = gramos; si es 'unidad', amount = nº unidades
  const factor = food.unit === 'unidad' ? input.amount : input.amount / 100;
  const kcal = Math.round(food.kcal * factor);
  const protein = +(food.protein * factor).toFixed(1);
  const carbs = +(food.carbs * factor).toFixed(1);
  const fat = +(food.fat * factor).toFixed(1);

  const now = new Date().toISOString();
  const entry: MealEntry = {
    _id: `m_${Math.random().toString(36).slice(2,9)}`,
    date: dayKey(),
    type: input.type,
    foodName: food.name,
    amount: input.amount,
    kcal, protein, carbs, fat,
    createdAt: now
  };

  const d = readDay();
  d.meals.push(entry);
  d.kcal += kcal; d.protein += protein; d.carbs += carbs; d.fat += fat;
  writeDay(d);
  return entry;
}
export function getTodayNutrition(): DailyNutrition {
  return readDay();
}
export function getWeekNutrition(): WeeklyNutritionSummary {
  const map = readLS<Record<string, DailyNutrition>>(NUTR_DAY_KEY, {});
  const days: WeeklyNutritionSummary['days'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = toLocalYMD(d);
    const day = map[key] || { date: key, kcal:0, protein:0, carbs:0, fat:0, waterMl:0, meals: [] };
    days.push({ date: key, kcal: day.kcal, protein: day.protein, carbs: day.carbs, fat: day.fat, waterMl: day.waterMl });
  }
  const sum = days.reduce((a, b) => ({
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    waterMl: a.waterMl + b.waterMl,
  }), { kcal:0, protein:0, carbs:0, fat:0, waterMl:0 });

  return {
    days,
    avg: {
      kcal: Math.round(sum.kcal / 7),
      protein: Math.round(sum.protein / 7),
      carbs: Math.round(sum.carbs / 7),
      fat: Math.round(sum.fat / 7),
      waterMl: Math.round(sum.waterMl / 7),
    }
  };
}

// ==============================================
//               AUTENTICACIÓN (MOCK)
// ==============================================

export async function logoutUser(): Promise<void> {
  try {
    const token = localStorage.getItem('token')
    // Si tienes endpoint, inténtalo, pero no lances si falla.
    if (token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
  } finally {
    // Pase lo que pase, limpiamos el cliente
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

// --- Perfil (mock/localStorage) ---
export async function updateUserProfile(input: Partial<Pick<User, 'name'|'avatar'>>) {
  await new Promise(r => setTimeout(r, 200))
  const raw = localStorage.getItem('user')
  if (!raw) throw new Error('No hay sesión')
  const current = JSON.parse(raw) as User
  const updated: User = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem('user', JSON.stringify(updated))
  return updated
}

// mock de cambio de contraseña (solo valida y “guarda” la hash en LS)
export async function changePasswordMock(currentPass: string, newPass: string) {
  await new Promise(r => setTimeout(r, 250))
  if (newPass.length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres')
  // en real: POST al backend. Aquí solo marcamos un flag.
  localStorage.setItem('lastPasswordChangeAt', new Date().toISOString())
  return true
}
 */