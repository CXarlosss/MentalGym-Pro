// src/lib/api/progress/index.ts
import { USE_MOCK } from '../config'
import * as local from './progress.local' // Your local/mock logic
import * as api from './progress.local'     // Your real API logic
import type { DashboardStats, Challenge } from '@/types'

export async function fetchUserProgress(): Promise<DashboardStats> {
  return USE_MOCK ? local.fetchUserProgress() : api.fetchUserProgress()
}

export async function fetchActiveChallenges(): Promise<Challenge[]> {
  return USE_MOCK ? local.fetchActiveChallenges() : api.fetchActiveChallenges()
}