// src/context/AuthContext.tsx
'use client'
import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser, loginUser, logoutUser, getCurrentUser } from '@/lib/auth'
import { toast } from 'react-hot-toast'
import { updateUserProfile } from '@/lib/api/user/user.api'
import type { User } from '@/types'
import { clearLegacyLocalData, clearUserScopedData } from '@/lib/api/'

// 👇 helper para derivar un ID estable

type MaybeIdUser = Partial<User> & {
  _id?: string;
  id?: string;
  username?: string;
};

function deriveUserId(u?: MaybeIdUser | null): string | null {
  if (!u) return null;

  if (typeof u._id === 'string' && u._id) return u._id;
  if (typeof u.id === 'string' && u.id) return u.id;
  if (typeof u.email === 'string' && u.email) return u.email;
  if (typeof u.username === 'string' && u.username) return u.username;
  if (typeof u.name === 'string' && u.name) return u.name;

  return null;
}

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
        setLoading(true)
        const token = localStorage.getItem('token')
        const cached = localStorage.getItem('user')
        if (!token) return

        if (cached) {
          const u: User = JSON.parse(cached)
          setUser(u)
          // ✅ asegura mg:userId también en hidratación desde caché
          const uid = deriveUserId(u)
          if (uid) localStorage.setItem('mg:userId', uid)
          return
        }

        try {
          const u = await getCurrentUser(token)
          localStorage.setItem('user', JSON.stringify(u))
          setUser(u)
          const uid = deriveUserId(u)
          if (uid) localStorage.setItem('mg:userId', uid)
        } catch (e) {
          console.warn('getCurrentUser falló, limpiando sesión', e)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
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
      setUser(newUser)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      // ✅ guarda el bucket-id del usuario
      const uid = deriveUserId(newUser)
      if (uid) localStorage.setItem('mg:userId', uid)

      clearLegacyLocalData()
      toast.success('¡Registro exitoso!')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { user: loggedInUser, token } = await loginUser({ email, password })
      setUser(loggedInUser)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(loggedInUser))
      // ✅ guarda el bucket-id del usuario
      const uid = deriveUserId(loggedInUser)
      if (uid) localStorage.setItem('mg:userId', uid)

      clearLegacyLocalData()
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
      // ❗️esto NO borra tus historiales por-usuario,
      // solo limpia estado volátil y el mg:userId actual.
      clearUserScopedData()

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
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      // ✅ por si cambió el identificador mostrado
      const uid = deriveUserId(updatedUser)
      if (uid) localStorage.setItem('mg:userId', uid)

      toast.success('Perfil actualizado correctamente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider')
  return ctx
}
