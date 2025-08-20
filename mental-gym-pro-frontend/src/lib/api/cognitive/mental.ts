// src/lib/api/cognitive/mental.ts
import { USE_MOCK, getJSON, postJSON, patchJSON, del, get } from "../config";

// ===============================
//         Tipos
// ===============================
export type MentalDifficulty = "easy" | "medium" | "hard";
export type MentalType =
  | "logic"
  | "memory"
  | "math"
  | "verbal"
  | "visual"
  | string;

export type MentalChallenge = {
  _id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  difficulty: MentalDifficulty;
  type: MentalType;
  isActive: boolean;
  author?: string;
  createdAt: string;
  updatedAt: string;
};

export type MentalListResponse =
  | MentalChallenge[]
  | {
      items: MentalChallenge[];
      total: number;
      page: number;
      pages: number;
    };

export type MentalAttempt = {
  _id: string;
  challengeId: string;
  score: number;
  timeSpent: number;
  createdAt: string;
  metadata: Record<string, unknown>;
};

// ===============================
//       MOCKS + NORMALIZADOR
// ===============================
const MOCK_CHALLENGES: MentalChallenge[] = [
  {
    _id: "ment_1",
    question: "¿Cuál es el siguiente número en la secuencia? 2, 4, 8, 16, ?",
    options: ["18", "24", "32", "64"],
    answer: "32",
    explanation: "Se duplica cada vez: 2×2=4, 4×2=8, 8×2=16, 16×2=32.",
    difficulty: "easy",
    type: "math",
    isActive: true,
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
  },
  {
    _id: "ment_2",
    question:
      "Un granjero tiene 17 ovejas y todas menos 8 mueren. ¿Cuántas quedan?",
    options: ["8", "9", "17", "0"],
    answer: "8",
    explanation: "“Todas menos 8” implica que 8 sobreviven.",
    difficulty: "easy",
    type: "logic",
    isActive: true,
    createdAt: "2025-01-02T10:00:00Z",
    updatedAt: "2025-01-02T10:00:00Z",
  },
  {
    _id: "ment_3",
    question: "Completa el refrán: “A quien madruga…”.",
    options: [
      "Dios le ayuda",
      "Se le cae la pestaña",
      "No se le pega nada",
      "Todo le va mal",
    ],
    answer: "Dios le ayuda",
    difficulty: "medium",
    type: "verbal",
    isActive: true,
    createdAt: "2025-01-03T10:00:00Z",
    updatedAt: "2025-01-03T10:00:00Z",
  },
];

const normalizeChallenge = (c: MentalChallenge): MentalChallenge => {
  const now = new Date().toISOString();
  return {
    ...c,
    options: Array.isArray(c.options) ? c.options : [],
    isActive: typeof c.isActive === "boolean" ? c.isActive : true,
    createdAt: c.createdAt ?? now,
    updatedAt: c.updatedAt ?? c.createdAt ?? now,
  };
};

const BASE_PATHS = ["/api/mental", "/api/cognitive/mental"];
const LIST_PATHS = BASE_PATHS;
const ITEM_PATHS = (id: string) => BASE_PATHS.map((p) => `${p}/${id}`);
const RANDOM_PATHS = BASE_PATHS.map((p) => `${p}/random`);

// ===============================
//           LISTADO
// ===============================
export type MentalFilters = {
  page?: number;
  limit?: number;
  difficulty?: MentalDifficulty;
  type?: MentalType;
  q?: string;
  active?: boolean;
};

export async function fetchMentalChallenges(
  filters: MentalFilters = {}
): Promise<MentalListResponse> {
  if (USE_MOCK) {
    const list = MOCK_CHALLENGES.map(normalizeChallenge);
    if (!Object.keys(filters).length) return list;

    const { difficulty, type, q, active } = filters;
    const filtered = list.filter(
      (c) =>
        (difficulty ? c.difficulty === difficulty : true) &&
        (type ? c.type === type : true) &&
        (typeof active === "boolean" ? c.isActive === active : true) &&
        (q ? c.question.toLowerCase().includes(q.toLowerCase()) : true)
    );
    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? (filtered.length || 20));
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);
    return {
      items,
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / limit || 1),
    };
  }

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null) {
      params.set(k, typeof v === "boolean" ? String(v) : String(v));
    }
  }
  const paths = LIST_PATHS.map((p) => (params.size ? `${p}?${params}` : p));

  const res = await getJSON<MentalListResponse>(paths);
  if (Array.isArray(res)) {
    const items = res.map(normalizeChallenge);
    return items;
  }
  return {
    ...res,
    items: (res.items ?? []).map(normalizeChallenge),
    total: Number(res.total ?? res.items?.length ?? 0),
    page: Number(res.page ?? 1),
    pages: Number(res.pages ?? 1),
  };
}

