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
      if (window.location.pathname === "/login") {
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
    // ... deja tu JSX igual
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* ... */}
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
      {/* ... */}
    </div>
  );
}
