// src/app/register/page.tsx
'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import AuthForm from '@/components/auth/AuthForm'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      await register(name, email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto w-full max-w-md">
          {/* Card principal */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Crear cuenta</h2>
              <p className="mt-1 text-sm text-gray-600">Empieza tu viaje con MentalGym Pro</p>
            </div>

            {/* Error global opcional (además del que muestra AuthForm) */}
            {error && (
              <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <AuthForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              showNameField
              buttonText={
                loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  'Registrarse'
                )
              }
            />

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">¿Ya tienes una cuenta? </span>
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                Inicia sesión aquí
              </Link>
            </div>
          </div>

          {/* Footer legal */}
          <div className="mt-6 text-center text-xs text-gray-500">
            Al registrarte, aceptas nuestros{' '}
            <Link href="/terms" className="underline hover:text-gray-700">Términos</Link> y{' '}
            <Link href="/privacy" className="underline hover:text-gray-700">Política de Privacidad</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
