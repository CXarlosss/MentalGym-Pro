'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link
        href={href}
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
      >
        {children}
      </Link>
    </motion.div>
  )
}

export default function Header() {
  const { user, logout } = useAuth() // asumiendo que tu AuthContext expone logout()

  return (
    <header className="bg-white shadow-lg py-4 px-8 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mental Gym Pro
            </h1>
          </Link>
        </motion.div>

        {/* Navegación */}
        <nav className="flex items-center gap-4">
          <NavLink href="/dashboard">Dashboard</NavLink>

          {user ? (
            <>
              <NavLink href="/dashboard/retosmentales">Retos mentales</NavLink>

              {/* Perfil (avatar/nombre) */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/profile" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden grid place-items-center text-sm font-semibold text-gray-600">
                    {/* Muestra inicial del nombre si no hay avatar */}
                    {user.avatar ? (
                      // usa <img> para no depender de next/image config
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      (user.name?.[0] || 'U').toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm text-gray-700 hover:text-indigo-600">
                    {user.name}
                  </span>
                </Link>
              </motion.div>

              {/* Cerrar sesión */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
              >
                Cerrar sesión
              </motion.button>
            </>
          ) : (
            <>
              <NavLink href="/login">Login</NavLink>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Registrarse
                </Link>
              </motion.div>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
