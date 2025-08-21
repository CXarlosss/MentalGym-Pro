// src/app/dashboard/historial/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 👇 importa tu API real (ya la exportaste en lib/api/index)
import { fetchMySessions } from "@/lib/api/";

// Tipos UI de esta página
type Activity = {
  id: string;
  name: string;
  category: "memoria" | "atencion" | "logica" | "calculo";
  score: number;
  date: string; // ISO
  durationMin: number;
};
// Pon esto arriba del archivo (junto a Activity)
type SessionLike = {
  _id?: string;
  id?: string;
  exercise?: { title?: string; category?: Activity["category"] };
  title?: string;
  category?: Activity["category"];
  score?: number;
  result?: { score?: number };
  startedAt?: string;
  createdAt?: string;
  endedAt?: string;
  updatedAt?: string;
};

// Utilidad para asegurar la categoría
const toCategory = (raw?: string): Activity["category"] => {
  const allowed: Activity["category"][] = [
    "memoria",
    "atencion",
    "logica",
    "calculo",
  ];
  return allowed.includes(raw as Activity["category"])
    ? (raw as Activity["category"])
    : "memoria";
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function badge(score: number) {
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 50) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

type SortKey = "date" | "score" | "duration" | "name";

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controles
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | Activity["category"]>("all");
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!user) return; // opcional: redirigir a login
        const sessions = await fetchMySessions(); // ← API real o mock según USE_MOCK
        // Mapea tu tipo de sesión a Activity para la tabla
        // Si fetchMySessions no está tipado, castea el array una sola vez:
        const mapped: Activity[] = (sessions as SessionLike[]).map((s) => {
          const started = new Date(s.startedAt ?? s.createdAt ?? Date.now());
          const ended = new Date(s.endedAt ?? s.updatedAt ?? started);
          const durationMin = Math.max(
            1,
            Math.round((ended.getTime() - started.getTime()) / 60000)
          );

          return {
            id: String(s._id ?? s.id ?? crypto.randomUUID()),
            name: s.exercise?.title ?? s.title ?? "Ejercicio",
            category: toCategory(s.exercise?.category ?? s.category),
            score: Math.round(s.score ?? s.result?.score ?? 0),
            date:
              s.endedAt ??
              s.updatedAt ??
              s.startedAt ??
              s.createdAt ??
              new Date().toISOString(),
            durationMin,
          };
        });

        if (alive) setItems(mapped);
      } catch (e) {
        console.error(e);
        if (alive) setError("No pude cargar tu historial");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  // Filtrado + orden
  const filtered = useMemo(() => {
    let arr = [...items];
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((a) => a.name.toLowerCase().includes(q));
    }
    if (category !== "all") arr = arr.filter((a) => a.category === category);
    if (minScore > 0) arr = arr.filter((a) => a.score >= minScore);

    arr.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date")
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortBy === "score") cmp = a.score - b.score;
      else if (sortBy === "duration") cmp = a.durationMin - b.durationMin;
      else if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [items, query, category, minScore, sortBy, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filtered.slice(from, from + pageSize);
  }, [filtered, page]);

  // Reset página (usa useEffect, no useMemo, para evitar efectos en memo)
  useEffect(() => {
    setPage(1);
  }, [query, category, minScore, sortBy, sortDir]);

  if (loading) return <main className="p-8">Cargando…</main>;
  if (error) return <main className="p-8 text-red-600">{error}</main>;

  return (
    <main className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Historial de Actividad
          </h1>
          <p className="text-gray-600">
            Consulta tus ejercicios recientes y su rendimiento.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">← Volver al dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar y ordenar</CardTitle>
          <CardDescription>
            Refina la lista para encontrar sesiones concretas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as "all" | Activity["category"])
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="memoria">Memoria</option>
              <option value="atencion">Atención</option>
              <option value="logica">Lógica</option>
              <option value="calculo">Cálculo</option>
            </select>

            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={0}>Puntuación mínima: 0%</option>
              <option value={50}>Puntuación mínima: 50%</option>
              <option value={70}>Puntuación mínima: 70%</option>
              <option value={85}>Puntuación mínima: 85%</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date">Ordenar por fecha</option>
              <option value="score">Ordenar por puntuación</option>
              <option value="duration">Ordenar por duración</option>
              <option value="name">Ordenar por nombre</option>
            </select>

            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesiones</CardTitle>
          <CardDescription>
            {filtered.length} resultados • Página {page} de {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">Categoría</th>
                  <th className="py-2 pr-4">Puntuación</th>
                  <th className="py-2 pr-4">Duración</th>
                  <th className="py-2 pr-4">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="py-3 pr-4 capitalize text-gray-700">
                      {item.category}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${badge(
                          item.score
                        )}`}
                      >
                        {item.score}%
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {item.durationMin} min
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {formatDate(item.date)}
                    </td>
                  </tr>
                ))}

                {paged.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No hay resultados con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Mostrando {(page - 1) * pageSize + 1}
              {"–"}
              {Math.min(page * pageSize, filtered.length)} de {filtered.length}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
