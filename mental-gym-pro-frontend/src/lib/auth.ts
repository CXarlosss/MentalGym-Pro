// /lib/auth.ts
import type { User } from '@/types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, ''); // "/api" o "" en dev

const U = (p: string) => `${API_BASE}${p.startsWith('/') ? p : `/${p}`}`;

// ¿usas sesión por cookie? entonces usa credentials:'include'
// Si usas JWT en localStorage, añade Authorization aquí.
const commonInit = (extra?: RequestInit): RequestInit => ({
  credentials: 'include', // ⬅️ quítalo si NO usas cookies
  ...extra,
});

interface AuthResponse {
  user: User;
  token?: string; // hazlo opcional por si usas cookie y no devuelves token
}

export const registerUser = async (data: { name: string; email: string; password: string }): Promise<AuthResponse> => {
  const res = await fetch(U('/auth/register'), commonInit({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
  const text = await res.text();
  const ct = res.headers.get('content-type') || '';
  const json = ct.includes('application/json') ? JSON.parse(text) : { message: text };
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json as AuthResponse;
};

export const loginUser = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const res = await fetch(U('/auth/login'), commonInit({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
  const text = await res.text();
  const ct = res.headers.get('content-type') || '';
  const json = ct.includes('application/json') ? JSON.parse(text) : { message: text };
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json as AuthResponse;
};

export const logoutUser = async (): Promise<void> => {
  const res = await fetch(U('/auth/logout'), commonInit({ method: 'POST' }));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
};

// IMPORTANTE: tu backend expone /api/users/me, no /api/auth/me
export const getCurrentUser = async (): Promise<User> => {
  const res = await fetch(U('/users/me'), commonInit());
  const text = await res.text();
  const ct = res.headers.get('content-type') || '';
  const json = ct.includes('application/json') ? JSON.parse(text) : { message: text };
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json as User;
};
