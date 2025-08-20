// src/lib/api/index.ts
import { USE_MOCK } from './config';

// Resto de módulos "puros" (no necesitan fallback especial)
export * from './config';
export * from './cognitive/exercises';
export * from './progress/progress';
import * as UserApi from './user.api';   
export * from './gamification/gamification'; 

// ====== FITNESS: API con fallback a LOCAL ======
import * as FitLocal from './fitness.local';
import * as FitApi from './fitness.api';

// GYM
export const addGymSetToday = async (set: Parameters<typeof FitApi.addGymSetToday>[0]) =>
  USE_MOCK
    ? FitLocal.addGymSetToday(set)
    : await FitApi.addGymSetToday(set).catch(() => FitLocal.addGymSetToday(set));

export const getGymWorkouts = async () =>
  USE_MOCK ? FitLocal.getGymWorkouts() : await FitApi.getGymWorkouts().catch(FitLocal.getGymWorkouts);

export const getGymWeeklySummary = async () =>
  USE_MOCK ? FitLocal.getGymWeeklySummary() : await FitApi.getGymWeeklySummary().catch(FitLocal.getGymWeeklySummary);

export const getGroupVolumeThisWeek = async () =>
  USE_MOCK ? FitLocal.getGroupVolumeThisWeek() : await FitApi.getGroupVolumeThisWeek().catch(FitLocal.getGroupVolumeThisWeek);

// Activity (pasos)
export const getActivities = async () =>
  USE_MOCK ? FitLocal.getActivities() : await FitApi.getActivities().catch(FitLocal.getActivities);

export const upsertTodayActivity = async (input: Parameters<typeof FitApi.upsertTodayActivity>[0]) =>
  USE_MOCK
    ? FitLocal.upsertTodayActivity(input)
    : await FitApi.upsertTodayActivity(input).catch(() => FitLocal.upsertTodayActivity(input));

export const getWeeklyActivity = async () =>
  USE_MOCK ? FitLocal.getWeeklyActivity() : await FitApi.getWeeklyActivity().catch(FitLocal.getWeeklyActivity);

// Cardio
export const addCardioToday = async (input: Parameters<typeof FitApi.addCardioToday>[0]) =>
  USE_MOCK ? FitLocal.addCardioToday(input) : await FitApi.addCardioToday(input).catch(() => FitLocal.addCardioToday(input));

export const getCardioWeek = async () =>
  USE_MOCK ? FitLocal.getCardioWeek() : await FitApi.getCardioWeek().catch(FitLocal.getCardioWeek);

// Helpers SOLO locales (no hay versión API)
export const epley1RM = FitLocal.epley1RM;
export const brzycki1RM = FitLocal.brzycki1RM;
export const targetFromPercent1RM = FitLocal.targetFromPercent1RM;

export const getRoutines = FitLocal.getRoutines;
export const saveRoutine = FitLocal.saveRoutine;
export const duplicateRoutine = FitLocal.duplicateRoutine;
export const seedDefaultRoutinesOnce = FitLocal.seedDefaultRoutinesOnce;

export const toggleFavoriteExercise = FitLocal.toggleFavoriteExercise;
export const getFavoriteExercises = FitLocal.getFavoriteExercises;

export const getGoals = FitLocal.getGoals;
export const setGoals = FitLocal.setGoals;
export const getBadges = FitLocal.getBadges;
export const unlockBadge = FitLocal.unlockBadge;

// ====== NUTRICIÓN: API con fallback a LOCAL ======
import * as NutLocal from './nutrition.local';
import * as NutApi from './nutrition.api';

// Resúmenes / targets
export const getTodayNutrition = async () =>
  USE_MOCK ? NutLocal.getTodayNutrition() : await NutApi.getTodayNutrition().catch(NutLocal.getTodayNutrition);

export const getWeekNutrition = async () =>
  USE_MOCK ? NutLocal.getWeekNutrition() : await NutApi.getWeekNutrition().catch(NutLocal.getWeekNutrition);

export const getNutritionTargets = async () =>
  USE_MOCK ? NutLocal.getNutritionTargets() : await NutApi.getNutritionTargets().catch(NutLocal.getNutritionTargets);

export const setNutritionTargets = async (t: Parameters<typeof NutApi.setNutritionTargets>[0]) =>
  USE_MOCK ? NutLocal.setNutritionTargets(t) : await NutApi.setNutritionTargets(t).catch(() => NutLocal.setNutritionTargets(t));

// Operaciones locales cómodas (solo si las usas en UI):
export const addWaterToday = NutLocal.addWaterToday;
export const addMealToday = NutLocal.addMealToday;
// Si luego creas endpoints reales para agua/comidas, haremos sus wrappers API también.
