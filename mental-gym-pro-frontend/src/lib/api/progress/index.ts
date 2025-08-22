// src/lib/api/progress/index.ts
import { USE_MOCK } from '../config'
import * as local from './progress.local'
import * as api from './progress.api'
import type { DashboardStats } from '@/types'

export async function fetchUserProgress(): Promise<DashboardStats> {
  return USE_MOCK ? local.fetchUserProgress() : api.fetchUserProgress()
}

// (si quisieras retos desde aquí, puedes enrutar igual)
