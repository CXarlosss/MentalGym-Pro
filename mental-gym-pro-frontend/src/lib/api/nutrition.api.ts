// src/lib/api/nutrition.api.ts
import { get, putJSON, postJSON, patchJSON, delJSON, qs } from './config';
import type {
  DailyNutrition, WeeklyNutritionSummary, NutritionTargets, MealEntry
} from '@/types';

// Resumen diario (usa ?day=YYYY-MM-DD si quieres día concreto)
export const getTodayNutrition = (day?: string) =>
  get<DailyNutrition>(`/api/nutrition/summary/daily${qs({ day })}`);

// Resumen semana (usa ?end=YYYY-MM-DD si quieres cierre específico)
export const getWeekNutrition = (end?: string) =>
  get<WeeklyNutritionSummary>(`/api/nutrition/summary/week${qs({ end })}`);

// Targets (macro/agua)
export const getNutritionTargets = () =>
  get<NutritionTargets>('/api/nutrition/targets/me');

export const setNutritionTargets = (t: Partial<NutritionTargets>) =>
  putJSON<NutritionTargets>('/api/nutrition/targets/me', t);

// CRUD comidas (si los usas en UI)
export const listMeals = (params: { day?: string; from?: string; to?: string } = {}) =>
  get<MealEntry[]>(`/api/nutrition/meals${qs(params)}`);

export const createMeal = (body: {
  type: string; foodId?: string; foodName?: string; amount: number;
  kcal?: number; protein?: number; carbs?: number; fat?: number; date?: string;
}) => postJSON<MealEntry>('/api/nutrition/meals', body);

export const updateMeal = (id: string, body: Partial<MealEntry>) =>
  patchJSON<MealEntry>(`/api/nutrition/meals/${id}`, body);

export const deleteMeal = (id: string) =>
  delJSON<{ ok: true }>(`/api/nutrition/meals/${id}`);
