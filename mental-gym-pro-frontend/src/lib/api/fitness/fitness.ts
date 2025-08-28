import { USE_MOCK } from '../config';
import * as Api from './fitness.api';
import * as Local from './fitness.local';

// Fuerza MOCK consistentemente
const FORCE_MOCK = true;
const ACTUAL_USE_MOCK = USE_MOCK || FORCE_MOCK;

console.log('🔍 USE_MOCK en fitness.ts:', ACTUAL_USE_MOCK);

// ---------- ACTIVITY (pasos) ----------
export const getActivities = ACTUAL_USE_MOCK ? Local.getActivities : Api.getActivities;
export const upsertTodayActivity = ACTUAL_USE_MOCK ? Local.upsertTodayActivity : Api.upsertTodayActivity;
export const getWeeklyActivity = ACTUAL_USE_MOCK ? Local.getWeeklyActivity : Api.getWeeklyActivity;

// ---------- GYM ----------
export const addGymSetToday = ACTUAL_USE_MOCK ? Local.addGymSetToday : Api.addGymSetToday;
export const getGymWorkouts = ACTUAL_USE_MOCK ? Local.getGymWorkouts : Api.getGymWorkouts;
export const getGymWeeklySummary = ACTUAL_USE_MOCK ? Local.getGymWeeklySummary : Api.getGymWeeklySummary;
export const getGroupVolumeThisWeek = ACTUAL_USE_MOCK ? Local.getGroupVolumeThisWeek : Api.getGroupVolumeThisWeek;

// ---------- CARDIO ----------
export const addCardioToday = ACTUAL_USE_MOCK ? Local.addCardioToday : Api.addCardioToday;
export const getCardioWeek = ACTUAL_USE_MOCK ? Local.getCardioWeek : Api.getCardioWeek;