// src/lib/api/progress/progress.local.ts
import type { DashboardStats, Challenge } from '@/types';
import { LS_KEYS, scopedLSKey, toLocalYMD, todayKey } from '../config';

// Estructura esperada de tu log local (ajústala si difiere)
type ActivityLogItem = {
  date: string;       // 'YYYY-MM-DD'
  kind?: string;      // 'mental' | 'gym' | 'cardio' ...
  score?: number;     // 0..100
};

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(scopedLSKey(key));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lastNDaysKeys(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d); dd.setDate(d.getDate() - i);
    out.push(toLocalYMD(dd));
  }
  return out;
}

export async function fetchUserProgress(): Promise<DashboardStats> {
  // lee un log por usuario (ajusta a la clave real si usas otra)
  const log = readJSON<ActivityLogItem[]>(LS_KEYS.activity, []);

  // cuenta “eventos” por día (filtra ‘mental’ si lo deseas)
  const keys = lastNDaysKeys(7);
  const byDay = new Map<string, number>();
  for (const k of keys) byDay.set(k, 0);
  for (const it of log) {
    if (byDay.has(it.date)) {
      // si quieres sólo mentales: if (it.kind === 'mental') ...
      byDay.set(it.date, (byDay.get(it.date) ?? 0) + 1);
    }
  }

  const weeklyData = keys.map(k => byDay.get(k) ?? 0);

  // streak: días consecutivos (hoy hacia atrás) con actividad > 0
  let streak = 0;
  {
    const today = todayKey();
    const idx = keys.indexOf(today);
    const scan = idx === -1 ? keys.length - 1 : idx;
    for (let i = scan; i >= 0; i--) {
      if (weeklyData[i] > 0) streak++;
      else break;
    }
  }

  // total/avg: sobre todo el log (ajústalo a tu modelo real)
  const totalExercises = log.length;
  const scores = log.map(l => l.score).filter((s): s is number => typeof s === 'number');
  const averageScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return { weeklyData, streak, totalExercises, averageScore };
}

export const fetchActiveChallenges = async (): Promise<Challenge[]> => {
  // si quieres, persiste retos en LS y léelos aquí; de momento vacío
  return [];
};
