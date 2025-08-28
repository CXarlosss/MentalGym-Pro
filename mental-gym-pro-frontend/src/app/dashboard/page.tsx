// src/app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Corrected import
import { fetchUserProgress } from "@/lib/api/progress/progress";

// Keep the rest of your imports as they were, but separated
import {
  fetchActiveChallenges,
  fetchMyChallenges,
  fetchRecentExercises,
  fetchExercises,
  fetchExerciseCategories,
  getWeeklyActivity,
} from "@/lib/api/";
// Or import them directly as well if they're also in separate files
import { getTodayNutrition, getNutritionTargets } from "@/lib/api/nutrition/nutrition";

import ProgressChart from "@/components/dashboard/ProgressChart";
import ExerciseCard from "@/components/cards/ExerciseCard";
import ChallengeItem from "@/components/exercises/ChallengeItem";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import WelcomeBanner from "@/components/layout/WellcomeBanner";
import StatsCard from "@/components/cards/StatsCard";
import SearchHeader from "@/components/exercises/SearchHeader";
import FilterPanel from "@/components/exercises/FilterPanel";

import FabQuickActions from "@/components/layout/FabQuickActions";
import GoalRing from "@/components/dashboard/GoalRing";
import AchievementsModal from "@/components/achievements/AchievementsModal";

import type {
  Exercise,
  Challenge,
  UserChallenge,
  DashboardStats,
  DailyNutrition,
  NutritionTargets,
  WeeklyActivitySummary,
} from "@/types";

// ---------- Accordion controlado ----------
type SectionId =
  | "goals"
  | "heatmap"
  | "quick-access"
  | "stats"
  | "weekly-progress"
  | "challenges"
  | "exercise-explorer"
  | "recommendation";

