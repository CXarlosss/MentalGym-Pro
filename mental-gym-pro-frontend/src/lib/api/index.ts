// src/lib/api/index.ts
export * from './config';
export * from './exercises';
export * from './progress';
export * from './fitness.local';
export * from './nutrition.local';


// src/lib/api/index.ts
import { USE_MOCK } from './config';
import * as Local from './fitness.local';
import * as Api from './fitness.api';

// ====== GYM ======
export const addGymSetToday = async (set: Parameters<typeof Api.addGymSetToday>[0]) =>
  USE_MOCK ? Local.addGymSetToday(set) : (await Api.addGymSetToday(set).catch(() => Local.addGymSetToday(set)));

export const getGymWorkouts = async () =>
  USE_MOCK ? Local.getGymWorkouts() : (await Api.getGymWorkouts().catch(() => Local.getGymWorkouts()));

export const getGymWeeklySummary = async () =>
  USE_MOCK ? Local.getGymWeeklySummary() : (await Api.getGymWeeklySummary().catch(() => Local.getGymWeeklySummary()));

export const getGroupVolumeThisWeek = async () =>
  USE_MOCK ? Local.getGroupVolumeThisWeek() : (await Api.getGroupVolumeThisWeek().catch(() => Local.getGroupVolumeThisWeek()));

// ====== ACTIVITY ======
export const getActivities = async () =>
  USE_MOCK ? Local.getActivities() : (await Api.getActivities().catch(() => Local.getActivities()));

export const upsertTodayActivity = async (input: Parameters<typeof Api.upsertTodayActivity>[0]) =>
  USE_MOCK ? Local.upsertTodayActivity(input) : (await Api.upsertTodayActivity(input).catch(() => Local.upsertTodayActivity(input)));

export const getWeeklyActivity = async () =>
  USE_MOCK ? Local.getWeeklyActivity() : (await Api.getWeeklyActivity().catch(() => Local.getWeeklyActivity()));

// ====== CARDIO ======
export const addCardioToday = async (input: Parameters<typeof Api.addCardioToday>[0]) =>
  USE_MOCK ? Local.addCardioToday(input) : (await Api.addCardioToday(input).catch(() => Local.addCardioToday(input)));

export const getCardioWeek = async () =>
  USE_MOCK ? Local.getCardioWeek() : (await Api.getCardioWeek().catch(() => Local.getCardioWeek()));

// ====== utilidades fuerza & LS helpers que solo existen en local ======
export const epley1RM = Local.epley1RM;
export const brzycki1RM = Local.brzycki1RM;
export const targetFromPercent1RM = Local.targetFromPercent1RM;

export const getRoutines = Local.getRoutines;
export const saveRoutine = Local.saveRoutine;
export const duplicateRoutine = Local.duplicateRoutine;
export const seedDefaultRoutinesOnce = Local.seedDefaultRoutinesOnce;

export const toggleFavoriteExercise = Local.toggleFavoriteExercise;
export const getFavoriteExercises = Local.getFavoriteExercises;

export const getGoals = Local.getGoals;
export const setGoals = Local.setGoals;
export const getBadges = Local.getBadges;
export const unlockBadge = Local.unlockBadge;


