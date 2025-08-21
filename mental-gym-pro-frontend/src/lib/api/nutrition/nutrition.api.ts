// src/lib/api/nutrition.api.ts
import type {
  FoodItem,
  MealEntry,
  DailyNutrition,
  WeeklyNutritionSummary,
  NutritionTargets,
} from '@/types';
import { API } from '../config';

/** Une la base (puede ser '') con un path asegurando los slashes */
function joinURL(base: string, path: string): string {
  if (!base) return path; // same-origin en dev
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/** Construye querystring a partir de un objeto plano */
function qs(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

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
async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...init });
  if (!res.ok) {
    // Mejor mensaje de error
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.message) msg += ` — ${data.message}`;
      else if (data?.error) msg += ` — ${data.error}`;
    } catch {}
    throw new Error(msg);
  }
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ===============================
//            FOODS
// ===============================

/** GET /api/nutrition/foods?q=... */
export async function listFoods(q?: string): Promise<FoodItem[]> {
  const url = joinURL(API, '/api/nutrition/foods') + qs({ q });
  return http<FoodItem[]>(url, { headers: withAuth() });
}

/** GET /api/nutrition/foods/:id */
export async function getFoodById(id: string): Promise<FoodItem> {
  const url = joinURL(API, `/api/nutrition/foods/${encodeURIComponent(id)}`);
  return http<FoodItem>(url, { headers: withAuth() });
}

/** POST /api/nutrition/foods (admin/editor) */
export async function createFood(
  body: Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>
) {
  const url = joinURL(API, '/api/nutrition/foods');
  return http<FoodItem>(url, {
    method: 'POST',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
}

/** PATCH /api/nutrition/foods/:id (admin/editor) */
export async function updateFood(id: string, patch: Partial<FoodItem>) {
  const url = joinURL(API, `/api/nutrition/foods/${encodeURIComponent(id)}`);
  return http<FoodItem>(url, {
    method: 'PATCH',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(patch),
  });
}

/** DELETE /api/nutrition/foods/:id (admin/editor) */
export async function deleteFood(id: string) {
  const url = joinURL(API, `/api/nutrition/foods/${encodeURIComponent(id)}`);
  return http<{ ok: boolean }>(url, {
    method: 'DELETE',
    headers: withAuth(),
  });
}

// ===============================
//            MEALS
// ===============================

/** GET /api/nutrition/meals?day=YYYY-MM-DD | from=&to= */
export async function listMeals(params?: {
  day?: string;
  from?: string;
  to?: string;
}): Promise<MealEntry[]> {
  const url = joinURL(API, '/api/nutrition/meals') + qs({
    day: params?.day,
    from: params?.from,
    to: params?.to,
  });
  return http<MealEntry[]>(url, { headers: withAuth() });
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
  const url = joinURL(API, '/api/nutrition/meals');
  return http<MealEntry>(url, {
    method: 'POST',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
}

/** PATCH /api/nutrition/meals/:id */
export async function updateMeal(
  id: string,
  patch: Partial<MealEntry> & { foodId?: string; amount?: number }
) {
  const url = joinURL(API, `/api/nutrition/meals/${encodeURIComponent(id)}`);
  return http<MealEntry>(url, {
    method: 'PATCH',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(patch),
  });
}

/** DELETE /api/nutrition/meals/:id */
export async function deleteMeal(id: string) {
  const url = joinURL(API, `/api/nutrition/meals/${encodeURIComponent(id)}`);
  return http<{ ok: true }>(url, {
    method: 'DELETE',
    headers: withAuth(),
  });
}

// ===============================
//          SUMMARIES
// ===============================

/**
 * GET /api/nutrition/meals/summary/daily?day=YYYY-MM-DD
 * (en tu backend, los summaries viven bajo /meals/summary/*)
 */
export async function getDailySummary(day?: string): Promise<DailyNutrition> {
  const url = joinURL(API, '/api/nutrition/meals/summary/daily') + qs({ day });
  return http<DailyNutrition>(url, { headers: withAuth() });
}

/** GET /api/nutrition/meals/summary/week?end=YYYY-MM-DD */
export async function getWeekSummary(end?: string): Promise<WeeklyNutritionSummary> {
  const url = joinURL(API, '/api/nutrition/meals/summary/week') + qs({ end });
  return http<WeeklyNutritionSummary>(url, { headers: withAuth() });
}

// ===============================
//          TARGETS
// ===============================

/**
 * GET /api/nutrition/targets/me
 * (tu router define /me, no la raíz)
 */
export async function getMyTargets(): Promise<NutritionTargets> {
  const url = joinURL(API, '/api/nutrition/targets/me');
  return http<NutritionTargets>(url, { headers: withAuth() });
}

/** PUT /api/nutrition/targets/me (upsert) */
export async function upsertMyTargets(
  patch: Partial<NutritionTargets>
): Promise<NutritionTargets> {
  const url = joinURL(API, '/api/nutrition/targets/me');
  return http<NutritionTargets>(url, {
    method: 'PUT',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(patch),
  });
}
