// src/lib/api/exercises.ts
import type { Exercise, ExerciseResult, ExerciseSession } from '@/types';
import { API, USE_MOCK, getJSON, postJSON } from './config';

// ===============================
//      MOCKS + NORMALIZADOR
// ===============================
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

function normalizeExercise(e: Exercise): Exercise {
  return { ...e, instructions: e.instructions ?? [], duration: e.duration ?? 5 };
}

// ===============================
//         EJERCICIOS (API)
// ===============================
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
    const fb = MOCK_EXERCISES.find(e => e._id === id);
    if (fb) {
      console.warn('[fetchExerciseById] backend falló, usando mock:', err);
      return normalizeExercise(fb);
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

export async function fetchExerciseCategories(): Promise<string[]> {
  const items = await fetchExercises();
  return Array.from(new Set(items.map(e => e.category)));
}

// ===============================
//       SESIONES (API)
// ===============================
export async function startExerciseSession(exerciseId: string): Promise<{ _id: string }> {
  if (USE_MOCK) {
    return { _id: `sess_${Math.random().toString(36).slice(2, 11)}` };
  }

  const tries: Array<{ path: string; init?: RequestInit }> = [
    { path: `/exercises/${exerciseId}/sessions`, init: { method: 'POST', credentials: 'include' } },
    { path: `/api/exercises/${exerciseId}/sessions`, init: { method: 'POST', credentials: 'include' } },
    { path: `/sessions`, init: { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ exerciseId }) } },
    { path: `/api/sessions`, init: { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ exerciseId }) } },
  ];

  let lastErr: unknown;
  for (const t of tries) {
    try {
      const res = await fetch(`${API}${t.path}`, t.init);
      if (res.ok) return await res.json();
      lastErr = new Error(`${res.status} ${res.statusText} on ${t.path}`);
    } catch (e) { lastErr = e; }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[startExerciseSession] backend falló, usando sesión mock:', lastErr);
    return { _id: `sess_${Math.random().toString(36).slice(2, 11)}` };
  }

  throw (lastErr instanceof Error ? lastErr : new Error(String(lastErr ?? 'Cannot start session')));
}

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

  const tries = [`/sessions/${sessionId}/complete`, `/api/sessions/${sessionId}/complete`];
  for (const p of tries) {
    try {
      return await postJSON<ExerciseResult>(p, data);
    } catch {}
  }

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

export async function fetchMySessions(): Promise<ExerciseSession[]> {
  const res = await fetch(`${API}/api/sessions`, { credentials: 'include' });
  if (!res.ok) throw new Error('No se pudieron cargar las sesiones');
  return res.json();
}
