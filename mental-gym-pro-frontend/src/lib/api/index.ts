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


export { clearLegacyLocalData, clearUserScopedData } from './localData';

// Progreso
export { fetchUserProgress } from './progress';

// Gamificación
export { fetchActiveChallenges } from './gamification/gamification';

// Fitness
export * from './fitness/fitness';

// Nutrición
export * from './nutrition/nutrition';

// User
export * from './user/user.api';

