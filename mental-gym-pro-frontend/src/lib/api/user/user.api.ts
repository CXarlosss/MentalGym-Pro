// src/lib/api/user.api.ts
import type { User } from '@/types';
import { patchJSON, get, postJSON } from '../config'; // <- aquí

// Perfil actual
export const getMe = () => get<User>('/api/users/me');

// Lo que tu backend acepta actualizar (sé flexible con name/username)
type ProfileUpdateInput = Partial<{
  username: string;
  name: string;
  email: string;
  avatar: string;
}>;

export const updateUserProfile = (input: ProfileUpdateInput) =>
  patchJSON<User>('/api/users/me', input);

// Cambiar contraseña
export const changePassword = (input: { currentPassword: string; newPassword: string }) =>
  postJSON<{ success: boolean }>('/api/users/me/password', input);

// Tipado público mínimo para listas de seguidores
type PublicUser = {
  _id: string;
  avatar?: string;
  username?: string;
  name?: string;
};

export const followUser = (id: string) =>
  postJSON<{ success: boolean }>(`/api/users/${id}/follow`, {});

export const unfollowUser = (id: string) =>
  fetch(`/api/users/${id}/follow`, { method: 'DELETE', credentials: 'include' }).then((r) => r.json());

export const myFollowers = () => get<PublicUser[]>('/api/users/me/followers');
export const myFollowing = () => get<PublicUser[]>('/api/users/me/following');
