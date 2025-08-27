// /lib/auth.ts
import type { User } from '@/types';

// Base "/api" en prod (Netlify) o "" en dev si así lo configuras
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
const U = (p: string) => `${API_BASE}${p.startsWith('/') ? p : `/${p}`}`;

interface AuthResponse {
  user: User;
  token?: string; // opcional: si usas cookie, puede no venir
}

// Si usas cookies en el backend, conviene incluir credenciales
const commonInit = (extra?: RequestInit): RequestInit => ({
  credentials: 'include',
  ...extra,
});

export const registerUser = async (data: { name: string; email: string; password: string }): Promise<AuthResponse> => {
  const res = await fetch(U('/auth/register'), commonInit({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
  const txt = await res.text();
  const ct = res.headers.get('content-type') || '';
  const json = ct.includes('application/json') ? JSON.parse(txt) : { message: txt };
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json as AuthResponse;
};

export const loginUser = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const res = await fetch(U('/auth/login'), commonInit({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
  const txt = await res.text();
  const ct = res.headers.get('content-type') || '';
  const json = ct.includes('application/json') ? JSON.parse(txt) : { message: txt };
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json as AuthResponse;
};

// token opcional: si lo pasas, manda Authorization; si no, tira de cookie
export const getCurrentUser = async (token?: string): Promise<User> => {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`; // permite Bearer si lo usas

  // IMPORTANTE: en tu backend la ruta es /api/users/me (no /api/auth/me)
  const res = await fetch(U('/users/me'), commonInit({ headers }));
  const txt = await res.text();
  const ct = res.headers.get('content-type') || '';
  const json = ct.includes('application/json') ? JSON.parse(txt) : { message: txt };
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json as User;
};

export const logoutUser = async (token?: string): Promise<void> => {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(U('/auth/logout'), commonInit({ method: 'POST', headers }));
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }
};