// ===============================
//           RANDOM
// ===============================
export async function fetchRandomMentalChallenge(
  filters: Pick<MentalFilters, "difficulty" | "type"> = {}
): Promise<MentalChallenge> {
  if (USE_MOCK) {
    const { difficulty, type } = filters;
    const pool = MOCK_CHALLENGES.filter(
      (c) =>
        (difficulty ? c.difficulty === difficulty : true) &&
        (type ? c.type === type : true) &&
        c.isActive
    );
    if (!pool.length) throw new Error("No hay retos con esos filtros (mock)");
    const idx = Math.floor(Math.random() * pool.length);
    return normalizeChallenge(pool[idx]);
  }

  const params = new URLSearchParams();
  if (filters.difficulty) params.set("difficulty", String(filters.difficulty));
  if (filters.type) params.set("type", String(filters.type));

  const paths = RANDOM_PATHS.map((p) => (params.size ? `${p}?${params}` : p));
  const doc = await getJSON<MentalChallenge>(paths);
  return normalizeChallenge(doc);
}

// ===============================
//           DETALLE
// ===============================
export async function fetchMentalChallenge(
  id: string
): Promise<MentalChallenge> {
  if (USE_MOCK) {
    const found = MOCK_CHALLENGES.find((c) => c._id === id);
    if (!found) throw new Error(`Reto ${id} no encontrado (mock)`);
    return normalizeChallenge(found);
  }
  const doc = await getJSON<MentalChallenge>(ITEM_PATHS(id));
  return normalizeChallenge(doc);
}

// ===============================
//             CREATE
// ===============================
export type CreateMentalPayload = Partial<MentalChallenge> & {
  question: string;
  options: string[];
  answer: string;
};

export async function createMentalChallenge(
  payload: CreateMentalPayload
): Promise<MentalChallenge> {
  if (USE_MOCK) {
    const now = new Date().toISOString();
    const created: MentalChallenge = normalizeChallenge({
      _id: `ment_${Math.random().toString(36).slice(2, 10)}`,
      difficulty: (payload.difficulty as MentalDifficulty) ?? "easy",
      type: (payload.type as MentalType) ?? "logic",
      isActive: payload.isActive ?? true,
      question: payload.question,
      options: payload.options,
      answer: payload.answer,
      explanation: payload.explanation,
      createdAt: now,
      updatedAt: now,
      author: "mock_user",
    } as MentalChallenge);
    MOCK_CHALLENGES.unshift(created);
    return created;
  }

  for (const base of BASE_PATHS) {
    try {
      const created = await postJSON<MentalChallenge>(base, payload);
      return normalizeChallenge(created);
    } catch {}
  }
  throw new Error("No se pudo crear el reto mental");
}

// ===============================
//             UPDATE
// ===============================
export type UpdateMentalPayload = Partial<
  Omit<MentalChallenge, "_id" | "createdAt" | "updatedAt">
>;

export async function updateMentalChallenge(
  id: string,
  patch: UpdateMentalPayload
): Promise<MentalChallenge> {
  if (USE_MOCK) {
    const idx = MOCK_CHALLENGES.findIndex((c) => c._id === id);
    if (idx === -1) throw new Error(`Reto ${id} no encontrado (mock)`);
    const merged = normalizeChallenge({
      ...MOCK_CHALLENGES[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    });
    MOCK_CHALLENGES[idx] = merged;
    return merged;
  }

  for (const path of ITEM_PATHS(id)) {
    try {
      const updated = await patchJSON<MentalChallenge>(path, patch);
      return normalizeChallenge(updated);
    } catch {}
  }
  throw new Error("No se pudo actualizar el reto mental");
}

// ===============================
//             DELETE
// ===============================
export async function deleteMentalChallenge(
  id: string
): Promise<{ ok: boolean }> {
  if (USE_MOCK) {
    const idx = MOCK_CHALLENGES.findIndex((c) => c._id === id);
    if (idx === -1) return { ok: false };
    MOCK_CHALLENGES.splice(idx, 1);
    return { ok: true };
  }

  for (const path of ITEM_PATHS(id)) {
    try {
      await del(path);
      return { ok: true };
    } catch {}
  }
  return { ok: false };
}

// ===============================
//     Mis sesiones (opcional)
// ===============================
export async function fetchMyMentalAttempts() {
  return get<MentalAttempt[]>("/api/mental-attempts");
}
