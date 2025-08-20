// src/lib/api/user.api.ts
import type { User } from '@/types';
import { patchJSON, get, postJSON } from '../config';

// Lee perfil actual
export const getMe = () => get<User>('/api/users/me');

// Actualiza username/email/avatar (tu controller acepta username, email, avatar)
export const updateUserProfile = (input: Partial<Pick<User, 'username' | 'email' | 'avatar'>>) =>
  patchJSON<User>('/api/users/me', input);

// Cambiar contraseña
export const changePassword = (input: { currentPassword: string; newPassword: string }) =>
  postJSON<{ success: boolean }>('/api/users/me/password', input);

// (Opcional) follow/unfollow y listas, por si los usas desde el front:
export const followUser = (id: string) => postJSON<{ success: boolean }>(`/api/users/${id}/follow`, {});
export const unfollowUser = (id: string) => fetch(`/api/users/${id}/follow`, { method: 'DELETE', credentials: 'include' }).then(r => r.json());
export const myFollowers = () => get<Array<Pick<User,'_id'|'username'|'avatar'>>>('/api/users/me/followers');
export const myFollowing = () => get<Array<Pick<User,'_id'|'username'|'avatar'>>>('/api/users/me/following');
