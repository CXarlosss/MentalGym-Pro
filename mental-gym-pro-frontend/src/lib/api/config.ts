// src/lib/config.ts

// ===============================
//     Configuración y flags
// ===============================
const isDev = process.env.NODE_ENV !== 'production';

export const API = isDev
  ? '' // same-origin en dev -> pasará por rewrites, pero OJO: forzamos /api abajo
  : (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK === '1' || process.env.NEXT_PUBLIC_USE_MOCK === 'true';

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

// --- Helpers para namespacing por usuario en localStorage ---
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?._id || u?.id || null;
  } catch {
    return null;
  }
}

export function scopedLSKey(baseKey: string): string {
  const id = getCurrentUserId();
  return id ? `${baseKey}::${id}` : baseKey;
}

// Limpia las **claves antiguas** sin scope (evitas ver datos de otro user)
export function clearLegacyLocalData(): void {
  if (typeof window === 'undefined') return;
  Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
}

// (opcional) limpiar específicamente las claves de un usuario
export function clearUserScopedData(userId?: string): void {
  if (typeof window === 'undefined') return;
  const id = userId || getCurrentUserId();
  if (!id) return;
  Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(`${k}::${id}`));
}

export function toLocalYMD(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export const todayKey = (d: Date = new Date()): string => toLocalYMD(d);

// ===============================
//         Helpers de URL/Query
// ===============================

// Quita el origin si la URL es same-origin (para poder normalizar en dev)
function stripSameOrigin(u: string): string {
  if (!/^https?:\/\//i.test(u)) return u;
  try {
    const base =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const url = new URL(u, base);
    if (typeof window !== 'undefined' && url.origin === window.location.origin) {
      return url.pathname + url.search + url.hash;
    }
  } catch {/* ignore */}
  return u; // URL absoluta de otro origen -> no tocar
}

// En dev, fuerza /... a todo lo que sea same-origin o relativo
function normalizeDevPath(path: string): string {
  const p0 = path.startsWith('/') ? path : `/${path}`;
  if (p0.startsWith('/')) return p0;
  return `/api${p0}`;
}

function buildPath(path: string): string {
  const stripped = stripSameOrigin(path);

  // Dev: same-origin -> siempre pasa por /...
  if (!API) {
    if (/^https?:\/\//i.test(stripped)) return stripped; // absoluta cross-origin
    return normalizeDevPath(stripped);
  }

  // Prod: une base + path (no añadimos /api automáticamente en prod)
  const p = stripped.startsWith('/') ? stripped : `/${stripped}`;
  const b = API.replace(/\/+$/, '');
  return `${b}${p}`;
}

// Valores permitidos en querystring
type Primitive = string | number | boolean;
type QueryScalar = Primitive | null | undefined | Date;
export type QueryParams = Record<string, QueryScalar | QueryScalar[]>;

export function qs(params: QueryParams): string {
  const p = new URLSearchParams();

  const append = (k: string, v: QueryScalar): void => {
    if (v === undefined || v === null) return;
    if (v instanceof Date) {
      p.append(k, v.toISOString());
      return;
    }
    p.append(k, String(v));
  };

  Object.entries(params).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((vv) => append(k, vv));
    else append(k, v);
  });

  const str = p.toString();
  return str ? `?${str}` : '';
}

// ===============================
//        Helpers de auth/HTTP
// ===============================
function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeJSON(res: Response): Promise<unknown | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text; // texto plano si no es JSON válido
  }
}

export class ApiError<E = unknown> extends Error {
  status: number;
  body: E | null;
  constructor(status: number, message: string, body: E | null = null) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function is404(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

/**
 * fetch con headers JSON, Authorization y manejo de error uniforme
 */
export async function apiFetch<T, E = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = buildPath(path);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers,
  });

  if (!res.ok) {
    const body = (await safeJSON(res)) as E | null;
    const msg =
      (body && typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message?: unknown }).message)
        : null) || `${res.status} ${res.statusText}`;
    throw new ApiError<E>(res.status, msg, body);
  }

  if (res.status === 204) return undefined as unknown as T;
  const data = (await safeJSON(res)) as T;
  return data;
}

/**
 * GET sobre una o múltiples rutas en orden (fallback).
 * Si se provee un array, solo se intenta la siguiente cuando el error es 404.
 */
export async function getJSON<T>(paths: string | string[], init?: RequestInit): Promise<T> {
  const tryOne = (p: string) => apiFetch<T>(p, { method: 'GET', ...(init || {}) });

  if (!Array.isArray(paths)) {
    return tryOne(paths);
  }

  let lastErr: unknown;
  for (const p of paths) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await tryOne(p);
    } catch (e) {
      lastErr = e;
      if (is404(e)) continue; // solo saltar en 404
      throw e; // 401/500 etc -> no seguir
    }
  }
  if (lastErr instanceof Error) throw lastErr;
  throw new Error(String(lastErr ?? 'Fetch failed'));
}

// Atajos verbos (tipados)
export const get = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, { method: 'GET', ...(init || {}) });

export const postJSON = <T>(path: string, body?: unknown, init?: RequestInit) =>
  apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}), ...(init || {}) });

export const patchJSON = <T>(path: string, body?: unknown, init?: RequestInit) =>
  apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}), ...(init || {}) });

export const putJSON = <T>(path: string, body?: unknown, init?: RequestInit) =>
  apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}), ...(init || {}) });

export const delJSON = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, { method: 'DELETE', ...(init || {}) });

export const del = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, { method: 'DELETE', ...(init || {}) });