function AccordionSection({
  id,
  title,
  subtitle,
  open,
  onToggle,
  className,
  children,
}: {
  id: SectionId;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: (id: SectionId) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      className={`scroll-mt-24 ${className ?? ""}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="bg-white rounded-xl shadow-sm border">
        <button
          type="button"
          onClick={() => onToggle(id)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 rounded-t-xl"
        >
          <div>
            <h2 className="text-lg font-semibold text-indigo-700">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <span
            className={[
              "text-xl text-gray-500 transition-transform",
              open ? "rotate-180" : "rotate-0",
            ].join(" ")}
          >
            ▾
          </span>
        </button>

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
              <div className="pt-0 pb-4 px-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

// ---------- Tipos/estado ----------
type DashboardData = DashboardStats & {
  recentExercises: Exercise[];
  activeChallenges: Challenge[];
};

type Filters = {
  searchQuery: string;
  category: string;
  difficulty: string;
  sortBy: "recent" | "difficulty-asc" | "difficulty-desc";
};

export default function DashboardPage() {
  const { user } = useAuth();

  // Dashboard core
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Explorar ejercicios
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    searchQuery: "",
    category: "",
    difficulty: "",
    sortBy: "recent",
  });

  // Gamificación (mis desafíos)
  const [myChallenges, setMyChallenges] = useState<UserChallenge[]>([]);

  // Extra UI state
  const [openAch, setOpenAch] = useState(false);

  // Datos para anillos
  const [today, setToday] = useState<DailyNutrition | null>(null);
  const [targets, setTargets] = useState<NutritionTargets | null>(null);
  const [weekAct, setWeekAct] = useState<WeeklyActivitySummary | null>(null);

  // NAV / múltiples abiertos (todo cerrado por defecto)
  const [openSet, setOpenSet] = useState<Set<SectionId>>(new Set());
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
      setTimeout(() => scrollToId(id), 60);
    },
    [scrollToId]
  );

  // ---------- Carga inicial ----------
  useEffect(() => {
  async function loadDashboardData() {
    try {
      setLoading(true);
      console.log('Iniciando carga de datos del dashboard...');

      const [
        progress,
        challenges,
        recent,
        allExercises,
        cats,
        wAct,
        todayData,
        targetsData,
        mine,
      ] = await Promise.all([
        fetchUserProgress(),
        fetchActiveChallenges(),
        fetchRecentExercises(3),
        fetchExercises(),
        fetchExerciseCategories(),
        getWeeklyActivity(),
        getTodayNutrition(),
        getNutritionTargets(),
        fetchMyChallenges(),
      ]);

      setData({
        weeklyData: progress.weeklyData,
        streak: progress.streak,
        totalExercises: progress.totalExercises,
        averageScore: progress.averageScore,
        recentExercises: recent,
        activeChallenges: challenges,
      });

      const list = Array.isArray(allExercises) ? allExercises : allExercises.items;
      setExercises(list);
      setCategories(cats);
      setWeekAct(wAct);

      setToday(todayData);
      setTargets(targetsData);
      setMyChallenges(mine);
      
    } catch (err) {
      console.error('Error en loadDashboardData:', err);
      
      // Verificación de tipo para TypeScript
      if (err instanceof Error) {
        console.error('Error stack:', err.stack);
        console.error('Error message:', err.message);
        setError("Error al cargar los datos del dashboard: " + err.message);
      } else {
        console.error('Error desconocido:', err);
        setError("Error al cargar los datos del dashboard");
      }
      
    } finally {
      setLoading(false);
    }
  }
  
  if (user) loadDashboardData();
}, [user]);

  // Refrescar desafíos cuando cambie el estado local (join/complete)
  const refreshChallenges = useCallback(async () => {
    try {
      const [active, mine] = await Promise.all([fetchActiveChallenges(), fetchMyChallenges()]);
      setData((prev) => (prev ? { ...prev, activeChallenges: active } : prev));
      setMyChallenges(mine);
    } catch {
      // ignoramos errores de refresco puntual
    }
  }, []);

  useEffect(() => {
    const handler = () => refreshChallenges();
    if (typeof window !== "undefined") {
      window.addEventListener("mg:challenges-changed", handler);
      return () => window.removeEventListener("mg:challenges-changed", handler);
    }
  }, [refreshChallenges]);

  // ---------- Filtrado ----------
  const filteredExercises = useMemo(() => {
    let result = [...exercises];

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      );
    }

    if (filters.category) {
      result = result.filter((e) => e.category === filters.category);
    }

    if (filters.difficulty) {
      result = result.filter((e) => e.difficulty === filters.difficulty);
    }

    const difficultyToNumber = (d: string) =>
      d === "easy" ? 1 : d === "medium" ? 2 : d === "hard" ? 3 : 0;

    switch (filters.sortBy) {
      case "recent":
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "difficulty-asc":
        result.sort(
          (a, b) => difficultyToNumber(a.difficulty) - difficultyToNumber(b.difficulty)
        );
        break;
      case "difficulty-desc":
        result.sort(
          (a, b) => difficultyToNumber(b.difficulty) - difficultyToNumber(a.difficulty)
        );
        break;
    }

    return result;
  }, [exercises, filters]);

  // ---------- ID recomendado ----------
  const recommendedId = useMemo<string | null>(() => {
    return (
      data?.recentExercises[0]?._id ??
      filteredExercises[0]?._id ??
      exercises[0]?._id ??
      null
    );
  }, [data, filteredExercises, exercises]);

  const handleFilterChange = (partial: Partial<Filters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!data) return <div>No hay datos disponibles</div>;

  // valores para anillos
  const kcalToday = today?.kcal ?? 0;
  const kcalGoal = targets?.kcal ?? 2200;
  const waterToday = today?.waterMl ?? 0;
  const waterGoal = targets?.waterMl ?? 2000;
  const stepsToday =
    weekAct?.last7Days?.[weekAct.last7Days.length - 1]?.steps ?? 0;
  const stepsGoal = 10000;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Command Palette (⌘/Ctrl+K) */}
      {/* (Mantengo tu componente tal cual) */}

      {/* Banner de bienvenida */}
      <WelcomeBanner
        name={user?.name}
        streak={data.streak}
        totalExercises={data.totalExercises}
        averageScore={data.averageScore}
        recommendedId={recommendedId}
        tip="Bebe 500 ml de agua antes de empezar 😉"
      />

      {/* NAVBAR STICKY de secciones */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-2 backdrop-blur bg-white/60 border-b">
        <div className="container mx-auto flex items-center gap-2 overflow-auto no-scrollbar">
          {[
            { id: "goals", label: "Objetivos", emoji: "🎯" },
            { id: "quick-access", label: "Accesos", emoji: "🚀" },
            { id: "stats", label: "Stats", emoji: "📊" },
            { id: "weekly-progress", label: "Progreso", emoji: "📈" },
            { id: "challenges", label: `Desafíos (${myChallenges.length})`, emoji: "🏆" },
            { id: "exercise-explorer", label: "Ejercicios", emoji: "🧩" },
            { id: "recommendation", label: "Hoy", emoji: "⚡" },
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
          <div className="ml-auto">
            <button
              onClick={() => setOpenAch(true)}
              className="px-3 py-1.5 rounded-full text-sm border hover:bg-gray-50"
            >
              🏅 Logros
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Anillos de objetivo diarios */}
        <AccordionSection
          id="goals"
          title="Objetivos diarios"
          open={openSet.has("goals")}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GoalRing label="Calorías" value={kcalToday} goal={kcalGoal} />
            <GoalRing label="Agua" value={waterToday} goal={waterGoal} unit="ml" />
            <GoalRing label="Pasos" value={stepsToday} goal={stepsGoal} />
          </div>
        </AccordionSection>

       

        {/* Lanzadera: accesos rápidos */}
        <AccordionSection
          id="quick-access"
          title="Accesos rápidos"
          open={openSet.has("quick-access")}
          onToggle={toggleSection}
          className="bg-gray-50"
        >
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Link
              href="/dashboard/actividad"
              className="bg-white p-4 rounded-xl shadow-sm border hover:shadow transition"
            >
              <div className="text-2xl mb-2">👣</div>
              <div className="font-semibold">Actividad</div>
              <div className="text-xs text-gray-500">Pasos & semana</div>
            </Link>

            <Link
              href="/dashboard/alimentacion"
              className="bg-white p-4 rounded-xl shadow-sm border hover:shadow transition"
            >
              <div className="text-2xl mb-2">🥗</div>
              <div className="font-semibold">Hábitos saludables</div>
              <div className="text-xs text-gray-500">Registro & metas</div>
            </Link>

            <Link
              href="/dashboard/gym"
              className="bg-white p-4 rounded-xl shadow-sm border hover:shadow transition"
            >
              <div className="text-2xl mb-2">🏋️‍♂️</div>
              <div className="font-semibold">Gym</div>
              <div className="text-xs text-gray-500">Rutinas & sets</div>
            </Link>

            <Link
              href="/dashboard/historial"
              className="bg-white p-4 rounded-xl shadow-sm border hover:shadow transition"
            >
              <div className="text-2xl mb-2">📜</div>
              <div className="font-semibold">Historial</div>
              <div className="text-xs text-gray-500">Sesiones & progreso</div>
            </Link>

            <Link
              href="/dashboard/retosmentales"
              className="bg-white p-4 rounded-xl shadow-sm border hover:shadow transition"
            >
              <div className="text-2xl mb-2">🧩</div>
              <div className="font-semibold">Retos mentales</div>
              <div className="text-xs text-gray-500">Explorar ejercicios</div>
            </Link>

            <Link
              href="/dashboard/desafios"
              className="bg-white p-4 rounded-xl shadow-sm border hover:shadow transition"
            >
              <div className="text-2xl mb-2">🏆</div>
              <div className="font-semibold">Desafíos</div>
              <div className="text-xs text-gray-500">Catálogo & mis retos</div>
            </Link>

            {recommendedId ? (
              <Link
                href={`/dashboard/retosmentales/${recommendedId}`}
                className="bg-indigo-600 text-white p-4 rounded-xl shadow hover:bg-indigo-700 transition"
              >
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold">Ejercicio recomendado</div>
                <div className="text-xs opacity-90">Ir ahora</div>
              </Link>
            ) : (
              <div className="bg-gray-100 p-4 rounded-xl text-gray-400">
                <div className="text-2xl mb-2">⏳</div>
                <div className="font-semibold">Ejercicio recomendado</div>
                <div className="text-xs">Sin ejercicios disponibles</div>
              </div>
            )}
          </div>
        </AccordionSection>

        {/* Estadísticas rápidas */}
        <AccordionSection
          id="stats"
          title="Estadísticas rápidas"
          open={openSet.has("stats")}
          onToggle={toggleSection}
          className="bg-gray-50"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard title="Racha Actual" value={data.streak} icon="🔥" description="días consecutivos" />
            <StatsCard title="Ejercicios" value={data.totalExercises} icon="🧠" description="completados" />
            <StatsCard title="Puntuación Media" value={data.averageScore} icon="⭐" description="de 100" isPercentage />
            <StatsCard title="Desafíos" value={myChallenges.length} icon="🏆" description="en curso" />
          </div>
        </AccordionSection>

        {/* Progreso semanal + recientes */}
        <AccordionSection
          id="weekly-progress"
          title="Progreso Semanal"
          open={openSet.has("weekly-progress")}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-bold mb-4">Tu Progreso Semanal</h2>
              <div className="h-80">
                <ProgressChart data={data.weeklyData} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-bold mb-4">Ejercicios Recientes</h2>
              <div className="space-y-4">
                {data.recentExercises.length > 0 ? (
                  data.recentExercises.map((exercise) => (
                    <ExerciseCard key={exercise._id} exercise={exercise} compact />
                  ))
                ) : (
                  <p className="text-gray-500">Aún no has completado ejercicios</p>
                )}
                <Link
                  href="/dashboard/retosmentales"
                  className="w-full mt-2 text-indigo-600 font-medium hover:text-indigo-800 transition-colors inline-block text-center"
                >
                  Ver todos los ejercicios →
                </Link>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* Desafíos activos (catálogo) */}
        <AccordionSection
          id="challenges"
          title="Desafíos"
          open={openSet.has("challenges")}
          onToggle={toggleSection}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Tus Desafíos Activos</h2>
              <Link
                href="/dashboard/desafios"
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Ver todos →
              </Link>
            </div>

            {data.activeChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.activeChallenges.map((challenge: Challenge) => (
                  <ChallengeItem key={challenge._id} challenge={challenge} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No tienes desafíos activos actualmente
                </p>
                <Link
                  href="/dashboard/desafios"
                  className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Explorar desafíos
                </Link>
              </div>
            )}
          </div>
        </AccordionSection>

        {/* Explorador de ejercicios */}
        <AccordionSection
          id="exercise-explorer"
          title="Explorar Ejercicios"
          open={openSet.has("exercise-explorer")}
          onToggle={toggleSection}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Explorar Ejercicios</h2>
            </div>

            <div className="mb-6">
              <SearchHeader
                searchQuery={filters.searchQuery}
                onSearchChange={(value) => handleFilterChange({ searchQuery: value })}
              />
            </div> 

            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4">
                <FilterPanel
                  categories={categories}
                  selectedCategory={filters.category}
                  selectedDifficulty={filters.difficulty}
                  sortBy={filters.sortBy}
                  onCategoryChange={(category) => handleFilterChange({ category })}
                  onDifficultyChange={(difficulty) => handleFilterChange({ difficulty })}
                  onSortChange={(sortBy) =>
                    handleFilterChange({ sortBy: sortBy as Filters["sortBy"] })
                  }
                />
              </div>

              <div className="md:w-3/4">
                {filteredExercises.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExercises.map((exercise) => (
                      <ExerciseCard key={exercise._id} exercise={exercise} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-semibold mb-2">
                      No se encontraron ejercicios
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Prueba a ajustar los filtros o limpiar la búsqueda
                    </p>
                    <button
                      onClick={() =>
                        setFilters({
                          searchQuery: "",
                          category: "",
                          difficulty: "",
                          sortBy: "recent",
                        })
                      }
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Restablecer filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* Recomendación del día */}
        <AccordionSection
          id="recommendation"
          title="Recomendación del Día"
          open={openSet.has("recommendation")}
          onToggle={toggleSection}
        >
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
            <h2 className="text-xl font-bold mb-2">Recomendación del Día</h2>
            <p className="text-gray-700 mb-4">
              Basado en tu actividad reciente, te recomendamos trabajar en ejercicios de memoria espacial.
            </p>
            {recommendedId ? (
              <Link
                href={`/dashboard/retosmentales/${recommendedId}`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
              >
                Empezar ejercicio recomendado
              </Link>
            ) : (
              <button
                disabled
                className="bg-gray-300 text-white px-4 py-2 rounded-lg cursor-not-allowed inline-block"
              >
                No hay recomendación disponible
              </button>
            )}
          </div>
        </AccordionSection>

        {/* Logros (botón extra al final, además del del navbar) */}
        <div className="flex justify-end">
          <button
            onClick={() => setOpenAch(true)}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            🏅 Ver logros
          </button>
        </div>

        <AchievementsModal
          open={openAch}
          onClose={() => setOpenAch(false)}
          autoUnlockStreak7
          streak={data.streak}
        />
      </div>

      {/* FAB de acciones rápidas */}
      <FabQuickActions />
    </div>
  );
}
