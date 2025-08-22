// src/lib/api/index.ts

// Base
export * from './config';

// Cognitive …
export {
  fetchExercises,
  fetchExercise,
  fetchRecentExercises,
  fetchExerciseCategories,
} from './cognitive/exercises';
export {
  startExerciseSession,
  completeExercise,
  fetchMySessions,
} from './cognitive/sessionController';

// Local data
export { clearLegacyLocalData, clearUserScopedData } from './localData';

// Progreso
export { fetchUserProgress } from './progress';

// Gamificación
// Reexporta TODO lo de gamification (activos, unirse, progreso, badges, etc.)
export * from './gamification/gamification';

// Fitness
export * from './fitness/fitness';

// Nutrición
export * from './nutrition/nutrition';

// User
export * from './user/user.api';
