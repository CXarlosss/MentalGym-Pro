  // src/lib/api/fitness.ts
  import { USE_MOCK } from '../config';
  import * as Api from './fitness.api';
  import * as Local from './fitness.local';
// DEBUG: Verificar el valor de USE_MOCK
console.log('🔄 USE_MOCK en fitness.ts:', USE_MOCK);
console.log('🔄 getWeeklyActivity será:', USE_MOCK ? 'Local (mock)' : 'API');
// Fuerza USE_MOCK a true temporalmente
const FORCE_MOCK = true;
  // ---------- GYM ----------
  export const addGymSetToday      = USE_MOCK ? Local.addGymSetToday      : Api.addGymSetToday;
  export const getGymWorkouts      = USE_MOCK ? Local.getGymWorkouts      : Api.getGymWorkouts;
  export const getGymWeeklySummary = USE_MOCK ? Local.getGymWeeklySummary : Api.getGymWeeklySummary;
  export const getGroupVolumeThisWeek = USE_MOCK ? Local.getGroupVolumeThisWeek : Api.getGroupVolumeThisWeek;

  // ---------- ACTIVITY (pasos) ----------
  export const getActivities       = USE_MOCK ? Local.getActivities       : Api.getActivities;
  export const upsertTodayActivity = USE_MOCK ? Local.upsertTodayActivity : Api.upsertTodayActivity;
  export const getWeeklyActivity   = FORCE_MOCK ? Local.getWeeklyActivity   : Api.getWeeklyActivity;

  // ---------- CARDIO ----------
  export const addCardioToday = USE_MOCK ? Local.addCardioToday : Api.addCardioToday;
  export const getCardioWeek  = USE_MOCK ? Local.getCardioWeek  : Api.getCardioWeek;

  // ---------- Solo-local (LS) ----------
  export {
    getRoutines,
    saveRoutine,
    duplicateRoutine,
    seedDefaultRoutinesOnce,
    toggleFavoriteExercise,
    getFavoriteExercises,
    getGoals,
    setGoals,
    getBadges,
    unlockBadge,
    // helpers de fuerza
    epley1RM,
    brzycki1RM,
    targetFromPercent1RM,
  } from './fitness.local';
