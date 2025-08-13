"use client";

import { useEffect, useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const router = useRouter();

  // ✅ Redirección fiable desde la propia página
  useEffect(() => {
    if (user) {
      console.log("[LoginPage] user presente, navegando a /dashboard");
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      console.log("[LoginPage] Llamando a login del contexto");
      await login(email, password); // setea user en el contexto

      console.log("[LoginPage] Login finalizado, intentando router.replace...");
      router.replace("/dashboard");

      // 🔧 Fallback temporal: si en 150ms no cambió, fuerza navegación dura
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname === "/login") {
          console.log("[LoginPage] router.replace no navegó, forzando window.location.assign");
          window.location.assign("/dashboard");
        }
      }, 150);
    } catch (err) {
      console.error("[LoginPage] Error en login:", err);
      setError(err instanceof Error ? err.message : "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto w-full max-w-md">
          {/* Card principal */}
          <div className="bg-white border rounded-2xl shadow-sm p-8">
            {/* Header */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Inicia sesión</h1>
              <p className="mt-1 text-sm text-gray-600">Bienvenida de nuevo. Continúa tu progreso.</p>
            </div>

            {/* Formulario controlado por AuthForm */}
            <AuthForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSubmit={handleLogin}
              loading={loading}
              error={error}
              buttonText={loading ? (
                <span className="flex items-center justify-center">Procesando...</span>
              ) : "Iniciar sesión"}
            />

            {/* Extras */}
            <div className="mt-6 flex items-center justify-between text-sm">
              <Link href="/recuperar" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
              <Link href="/registro" className="text-gray-600 hover:text-gray-800 transition-colors">
                Crear cuenta
              </Link>
            </div>

            {/* Aviso de seguridad */}
            <p className="mt-6 text-xs text-gray-500 text-center">
              Al continuar, aceptas nuestros <Link href="/terminos" className="underline hover:text-gray-700">Términos</Link> y la <Link href="/privacidad" className="underline hover:text-gray-700">Política de privacidad</Link>.
            </p>
          </div>

          {/* Pie con enlace a volver */}
          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
              <span>←</span>
              Volver a la página principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
