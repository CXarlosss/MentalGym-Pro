// src/context/AuthContext.tsx
'use client'
import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser, loginUser, logoutUser, getCurrentUser } from '@/lib/auth'
import { toast } from 'react-hot-toast'

type User = {
  id: string
  name: string
  email: string
  avatar?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar sesión al cargar
  useEffect(() => {
  async function loadUser() {
    try {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')                                                             

      if (token && user) {
        setUser(JSON.parse(user))
      }
    } catch (error) {
      console.error('Error loading user:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false) // ✅ esto debe ir dentro del bloque que sí carga user
    }
  }
  loadUser()
}, [])

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true)
      const { user, token } = await registerUser({ name, email, password })
      localStorage.setItem('token', token)
      setUser(user)
      toast.success('¡Registro exitoso!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error instanceof Error ? error.message : 'Error en el registro')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { user, token } = await loginUser({ email, password })
      localStorage.setItem('token', token)
      setUser(user)
      toast.success('¡Bienvenido de nuevo!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Error en el login')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (token) {
        await logoutUser(token)
      }
      localStorage.removeItem('token')
      setUser(null)
      toast.success('Sesión cerrada correctamente')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error al cerrar sesión')
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...userData } : null))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}