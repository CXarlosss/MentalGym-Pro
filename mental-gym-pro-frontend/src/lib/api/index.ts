// src/lib/api/index.ts

// Base
export * from './config';

// ----- Cognitive (NO duplicar sesiones) -----
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

// ----- Progreso -----
export { fetchUserProgress } from './progress/progress';

// ----- Gamificación -----
export * from './gamification/gamification';

// ----- Fitness -----
export * from './fitness/fitness'; // aquí deben estar getWeeklyActivity, etc.

// ----- Nutrición -----
export * from './nutrition/nutrition';

// ----- User -----
export * from './user/user.api'
