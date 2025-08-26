// src/app/dashboard/historial/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

import { fetchMySessions } from "@/lib/api/";

// Tipos UI de esta página
type Activity = {
  id: string;
  name: string;
  category: "memoria" | "atencion" | "logica" | "calculo";
  score: number; // 0..100
  date: string; // ISO
  durationMin: number;
};

interface SessionLike {
  _id?: string;
  id?: string;
  exercise?: { title?: string; category?: string };
  title?: string;
  category?: string;
  score?: number;
  result?: { score?: number };
  startedAt?: string;
  createdAt?: string;
  endedAt?: string;
  updatedAt?: string;
}

// Mapeo categorías
const toCategory = (raw?: string): Activity["category"] => {
  const r = (raw ?? "").toLowerCase();
  if (["memoria", "memory"].includes(r)) return "memoria";
  if (["atencion", "attention", "focus"].includes(r)) return "atencion";
  if (["logica", "logic", "reasoning"].includes(r)) return "logica";
  if (["calculo", "calculation", "math", "maths"].includes(r)) return "calculo";
  return "memoria";
};

// Normaliza 0..1, 1..10, etc. a 0..100
const normalizeScore = (raw?: number): number => {
  if (raw == null || Number.isNaN(raw)) return 0;
  let n = raw;
  if (n > 0 && n <= 1) n *= 100;
  else if (n > 1 && n <= 10) n *= 10;
  while (n > 100) n /= 10;
  n = Math.round(n);
  return Math.max(0, Math.min(100, n));
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

// ---------- Accordion controlado ----------
type SectionId = "resumen" | "filtros" | "sesiones";

function AccordionSection({
  id,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: (id: SectionId) => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      id={id}
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardHeader
          role="button"
          onClick={() => onToggle(id)}
          className="cursor-pointer select-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-indigo-700">{title}</CardTitle>
              {subtitle && <CardDescription>{subtitle}</CardDescription>}
            </div>
            <span
              className={[
                "text-xl text-gray-500 transition-transform",
                open ? "rotate-180" : "rotate-0",
              ].join(" ")}
            >
              ▾
            </span>
          </div>
        </CardHeader>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key={`${id}-content`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0">{children}</CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();

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

  // NAV/Accordion (MULTI-OPEN)
  const [openSet, setOpenSet] = useState<Set<SectionId>>(new Set()); // todas cerradas
  const [activeSec, setActiveSec] = useState<SectionId | null>(null);
  const scrollToId = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const toggleSection = useCallback(
    (id: SectionId) => {
      setOpenSet((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      setActiveSec(id);
      setTimeout(() => scrollToId(id), 60);
    },
    [scrollToId]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!user) return;
        const sessions = await fetchMySessions();

        const mapped: Activity[] = (sessions as SessionLike[]).map((s) => {
          const started = new Date(s.startedAt ?? s.createdAt ?? Date.now());
          const ended = new Date(s.endedAt ?? s.updatedAt ?? started);
          const durationMin = Math.max(
            1,
            Math.round((ended.getTime() - started.getTime()) / 60000)
          );

          const rawScore = Number(s.result?.score ?? s.score ?? 0);
          const id =
            String(s._id ?? s.id) ||
            (globalThis.crypto?.randomUUID?.() ??
              `${Date.now()}_${Math.random()}`);

          return {
            id,
            name: s.exercise?.title ?? s.title ?? "Ejercicio",
            category: toCategory(s.exercise?.category ?? s.category),
            score: normalizeScore(rawScore),
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

  // KPIs (sobre todos los items)
  const kpis = useMemo(() => {
    const total = items.length;
    const avg =
      total > 0
        ? Math.round(items.reduce((s, x) => s + x.score, 0) / total)
        : 0;
    const best = items.reduce((m, x) => Math.max(m, x.score), 0);
    const mins = items.reduce((s, x) => s + x.durationMin, 0);
    const last =
      items.length > 0
        ? items
            .slice()
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0].date
        : null;
    return { total, avg, best, mins, last };
  }, [items]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filtered.slice(from, from + pageSize);
  }, [filtered, page]);

  // Reset de página al cambiar filtros/orden
  useEffect(() => {
    setPage(1);
  }, [query, category, minScore, sortBy, sortDir]);

  if (loading) return <main className="p-8">Cargando…</main>;
  if (error) return <main className="p-8 text-red-600">{error}</main>;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 bg-gradient-to-br from-indigo-50 to-gray-50 min-h-screen"
    >
      {/* Header */}
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
          <Button variant="outline" className="flex items-center gap-1">
            <span>←</span> Volver
          </Button>
        </Link>
      </div>

      {/* NAVBAR STICKY */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-2 backdrop-blur bg-white/60 border-b">
        <div className="flex items-center gap-2 overflow-auto no-scrollbar">
          {[
            { id: "resumen", label: "Resumen", emoji: "📊" },
            { id: "filtros", label: "Filtros", emoji: "🔎" },
            { id: "sesiones", label: "Sesiones", emoji: "📜" },
          ].map((s) => {
            const isOpen = openSet.has(s.id as SectionId);
            return (
              <button
                key={s.id}
                onClick={() => toggleSection(s.id as SectionId)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm border transition",
                  isOpen
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300",
                ].join(" ")}
              >
                <span className="mr-1">{s.emoji}</span>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESUMEN */}
      <AccordionSection
        id="resumen"
        title="Resumen"
        subtitle="Tus KPIs globales"
        open={openSet.has("resumen")}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Kpi title="Sesiones" value={kpis.total.toLocaleString("es-ES")} />
          <Kpi title="Media puntuación" value={`${kpis.avg}%`} />
          <Kpi title="Mejor puntuación" value={`${kpis.best}%`} />
          <Kpi title="Minutos totales" value={kpis.mins.toLocaleString("es-ES")} />
          <Kpi title="Última sesión" value={kpis.last ? formatDate(kpis.last) : "—"} />
        </div>
      </AccordionSection>

      {/* FILTROS */}
      <AccordionSection
        id="filtros"
        title="Filtrar y ordenar"
        subtitle="Refina la lista para encontrar sesiones concretas"
        open={openSet.has("filtros")}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as "all" | Activity["category"])
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={0}>Puntuación mínima: 0%</option>
            <option value={50}>Puntuación mínima: 50%</option>
            <option value={70}>Puntuación mínima: 70%</option>
            <option value={85}>Puntuación mínima: 85%</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="date">Ordenar por fecha</option>
            <option value="score">Ordenar por puntuación</option>
            <option value="duration">Ordenar por duración</option>
            <option value="name">Ordenar por nombre</option>
          </select>

          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>
      </AccordionSection>

      {/* SESIONES */}
      <AccordionSection
        id="sesiones"
        title="Sesiones"
        subtitle={`${filtered.length} resultados • Página ${page} de ${totalPages}`}
        open={openSet.has("sesiones")}
        onToggle={toggleSection}
      >
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
              className="text-emerald-700 border-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              Anterior
            </Button>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </AccordionSection>
    </motion.main>
  );
}

// ---------- Subcomponentes simples ----------
function Kpi({ title, value }: { title: string; value: string | number }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-3">
          <p className="text-sm text-gray-500">{title}</p>
          <motion.p
            className="text-2xl font-semibold mt-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {value}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
