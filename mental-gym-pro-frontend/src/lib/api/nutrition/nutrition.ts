// src/lib/api/nutrition.ts
import { USE_MOCK } from '../config';
import * as Api from './nutrition.api';
import * as Local from './nutrition.local';

// ---------- Foods ----------
export const listFoods   = USE_MOCK ? async (q?: string) => {
  // en local los foods están en LS (seedFoodDbOnce)
  const all = Local.getFoodDb();
  if (!q) return all;
  const s = q.toLowerCase();
  return all.filter(f =>
    f.name.toLowerCase().includes(s) ||
    (f.tags || []).some(t => t.toLowerCase().includes(s))
  );
} : Api.listFoods;

export const getFoodById = USE_MOCK ? async (id: string) => {
  const found = Local.getFoodDb().find(f => f._id === id);
  if (!found) throw new Error('Alimento no encontrado (local)');
  return found;
} : Api.getFoodById;

export const createFood  = USE_MOCK ? async (body: Omit<ReturnType<typeof Local.getFoodDb>[number], '_id'>) => {
  return Local.addFoodToDb(body as any);
} : Api.createFood;

export const updateFood  = USE_MOCK ? async (_id: string, patch: any) => {
  const list = Local.getFoodDb();
  const idx = list.findIndex(f => f._id === _id);
  if (idx === -1) throw new Error('Alimento no encontrado (local)');
  const merged = { ...list[idx], ...patch };
  // sobrescribe en LS
  const next = [...list];
  next[idx] = merged;
  // reutilizamos writeJSON vía addFoodToDb... pero mejor directo:
  // (no tenemos writeJSON aquí; para mantener simpleza, no persistimos update en mock)
  return merged;
} : Api.updateFood;

export const deleteFood  = USE_MOCK ? async (_id: string) => {
  // idem: si quieres, añade writeJSON en nutrition.local para soportar delete.
  return { ok: true };
} : Api.deleteFood;

// ---------- Meals ----------
export const listMeals   = USE_MOCK ? async (params?: { day?: string; from?: string; to?: string }) => {
  // En local, la “BD” está agregada por días, no por meals globales.
  const today = Local.getTodayNutrition();
  if (params?.day && params.day === today.date) return today.meals;
  // para simplificar, devolvemos los del día actual en mock
  return today.meals;
} : Api.listMeals;

export const createMeal  = USE_MOCK ? async (body: any) => {
  // Si pasan foodName/type/amount usamos addMealToday
  if (body?.foodName && body?.type && body?.amount != null) {
    return Local.addMealToday({ type: body.type, foodName: body.foodName, amount: body.amount });
  }
  throw new Error('Modo local: usa { type, foodName, amount }');
} : Api.createMeal;

export const updateMeal  = USE_MOCK ? async (_id: string, _patch: any) => {
  // Simplificado en mock: no mantenemos edición persistente
  throw new Error('No implementado en mock');
} : Api.updateMeal;

export const deleteMeal  = USE_MOCK ? async (_id: string) => {
  // Simplificado en mock
  return { ok: true };
} : Api.deleteMeal;

// ---------- Summaries ----------
export const getDailySummary = USE_MOCK ? async (day?: string) => {
  const d = Local.getTodayNutrition();
  if (day && day !== d.date) {
    // construir shape vacío para otros días
    return { date: day, kcal: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0, meals: [] };
  }
  return d;
} : Api.getDailySummary;

export const getWeekSummary = USE_MOCK ? async () => Local.getWeekNutrition() : Api.getWeekSummary;

// ---------- Targets ----------
export const getMyTargets    = USE_MOCK ? Local.getNutritionTargets : Api.getMyTargets;
export const upsertMyTargets = USE_MOCK ? Local.setNutritionTargets : Api.upsertMyTargets;

// ---------- Helpers locales opcionales ----------
export { seedFoodDbOnce, getFoodDb, addFoodToDb, getFavoritesFoods, toggleFavoriteFood } from './nutrition.local';
