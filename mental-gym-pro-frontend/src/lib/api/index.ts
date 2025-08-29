// src/lib/api/index.ts

// Base
export * from './config';

// Cognitive
export * from './cognitive/exercises';
export * from './cognitive/sessionController';

// Local data
export { clearLegacyLocalData, clearUserScopedData } from './localData';
// Progreso
export { fetchUserProgress, fetchActiveChallenges, fetchMyChallenges } from './progress/progress';
// Gamificación
export * from './gamification/gamification';
// Fitness
export * from './fitness/fitness';
// Nutrición
export * from './nutrition/nutrition';
// User
export * from './user/user.api';
