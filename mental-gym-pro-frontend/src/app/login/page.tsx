'use client'

import { useState } from 'react'
import { login } from "@/lib/api"
import AuthForm from "@/components/auth/AuthForm"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")
      const data = await login(email, password)
      localStorage.setItem("token", data.token)
      console.log("Login correcto ✅", data)
    } catch (err) {
      setError("Credenciales inválidas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <AuthForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onSubmit={handleLogin}
        loading={loading}
        error={error}
        buttonText="Iniciar sesión"
      />
    </main>
  )
}
