import type { Exercise, ExerciseResult, ExerciseSession, PaginatedExercises, ExFilters } from '@/types';
import { USE_MOCK, getJSON, postJSON, get } from '../config';

// ===============================
//     Configuración de MOCK
// ===============================
// Fuerza MOCK para este archivo, ideal para desarrollo y pruebas de UI.
const FORCE_MOCK = true;
const ACTUAL_USE_MOCK = USE_MOCK || FORCE_MOCK;
console.log('🔍 USE_MOCK en exercises.ts:', ACTUAL_USE_MOCK);


// ===============================
//        MOCKS + NORMALIZADOR
// ===============================
const MOCK_EXERCISES: Exercise[] = [
  {
    _id: 'ex_mem_pairs',
    slug: 'memoria-de-pares',
    title: 'Memoria de pares',
    description: 'Encuentra todas las parejas de cartas iguales lo más rápido posible.',
    category: 'memoria',
    difficulty: 'easy',
    duration: 5,
    instructions: [
      'Haz clic en dos cartas para voltearlas.',
      'Si son iguales, quedarán descubiertas.',
      'Encuentra todas las parejas en el menor tiempo posible.',
    ],
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
    engine: 'memory-pairs',
  },
  {
    _id: 'ex_logic_seq',
    slug: 'secuencias-logicas',
    title: 'Secuencias lógicas',
    description: 'Identifica el patrón y completa la secuencia correctamente.',
    category: 'logica',
    difficulty: 'medium',
    duration: 6,
    instructions: [
      'Observa la secuencia de elementos mostrada.',
      'Identifica el patrón lógico que siguen.',
      'Selecciona la opción correcta para completarla.',
    ],
    createdAt: '2025-01-02T10:00:00Z',
    updatedAt: '2025-01-02T10:00:00Z',
    engine: 'logic-seq',
  },
  {
    _id: 'ex_attention_sel',
    slug: 'atencion-selectiva',
    title: 'Atención selectiva',
    description: 'Encuentra el elemento objetivo entre múltiples distractores.',
    category: 'atencion',
    difficulty: 'medium',
    duration: 4,
    instructions: [
      'Observa el conjunto de elementos en pantalla.',
      'Identifica el elemento objetivo indicado al inicio.',
      'Haz clic sobre todos los elementos que coincidan.',
    ],
    createdAt: '2025-01-03T10:00:00Z',
    updatedAt: '2025-01-03T10:00:00Z',
    engine: 'attention-selective',
  },
  {
    _id: 'ex_calc_fast',
    slug: 'calculo-rapido',
    title: 'Cálculo rápido',
    description: 'Resuelve operaciones matemáticas lo más rápido posible.',
    category: 'calculo',
    difficulty: 'hard',
    duration: 6,
    instructions: [
      'Lee la operación matemática en pantalla.',
      'Escribe el resultado en el cuadro de respuesta.',
      'Resuelve tantas operaciones como puedas en el tiempo asignado.',
    ],
    createdAt: '2025-01-04T10:00:00Z',
    updatedAt: '2025-01-04T10:00:00Z',
    engine: 'mental-math',
  },
  {
    _id: 'ex_speed_react',
    slug: 'velocidad-de-reaccion',
    title: 'Velocidad de reacción',
    description: 'Haz clic lo más rápido posible cuando aparezca la señal.',
    category: 'velocidad',
    difficulty: 'easy',
    duration: 3,
    instructions: [
      'Mantente atento a la pantalla.',
      'Haz clic tan pronto como aparezca la señal visual o sonora.',
      'Evita hacer clic antes de tiempo.',
    ],
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z',
    engine: 'reaction-speed',
  },
  {
    _id: 'ex_flex_cog',
    slug: 'flexibilidad-cognitiva',
    title: 'Flexibilidad cognitiva',
    description: 'Cambia entre diferentes reglas de clasificación lo más rápido posible.',
    category: 'flexibilidad',
    difficulty: 'medium',
    duration: 5,
    instructions: [
      'Observa la regla actual para clasificar los elementos.',
      'Cuando cambie la regla, adapta tu respuesta rápidamente.',
      'Clasifica tantos elementos como puedas en el tiempo disponible.',
    ],
    createdAt: '2025-01-06T10:00:00Z',
    updatedAt: '2025-01-06T10:00:00Z',
    engine: 'cognitive-flex',
  },
];

function normalizeExercise(e: Exercise): Exercise {
  const now = new Date().toISOString();
  return {
    ...e,
    instructions: e.instructions ?? [],
    duration: e.duration ?? 5,
    createdAt: e.createdAt ?? now,
    updatedAt: e.updatedAt ?? e.createdAt ?? now,
  };
}

async function fetchExercisesMock(filters: ExFilters): Promise<PaginatedExercises> {
  const list = MOCK_EXERCISES.map(normalizeExercise);
  const { category, difficulty, q, page = 1, limit = 10 } = filters;

  const filtered = list.filter(
    (e) =>
      (!category || e.category === category) &&
      (!difficulty || e.difficulty === difficulty) &&
      (!q || e.title.toLowerCase().includes(q.toLowerCase()))
  );

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: filtered.length,
    page,
    limit,
  };
}


// ===============================
//  RUTAS (prioriza /cognitive/*)
// ===============================
const EX_LIST_PATHS = ['/cognitive/exercises', '/exercises'];
const EX_ITEM_PATHS = (idOrSlug: string) => [
  `/cognitive/exercises/${idOrSlug}`,
  `/exercises/${idOrSlug}`,
];

// ===============================
//  HELPERS para probar rutas
// ===============================
function buildQuery(filters: Record<string, unknown>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  }
  return p.size ? `?${p.toString()}` : '';
}

