// Base
export * from './config';

// Cognitive
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

// Progreso: solo lo necesario (explícito para evitar colisiones)
export { fetchUserProgress } from './progress';

// Gamificación: aquí vive fetchActiveChallenges
export { fetchActiveChallenges } from './gamification/gamification';

// Fitness
export * from './fitness/fitness';

// Nutrición
export * from './nutrition/nutrition';

// User
export * from './user/user.api';
