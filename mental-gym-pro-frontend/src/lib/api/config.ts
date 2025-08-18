// src/lib/api/config.ts

// ===============================
//     Configuración y flags
// ===============================
export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === '1';

// Claves de LocalStorage (una sola fuente de verdad)
export const LS_KEYS = {
  activity: 'mgp_activity_log',
  gym: 'mgp_gym_workouts',
  routines: 'mgp_routines',
  favExercises: 'mgp_fav_exercises',
  cardio: 'mgp_cardio',
  goals: 'mgp_goals',
  badges: 'mgp_badges',

  nutrDay: 'mgp_nutrition_day',
  nutrFavs: 'mgp_nutrition_favs',
  nutrTargets: 'mgp_nutrition_targets',
  nutrFoodDb: 'mgp_food_db',
} as const;

// ===============================
//         Helpers de fecha
// ===============================
// Devuelve YYYY-MM-DD en zona local (evita líos de TZ en gráficos)
export function toLocalYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export const todayKey = (d = new Date()) => toLocalYMD(d);

// ===============================
//        Helpers de HTTP
// ===============================
function toURL(p: string) {
  // Soporta rutas absolutas por si acaso
  if (/^https?:\/\//i.test(p)) return p;
  return `${API}${p}`;
}

/**
 * Intenta GET sobre varias rutas (en orden) y devuelve la primera que funcione.
 * Añade credentials: 'include' por defecto.
 */
export async function getJSON<T>(paths: string[], init?: RequestInit): Promise<T> {
  let lastErr: unknown;
  for (const p of paths) {
    try {
      const res = await fetch(toURL(p), { ...init, credentials: 'include' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return (await res.json()) as T;
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr instanceof Error) throw lastErr;
  throw new Error(String(lastErr ?? 'Fetch failed'));
}

/**
 * POST JSON a una ruta. Lanza si no es 2xx. Incluye credentials.
 */
export async function postJSON<T>(
  path: string,
  body: unknown,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(toURL(path), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: JSON.stringify(body),
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}
