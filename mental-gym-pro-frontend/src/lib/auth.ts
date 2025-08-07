const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  token: string
}

export const registerUser = async (data: {
  name: string
  email: string
  password: string
}): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error en el registro')
  }

  return response.json()
}

export const loginUser = async (data: {
  email: string
  password: string
}): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error en el login')
  }

  return response.json()
}

export const logoutUser = async (token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Error al cerrar sesión')
  }
}

export const getCurrentUser = async (token: string): Promise<{
  id: string
  name: string
  email: string
  avatar?: string
}> => {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Error al obtener usuario')
  }

  return response.json()
}
