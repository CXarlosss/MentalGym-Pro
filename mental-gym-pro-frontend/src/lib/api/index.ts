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

// ✅ Progreso — apunta al índice NUEVO del folder
export { fetchUserProgress } from './progress/progress';

// Gamificación
export * from './gamification/gamification';

// Fitness
export * from './fitness/fitness';

// Nutrición
export * from './nutrition/nutrition';

// User
export * from './user/user.api';
