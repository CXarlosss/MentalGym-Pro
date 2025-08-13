'use client'
import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser, loginUser, logoutUser, getCurrentUser } from '@/lib/auth'
import { toast } from 'react-hot-toast'
import { updateUserProfile } from '@/lib/api'
import type { User } from '@/types' // ✅ Importa el tipo User del archivo de tipos global

// ✅ Elimina esta definición local de 'User' para evitar el conflicto
// type User = {
//   id: string
//   name: string
//   email: string
//   avatar?: string
// }

type AuthContextType = {
  user: User | null
  loading: boolean
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem('token')
        const cached = localStorage.getItem('user')
        setLoading(true)

        if (!token) return
        if (cached) {
          // ✅ Ahora el tipo de `cached` es compatible con el tipo `User` del estado
          setUser(JSON.parse(cached))
          return
        }

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
      const { user: newUser, token } = await registerUser({ name, email, password })

      // ✅ `newUser` debería ser un objeto con _id, createdAt y updatedAt
      setUser(newUser)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      
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
      const { user: loggedInUser, token } = await loginUser({ email, password })

      // ✅ `loggedInUser` debería ser un objeto con _id, createdAt y updatedAt
      setUser(loggedInUser)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(loggedInUser))

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
        await logoutUser(token).catch((e: unknown) => {
          console.warn('logoutUser falló (ignorado):', e)
        })
      }
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      toast.success('Sesión cerrada correctamente')
      router.replace('/login')
      setLoading(false)
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No hay sesión activa para actualizar')

      setLoading(true)
      const updatedUser = await updateUserProfile(userData)
      
      // ✅ El objeto `updatedUser` ahora es del tipo correcto (`User` con `_id`)
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('No se pudo actualizar el perfil')
      throw error
    } finally {
      setLoading(false)
    }
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