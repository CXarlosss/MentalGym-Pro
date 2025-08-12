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
        const cached = localStorage.getItem('user')

        if (!token) return
        if (cached) {
          setUser(JSON.parse(cached))
          return
        }

        // Fallback: si hay token pero no user cacheado, consultar al backend
        try {
          const u = await getCurrentUser(token)
          localStorage.setItem('user', JSON.stringify(u))
          setUser(u)
        } catch (e) {
          console.warn('getCurrentUser falló, limpiando sesión', e)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error loading user:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true)
      const { user, token } = await registerUser({ name, email, password })
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user)) // ✅ cachea también el user
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
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      toast.success('¡Bienvenido de nuevo!')
      router.replace('/dashboard')
    } catch (error) {
      console.error('[AuthContext] Error en login:', error)
      toast.error(error instanceof Error ? error.message : 'Error en el login')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    try {
      if (token) {
        // No dejes que una caída del backend rompa el logout local
        await logoutUser(token).catch((e: unknown) => {
          console.warn('logoutUser falló (ignorado):', e)
        })
      }
    } finally {
      // Pase lo que pase, limpia y redirige
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      toast.success('Sesión cerrada correctamente')
      router.replace('/login')
      setLoading(false)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => {
      const next = prev ? { ...prev, ...userData } : null
      if (next) localStorage.setItem('user', JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, updateUser }}
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
