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
console.log('[AUTH] API_BASE =', API_BASE);

export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const url = U('/auth/register');
  console.log('[AUTH] register ->', url, data); // 👈 NO subir passwords reales en prod
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const text = await res.text();
  console.log('[AUTH] register status:', res.status, 'CT:', res.headers.get('content-type'));
  console.log('[AUTH] register body:', text.slice(0, 300)); // evita spamear

  const isJSON = (res.headers.get('content-type') || '').includes('application/json');
  const json = isJSON && text ? JSON.parse(text) : { message: text };

  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json as { user: User; token?: string };
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
