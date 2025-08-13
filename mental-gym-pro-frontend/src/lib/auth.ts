// /lib/auth.ts
import type { User } from '@/types' // ✅ Import the global User type

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ✅ Update the type definition to use the global User interface
interface AuthResponse {
  user: User;
  token: string;
}

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en el registro');
  }

  // Ensure the API returns the correct type or cast it if necessary
  const result: AuthResponse = await response.json();
  return result;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en el login');
  }

  const result: AuthResponse = await response.json();
  return result;
};

export const logoutUser = async (token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al cerrar sesión');
  }
};

export const getCurrentUser = async (token: string): Promise<User> => { // ✅ Use the global User type directly
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener usuario');
  }

  // Make sure the API response for `/me` matches the User type
  const user: User = await response.json();
  return user;
};