// src/lib/api/fitness.api.ts
import type {
  ActivityEntry,
  WeeklyActivitySummary,
  WorkoutEntry,
  WorkoutWeeklySummary,
  GroupVolume,
  LiftSet,
  CardioEntry,
} from '@/types';
import { API } from '../config';

/** Devuelve headers siempre válidos para fetch, añadiendo Authorization si hay token */
function withAuth(headers?: HeadersInit): HeadersInit {
  const h = new Headers(headers);
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) h.set('Authorization', `Bearer ${token}`);
  }
  return h;
}

// ---------- GYM ----------
export async function addGymSetToday(
  set: Omit<LiftSet, '_id' | 'createdAt'>
): Promise<WorkoutEntry> {
  const res = await fetch(`${API}/api/fitness/gym/sets`, {
    method: 'POST',
    credentials: 'include',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(set),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function getGymWorkouts(): Promise<WorkoutEntry[]> {
  const res = await fetch(`${API}/api/fitness/gym/workouts`, {
    credentials: 'include',
    headers: withAuth(),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function getGymWeeklySummary(): Promise<WorkoutWeeklySummary> {
  const res = await fetch(`${API}/api/fitness/gym/weekly-summary`, {
    credentials: 'include',
    headers: withAuth(),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function getGroupVolumeThisWeek(): Promise<GroupVolume[]> {
  const res = await fetch(`${API}/api/fitness/gym/group-volume-week`, {
    credentials: 'include',
    headers: withAuth(),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ---------- ACTIVITY (pasos) ----------
export async function getActivities(): Promise<ActivityEntry[]> {
  const res = await fetch(`${API}/api/fitness/activity`, {
    credentials: 'include',
    headers: withAuth(),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function upsertTodayActivity(input: {
  steps: number;
  minutes?: number;
  calories?: number;
  note?: string;
}): Promise<ActivityEntry> {
  const res = await fetch(`${API}/api/fitness/activity/today`, {
    method: 'PUT',
    credentials: 'include',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function getWeeklyActivity(): Promise<WeeklyActivitySummary> {
  const res = await fetch(`${API}/api/fitness/activity/week`, { // <- antes: /weekly-summary
    credentials: 'include',
    headers: withAuth(),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ---------- CARDIO ----------
export async function addCardioToday(
  input: Omit<CardioEntry, '_id' | 'date' | 'createdAt' | 'updatedAt'>
): Promise<CardioEntry> {
  const res = await fetch(`${API}/api/fitness/cardio`, {
    method: 'POST',
    credentials: 'include',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function getCardioWeek() {
  const res = await fetch(`${API}/api/fitness/cardio/week`, {
    credentials: 'include',
    headers: withAuth(),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
