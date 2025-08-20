// src/lib/api/nutrition.api.ts
import type {
  FoodItem,
  MealEntry,
  DailyNutrition,
  WeeklyNutritionSummary,
  NutritionTargets,
} from '@/types';
import { API } from '../config';

/** Adjunta Authorization si hay token en LS */
function withAuth(headers?: HeadersInit): HeadersInit {
  const h = new Headers(headers);
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) h.set('Authorization', `Bearer ${token}`);
  }
  return h;
}

/** Helper fetch con manejo estándar */
async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { credentials: 'include', ...init });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ===============================
//            FOODS
// ===============================

/** GET /api/nutrition/foods?q=... */
export async function listFoods(q?: string): Promise<FoodItem[]> {
  const url = new URL(`${API}/api/nutrition/foods`);
  if (q) url.searchParams.set('q', q);
  return http<FoodItem[]>(url.toString(), { headers: withAuth() });
}

/** GET /api/nutrition/foods/:id */
export async function getFoodById(id: string): Promise<FoodItem> {
  return http<FoodItem>(`${API}/api/nutrition/foods/${id}`, {
    headers: withAuth(),
  });
}

/** POST /api/nutrition/foods (admin/editor) */
export async function createFood(body: Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>) {
  return http<FoodItem>(`${API}/api/nutrition/foods`, {
    method: 'POST',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
}

/** PATCH /api/nutrition/foods/:id (admin/editor) */
export async function updateFood(id: string, patch: Partial<FoodItem>) {
  return http<FoodItem>(`${API}/api/nutrition/foods/${id}`, {
    method: 'PATCH',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(patch),
  });
}

/** DELETE /api/nutrition/foods/:id (admin/editor) */
export async function deleteFood(id: string) {
  return http<{ ok: boolean }>(`${API}/api/nutrition/foods/${id}`, {
    method: 'DELETE',
    headers: withAuth(),
  });
}

// ===============================
//            MEALS
// ===============================

/** GET /api/nutrition/meals?day=YYYY-MM-DD | from=&to= */
export async function listMeals(params?: { day?: string; from?: string; to?: string }): Promise<MealEntry[]> {
  const url = new URL(`${API}/api/nutrition/meals`);
  if (params?.day) url.searchParams.set('day', params.day);
  if (params?.from && params?.to) {
    url.searchParams.set('from', params.from);
    url.searchParams.set('to', params.to);
  }
  return http<MealEntry[]>(url.toString(), { headers: withAuth() });
}

/** POST /api/nutrition/meals */
export async function createMeal(body: {
  type: MealEntry['type'];
  foodId?: string;
  foodName?: string;
  amount?: number;
  date?: string; // YYYY-MM-DD
  kcal?: number; protein?: number; carbs?: number; fat?: number; // si es manual
}) {
  return http<MealEntry>(`${API}/api/nutrition/meals`, {
    method: 'POST',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
}

/** PATCH /api/nutrition/meals/:id */
export async function updateMeal(id: string, patch: Partial<MealEntry> & { foodId?: string; amount?: number }) {
  return http<MealEntry>(`${API}/api/nutrition/meals/${id}`, {
    method: 'PATCH',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(patch),
  });
}

/** DELETE /api/nutrition/meals/:id */
export async function deleteMeal(id: string) {
  return http<{ ok: true }>(`${API}/api/nutrition/meals/${id}`, {
    method: 'DELETE',
    headers: withAuth(),
  });
}

// ===============================
//          SUMMARIES
// ===============================

/** GET /api/nutrition/summary/daily?day=YYYY-MM-DD */
export async function getDailySummary(day?: string): Promise<DailyNutrition> {
  const url = new URL(`${API}/api/nutrition/summary/daily`);
  if (day) url.searchParams.set('day', day);
  return http<DailyNutrition>(url.toString(), { headers: withAuth() });
}

/** GET /api/nutrition/summary/week?end=YYYY-MM-DD */
export async function getWeekSummary(end?: string): Promise<WeeklyNutritionSummary> {
  const url = new URL(`${API}/api/nutrition/summary/week`);
  if (end) url.searchParams.set('end', end);
  return http<WeeklyNutritionSummary>(url.toString(), { headers: withAuth() });
}

// ===============================
//          TARGETS
// ===============================

/** GET (mis objetivos) — asumiendo ruta /api/nutrition/targets */
export async function getMyTargets(): Promise<NutritionTargets> {
  return http<NutritionTargets>(`${API}/api/nutrition/targets`, {
    headers: withAuth(),
  });
}

/** PUT/PATCH (upsert) — asumiendo ruta /api/nutrition/targets */
export async function upsertMyTargets(patch: Partial<NutritionTargets>): Promise<NutritionTargets> {
  return http<NutritionTargets>(`${API}/api/nutrition/targets`, {
    method: 'PUT', // tu controller hace upsert, acepta PUT o PATCH según tu router
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(patch),
  });
}
