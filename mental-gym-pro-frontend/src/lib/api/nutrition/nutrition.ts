// src/lib/api/nutrition/nutrition.ts
import { USE_MOCK } from '../config'
import * as Api from './nutrition.api'
import * as Local from './nutrition.local'
import type {
  FoodItem,
  MealEntry,
  MealType,
  DailyNutrition,
  WeeklyNutritionSummary,
  NutritionTargets,
  FoodFavorite,
} from '@/types'

// ===============================
// Foods
// ===============================
export const listFoods = USE_MOCK
  ? async (q?: string): Promise<FoodItem[]> => {
      const all = Local.getFoodDb()
      if (!q) return all
      const s = q.toLowerCase()
      return all.filter(
        f =>
          f.name.toLowerCase().includes(s) ||
          (f.tags || []).some(t => t.toLowerCase().includes(s)),
      )
    }
  : Api.listFoods

export const getFoodById = USE_MOCK
  ? async (id: string): Promise<FoodItem> => {
      const found = Local.getFoodDb().find(f => f._id === id)
      if (!found) throw new Error('Alimento no encontrado (local)')
      return found
    }
  : Api.getFoodById

export const createFood = USE_MOCK
  ? async (body: Omit<FoodItem, '_id'>): Promise<FoodItem> => {
      return Local.addFoodToDb(body)
    }
  : Api.createFood

export const updateFood = USE_MOCK
  ? async (id: string, patch: Partial<FoodItem>): Promise<FoodItem> => {
      const list = Local.getFoodDb()
      const idx = list.findIndex(f => f._id === id)
      if (idx === -1) throw new Error('Alimento no encontrado (local)')
      const merged: FoodItem = { ...list[idx], ...patch }
      // en mock no persistimos realmente
      return merged
    }
  : Api.updateFood

export const deleteFood = USE_MOCK
  ? async (_id: string): Promise<{ ok: boolean }> => ({ ok: true })
  : Api.deleteFood

// Helpers locales de Food DB (útiles en mock o para demo)
// Los exportamos siempre; si usas backend, simplemente no los llames.
export const seedFoodDbOnce = Local.seedFoodDbOnce
export const getFoodDb = Local.getFoodDb
export const addFoodToDb = Local.addFoodToDb

// Favoritos (solo local)
export const getFavoritesFoods = (): FoodFavorite[] => Local.getFavoritesFoods()
export const toggleFavoriteFood = (name: string): FoodFavorite[] =>
  Local.toggleFavoriteFood(name)

// ===============================
// Meals
// ===============================
export const listMeals = USE_MOCK ? Local.listMeals : Api.listMeals

// ⚠️ Unifica "añadir comida del día":
// - En mock: Local.addMealToday
// - En API: usamos createMeal con { type, foodName, amount }
export const addMealToday = USE_MOCK
  ? Local.addMealToday
  : async (input: { type: MealType; foodName: string; amount: number }): Promise<MealEntry> => {
      if (!input.foodName) throw new Error('foodName requerido')
      if (!input.amount || input.amount <= 0) throw new Error('amount inválido')
      return Api.createMeal({
        type: input.type,
        foodName: input.foodName,
        amount: input.amount,
      })
    }

// Agua: en mock actualizamos LS; en backend no hay endpoint -> usamos fallback local
export const addWaterToday = async (ml: number): Promise<number> => {
  if (USE_MOCK) return Local.addWaterToday(ml)
  // Si algún día tienes endpoint, cámbialo aquí.
  // Por ahora, mantenemos un fallback local para que la UI funcione.
  return Local.addWaterToday(ml)
}

// ===============================
// Summaries (diario/semana)
// ===============================
export const getDailySummary = USE_MOCK
  ? async (day?: string): Promise<DailyNutrition> => {
      const d = Local.getTodayNutrition()
      if (day && day !== d.date) {
        return { date: day, kcal: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0, meals: [] }
      }
      return d
    }
  : Api.getDailySummary

export const getWeekSummary = USE_MOCK
  ? async (): Promise<WeeklyNutritionSummary> => Local.getWeekNutrition()
  : Api.getWeekSummary

// Aliases cómodos usados por tu UI:
export const getTodayNutrition = async (): Promise<DailyNutrition> => {
  if (USE_MOCK) return Local.getTodayNutrition()
  return Api.getDailySummary()
}

// Alias "tipo local" para semana (misma forma de datos que WeeklyNutritionSummary)
export const getWeekNutrition = async (): Promise<WeeklyNutritionSummary> => {
  if (USE_MOCK) return Local.getWeekNutrition()
  return Api.getWeekSummary()
}

// ===============================
// Targets (objetivos)
// ===============================
async function _getNutritionTargetsImpl(): Promise<NutritionTargets> {
  if (USE_MOCK) return Local.getNutritionTargets()
  try {
    return await Api.getMyTargets()
  } catch {
    // fallback local si la API falla
    return Local.getNutritionTargets()
  }
}

async function _setNutritionTargetsImpl(
  patch: Partial<NutritionTargets>,
): Promise<NutritionTargets> {
  if (USE_MOCK) return Local.setNutritionTargets(patch)
  try {
    return await Api.upsertMyTargets(patch)
  } catch {
    return Local.setNutritionTargets(patch)
  }
}

export const getNutritionTargets = _getNutritionTargetsImpl
export const setNutritionTargets = _setNutritionTargetsImpl
export { getNutritionTargets as getMyTargets }
export { setNutritionTargets as upsertMyTargets }
