// src/lib/api/nutrition.local.ts
import type {
  FoodItem, MealEntry, MealType,
  DailyNutrition, NutritionTargets, WeeklyNutritionSummary, FoodFavorite
} from '@/types';
import { LS_KEYS, toLocalYMD, scopedLSKey } from './config';


// ---------------- Utils LocalStorage ----------------
function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(scopedLSKey(key)); // 👈 usa scopedLSKey
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function writeJSON<T>(key: string, val: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(scopedLSKey(key), JSON.stringify(val)); // 👈 usa scopedLSKey
}
// ---------------- Food DB (LS) ----------------
const FOOD_DB_KEY = LS_KEYS.nutrFoodDb;

export function seedFoodDbOnce() {
  const exist = readJSON<FoodItem[]>(FOOD_DB_KEY, []);
  if (exist.length) return;
  const demo: FoodItem[] = [
    { _id: 'f_apple',   name: 'Manzana',        kcal: 52,  protein: 0.3, carbs: 14, fat: 0.2, unit: '100g',  tags: ['fruta'] },
    { _id: 'f_oats',    name: 'Avena',          kcal: 389, protein: 16.9, carbs: 66, fat: 6.9, unit: '100g', tags: ['cereal'] },
    { _id: 'f_egg',     name: 'Huevo',          kcal: 70,  protein: 6,   carbs: 0.6, fat: 5,   unit: 'unidad', tags: ['proteína'] },
    { _id: 'f_chicken', name: 'Pollo pechuga',  kcal: 165, protein: 31,  carbs: 0,   fat: 3.6, unit: '100g', tags: ['proteína'] },
    { _id: 'f_rice',    name: 'Arroz cocido',   kcal: 130, protein: 2.7, carbs: 28,  fat: 0.3, unit: '100g', tags: ['cereal'] },
    { _id: 'f_yogurt',  name: 'Yogur natural',  kcal: 61,  protein: 3.5, carbs: 4.7, fat: 3.3, unit: '100g', tags: ['lácteo'] },
  ];
  writeJSON(FOOD_DB_KEY, demo);
}
export function getFoodDb(): FoodItem[] {
  return readJSON<FoodItem[]>(FOOD_DB_KEY, []);
}
export function addFoodToDb(item: Omit<FoodItem, '_id'>) {
  const list = getFoodDb();
  const withId: FoodItem = { ...item, _id: `f_${Math.random().toString(36).slice(2, 9)}` };
  list.push(withId);
  writeJSON(FOOD_DB_KEY, list);
  return withId;
}

// ---------------- Targets (LS) ----------------
const TARGETS_KEY = LS_KEYS.nutrTargets;

export function getNutritionTargets(): NutritionTargets {
  return readJSON<NutritionTargets>(TARGETS_KEY, {
    kcal: 2200, protein: 140, carbs: 220, fat: 70, waterMl: 2000,
  });
}
// src/lib/api/nutrition.local.ts
export function setNutritionTargets(t: Partial<NutritionTargets>): NutritionTargets {
  const current = getNutritionTargets();
  const merged: NutritionTargets = {
    kcal: t.kcal ?? current.kcal,
    protein: t.protein ?? current.protein,
    carbs: t.carbs ?? current.carbs,
    fat: t.fat ?? current.fat,
    waterMl: t.waterMl ?? current.waterMl,
  };
  writeJSON(TARGETS_KEY, merged);
  return merged;
}

// ---------------- Día & Semana (LS) ----------------
const DAY_KEY = LS_KEYS.nutrDay;

const dayKey = (d = new Date()) => toLocalYMD(d);

function readDay(dateKey = dayKey()): DailyNutrition {
  const map = readJSON<Record<string, DailyNutrition>>(DAY_KEY, {});
  return map[dateKey] || { date: dateKey, kcal: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0, meals: [] };
}
function writeDay(day: DailyNutrition) {
  const map = readJSON<Record<string, DailyNutrition>>(DAY_KEY, {});
  map[day.date] = day;
  writeJSON(DAY_KEY, map);
}

export function getTodayNutrition(): DailyNutrition {
  return readDay();
}

export function getWeekNutrition(): WeeklyNutritionSummary {
  const map = readJSON<Record<string, DailyNutrition>>(DAY_KEY, {});
  const days: WeeklyNutritionSummary['days'] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = toLocalYMD(d);
    const day = map[key] || { date: key, kcal: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0, meals: [] };
    days.push({ date: key, kcal: day.kcal, protein: day.protein, carbs: day.carbs, fat: day.fat, waterMl: day.waterMl });
  }

  const sum = days.reduce((a, b) => ({
    kcal: a.kcal + b.kcal, protein: a.protein + b.protein, carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat, waterMl: a.waterMl + b.waterMl,
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0 });

  return {
    days,
    avg: {
      kcal: Math.round(sum.kcal / 7),
      protein: Math.round(sum.protein / 7),
      carbs: Math.round(sum.carbs / 7),
      fat: Math.round(sum.fat / 7),
      waterMl: Math.round(sum.waterMl / 7),
    },
  };
}

// ---------------- Acciones del día ----------------
export function addWaterToday(ml: number) {
  const d = readDay();
  d.waterMl = Math.max(0, d.waterMl + ml);
  writeDay(d);
  return d.waterMl;
}

export function addMealToday(input: { type: MealType; foodName: string; amount: number }) {
  const db = getFoodDb();
  const food = db.find((f) => f.name.toLowerCase() === input.foodName.toLowerCase());
  if (!food) throw new Error('Alimento no encontrado en DB');

  // 'unidad' => amount = unidades; otras => amount = gramos/ml base 100
  const factor = food.unit === 'unidad' ? input.amount : input.amount / 100;

  const kcal = Math.round(food.kcal * factor);
  const protein = +(food.protein * factor).toFixed(1);
  const carbs = +(food.carbs * factor).toFixed(1);
  const fat = +(food.fat * factor).toFixed(1);

  const now = new Date().toISOString();
  const entry: MealEntry = {
    _id: `m_${Math.random().toString(36).slice(2, 9)}`,
    date: dayKey(),
    type: input.type,
    foodName: food.name,
    amount: input.amount,
    kcal, protein, carbs, fat,
    createdAt: now,
  };

  const d = readDay();
  d.meals.push(entry);
  d.kcal += kcal; d.protein += protein; d.carbs += carbs; d.fat += fat;
  writeDay(d);
  return entry;
}

// ---------------- Favoritos de comida ----------------
const FAVS_KEY = LS_KEYS.nutrFavs;

export function getFavoritesFoods(): FoodFavorite[] {
  return readJSON<FoodFavorite[]>(FAVS_KEY, []);
}
export function toggleFavoriteFood(name: string) {
  const favs = getFavoritesFoods();
  const i = favs.indexOf(name);
  if (i >= 0) favs.splice(i, 1);
  else favs.push(name);
  writeJSON(FAVS_KEY, favs);
  return favs;
}
