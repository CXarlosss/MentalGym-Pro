// src/lib/api/user.api.ts
import type { User } from '@/types';
import { patchJSON, get } from './config';

/** Actualiza nombre y/o avatar en el backend */
export const updateUserProfile = (input: Partial<Pick<User, 'name' | 'avatar'>>) =>
  patchJSON<User>('/api/auth/profile', input);

/** (Opcional) cambiar contraseña */
export const changePassword = (input: { currentPassword: string; newPassword: string }) =>
  patchJSON<{ message: string }>('/api/auth/password', input);

/** (Opcional) leer perfil actual del backend */
export const getMe = () => get<User>('/api/auth/me');
