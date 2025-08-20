// src/lib/api/nutrition.ts (o src/lib/api/nutrition/nutrition.ts)
import { USE_MOCK } from '../config';
import * as Api from './nutrition.api';
import * as Local from './nutrition.local';
import type {
  FoodItem,
  MealEntry,
  MealType,
  DailyNutrition,
  WeeklyNutritionSummary,
  NutritionTargets,
} from '@/types';

// ---------- Foods ----------
export const listFoods = USE_MOCK
  ? async (q?: string): Promise<FoodItem[]> => {
      const all = Local.getFoodDb();
      if (!q) return all;
      const s = q.toLowerCase();
      return all.filter(
        (f) =>
          f.name.toLowerCase().includes(s) ||
          (f.tags || []).some((t) => t.toLowerCase().includes(s)),
      );
    }
  : Api.listFoods;

export const getFoodById = USE_MOCK
  ? async (id: string): Promise<FoodItem> => {
      const found = Local.getFoodDb().find((f) => f._id === id);
      if (!found) throw new Error('Alimento no encontrado (local)');
      return found;
    }
  : Api.getFoodById;

export const createFood = USE_MOCK
  ? async (body: Omit<FoodItem, '_id'>): Promise<FoodItem> => {
      return Local.addFoodToDb(body);
    }
  : Api.createFood;

export const updateFood = USE_MOCK
  ? async (id: string, patch: Partial<FoodItem>): Promise<FoodItem> => {
      const list = Local.getFoodDb();
      const idx = list.findIndex((f) => f._id === id);
      if (idx === -1) throw new Error('Alimento no encontrado (local)');
      const merged: FoodItem = { ...list[idx], ...patch };
      // Nota: en mock no persistimos el update (solo devolvemos el merge)
      return merged;
    }
  : Api.updateFood;

export const deleteFood = USE_MOCK
  ? async (id: string): Promise<{ ok: boolean }> => {
      // En mock no borramos de LS; marcamos el arg como usado:
      void id;
      return { ok: true };
    }
  : Api.deleteFood;

// ---------- Meals ----------
export const listMeals = USE_MOCK
  ? async (params?: {
      day?: string;
      from?: string;
      to?: string;
    }): Promise<MealEntry[]> => {
      const today = Local.getTodayNutrition();
      if (params?.day && params.day === today.date) return today.meals;
      return today.meals; // simplificado en mock
    }
  : Api.listMeals;

export const createMeal = USE_MOCK
  ? async (body: {
      type: MealType;
      foodName: string;
      amount: number;
    }): Promise<MealEntry> => {
      return Local.addMealToday({
        type: body.type,
        foodName: body.foodName,
        amount: body.amount,
      });
    }
  : Api.createMeal;

export const updateMeal = USE_MOCK
  ? async (
      id: string,
      patch: Partial<MealEntry> & { foodId?: string; amount?: number },
    ): Promise<MealEntry> => {
      // No implementado en mock; marcamos args como usados para ESLint:
      void id;
      void patch;
      throw new Error('No implementado en mock');
    }
  : Api.updateMeal;

export const deleteMeal = USE_MOCK
  ? async (id: string): Promise<{ ok: boolean }> => {
      void id;
      return { ok: true };
    }
  : Api.deleteMeal;

// ---------- Summaries ----------
export const getDailySummary = USE_MOCK
  ? async (day?: string): Promise<DailyNutrition> => {
      const d = Local.getTodayNutrition();
      if (day && day !== d.date) {
        return {
          date: day,
          kcal: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          waterMl: 0,
          meals: [],
        };
      }
      return d;
    }
  : Api.getDailySummary;

export const getWeekSummary = USE_MOCK
  ? async (): Promise<WeeklyNutritionSummary> => Local.getWeekNutrition()
  : Api.getWeekSummary;

// ---------- Targets ----------
// ---------- Targets ----------
export const getMyTargets = USE_MOCK
  ? async (): Promise<NutritionTargets> => Local.getNutritionTargets()
  : Api.getMyTargets;

export const upsertMyTargets = USE_MOCK
  ? async (patch: Partial<NutritionTargets>): Promise<NutritionTargets> =>
      Local.setNutritionTargets(patch)
  : Api.upsertMyTargets;

// ---------- Helpers locales opcionales ----------
export {
  seedFoodDbOnce,
  getFoodDb,
  addFoodToDb,
  getFavoritesFoods,
  toggleFavoriteFood,
} from './nutrition.local';
