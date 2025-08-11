"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function useProtectedRoute() {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // espera al contexto
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userLS = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    const hasSession = !!user || (!!token && !!userLS);

    if (!hasSession) {
      if (pathname !== "/login") {
        console.log("[useProtectedRoute] Sin sesión -> /login");
        router.replace("/login");
      }
    } else {
      console.log("[useProtectedRoute] Sesión OK");
    }

    setChecking(false);
  }, [loading, user, pathname, router]);

  return { loading: loading || checking };
}