// Type guard: ¿el error tiene un status numérico?
function hasStatus(e: unknown): e is { status?: number; response?: { status?: number } } {
  if (typeof e !== 'object' || e === null) return false;
  const anyE = e as Record<string, unknown>;
  const direct = typeof anyE.status === 'number';
  const nested =
    typeof anyE.response === 'object' &&
    anyE.response !== null &&
    typeof (anyE.response as Record<string, unknown>).status === 'number';
  return direct || nested;
}

function getStatus(e: unknown): number | undefined {
  if (!hasStatus(e)) return undefined;
  const anyE = e as unknown as { status?: number; response?: { status?: number } };
  return typeof anyE.status === 'number'
    ? anyE.status
    : typeof anyE.response?.status === 'number'
    ? anyE.response.status
    : undefined;
}

export async function tryGetJSON<T>(paths: string | readonly string[]): Promise<T> {
  const list = Array.isArray(paths) ? paths : [paths];
  let lastErr: unknown;

  for (const p of list) {
    try {
      // return await para mejores stacktraces
      return await getJSON<T>(p);
    } catch (e) {
      lastErr = e;
      const status = getStatus(e);
      if (status === 404) continue; // prueba la siguiente ruta
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr ?? 'All candidate JSON paths failed'));
}

export async function tryGet<T>(paths: string | readonly string[]): Promise<T> {
  const list = Array.isArray(paths) ? paths : [paths];
  let lastErr: unknown;

  for (const p of list) {
    try {
      return await get<T>(p);
    } catch (e) {
      lastErr = e;
      const status = getStatus(e);
      if (status === 404) continue;
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr ?? 'All candidate GET paths failed'));
}

// ===============================
//        EJERCICIOS (API)
// ===============================

// Devuelve un array o un objeto de paginación
export async function fetchExercises(
  filters: ExFilters = {}
): Promise<Exercise[] | PaginatedExercises> {
  if (ACTUAL_USE_MOCK) {
    // En mock, siempre devolvemos el tipo paginado para ser consistentes
    return fetchExercisesMock(filters);
  }

  const qs = buildQuery(filters);
  const candidates = EX_LIST_PATHS.map((p) => `${p}${qs}`);

  try {
    const res = await tryGetJSON<Exercise[] | Partial<PaginatedExercises>>(candidates);
    if (Array.isArray(res)) {
      return res.map(normalizeExercise);
    }
    const items = Array.isArray(res.items) ? res.items : [];
    return {
      items: items.map(normalizeExercise),
      total: Number(res.total ?? items.length),
      page: Number(res.page ?? 1),
      limit: Number(res.limit ?? items.length),
    };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[fetchExercises] backend falló, usando mock:', err);
    }
    return fetchExercisesMock(filters);
  }

}

// ✅ Acepta id **o** slug
export async function fetchExercise(idOrSlug: string): Promise<Exercise> {
  if (ACTUAL_USE_MOCK) {
    const found = MOCK_EXERCISES.find((e) => e._id === idOrSlug || e.slug === idOrSlug);
    if (!found) throw new Error(`Exercise ${idOrSlug} not found (mock)`);
    return normalizeExercise(found);
  }

  try {
    const e = await tryGetJSON<Exercise>(EX_ITEM_PATHS(idOrSlug));
    return normalizeExercise(e);
  } catch (err) {
    const fb = MOCK_EXERCISES.find((e) => e._id === idOrSlug || e.slug === idOrSlug);
    if (fb) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[fetchExercise] backend falló, usando mock:', err);
      }
      return normalizeExercise(fb);
    }
    throw err;
  }
}

export async function fetchRecentExercises(limit = 3): Promise<Exercise[]> {
  const res = await fetchExercises({ limit });
  const items = Array.isArray(res) ? res : res.items;
  if (items?.length) return items.map(normalizeExercise);

  // fallback local
  const all = await fetchExercises();
  const list = Array.isArray(all) ? all : all.items;
  return list
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit);
}

export async function fetchExerciseCategories(): Promise<string[]> {
  const res = await fetchExercises();
  const items = Array.isArray(res) ? res : res.items;
  return Array.from(new Set(items.map((e) => e.category)));
}

// ===============================
//        SESIONES (API)
// ===============================
export async function startExerciseSession(exerciseId: string): Promise<{ _id: string }> {
  if (ACTUAL_USE_MOCK) {
    return { _id: `sess_${Math.random().toString(36).slice(2, 11)}` };
  }
  const candidates = [
    { path: '/cognitive/sessions', body: { exerciseId } },
    { path: '/sessions', body: { exerciseId } },
  ] as const;

  let lastErr: unknown;
  for (const c of candidates) {
    try {
      const created = await postJSON<{ _id?: string } & Record<string, unknown>>(c.path, c.body);
      const id = created?._id;
      if (typeof id === 'string' && id) return { _id: id };
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

export async function completeExercise(
  sessionId: string,
  data: { score: number; timeSpent: number; metadata: Record<string, unknown> }
): Promise<ExerciseResult> {
  if (ACTUAL_USE_MOCK || sessionId.startsWith('sess_')) {
    return {
      _id: `res_${Math.random().toString(36).slice(2, 11)}`,
      sessionId,
      score: data.score,
      timeSpent: data.timeSpent,
      createdAt: new Date().toISOString(),
      metadata: data.metadata,
    };
  }

  const candidates = [
    `/cognitive/sessions/${sessionId}/complete`,
    `/sessions/${sessionId}/complete`,
  ];

  for (const p of candidates) {
    try {
      return await postJSON<ExerciseResult>(p, data);
    } catch {
      // probar siguiente
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[completeExercise] backend no disponible, resultado mock');
  }
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
  return tryGet<ExerciseSession[]>(['/cognitive/sessions', '/sessions']);
}