// src/app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import {
  fetchUserProgress,
  fetchActiveChallenges,
  fetchRecentExercises,
  fetchExercises,
  fetchExerciseCategories,
  // datos para anillos
  getTodayNutrition,
  getNutritionTargets,
  getWeeklyActivity,
} from "@/lib/api";

import ProgressChart from "@/components/dashboard/ProgressChart";
import ExerciseCard from "@/components/cards/ExerciseCard";
import ChallengeItem from "@/components/exercises/ChallengeItem";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import WelcomeBanner from "@/components/layout/WellcomeBanner"; // ✅ ruta/nombre corregidos
import StatsCard from "@/components/cards/StatsCard";
import SearchHeader from "@/components/exercises/SearchHeader";
import FilterPanel from "@/components/exercises/FilterPanel";

// UI extra
import FabQuickActions from "@/components/layout/FabQuickActions";
import StreakHeatmap from "@/components/dashboard/StreakHeatmap";
import GoalRing from "@/components/dashboard/GoalRing";
import AchievementsModal from "@/components/achievements/AchievementsModal";
import CommandPalette from "@/components/layout/CommandPalette";
import CollapsibleSection from '@/components/layout/CollapsibleSection'


import type {
  Exercise,
  Challenge,
  DashboardStats,
  DailyNutrition,
  NutritionTargets,
  WeeklyActivitySummary,
} from "@/types";

// ------ Tipado de datos del Dashboard ------
type DashboardData = DashboardStats & {
  recentExercises: Exercise[];
  activeChallenges: Challenge[];
};

// ------ Filtros de ejercicios ------
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

  // Extra UI state
  const [openAch, setOpenAch] = useState(false);

  // Datos para anillos
  const [today, setToday] = useState<DailyNutrition | null>(null);
  const [targets, setTargets] = useState<NutritionTargets | null>(null);
  const [weekAct, setWeekAct] = useState<WeeklyActivitySummary | null>(null);

  // ---------- Carga inicial ----------
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // Datos principales del dashboard
        const [progress, challenges, recent, allExercises, cats, wAct] =
          await Promise.all([
            fetchUserProgress(),
            fetchActiveChallenges(),
            fetchRecentExercises(3),
            fetchExercises(),
            fetchExerciseCategories(),
            getWeeklyActivity(), // async
          ]);

        setData({
          weeklyData: progress.weeklyData,
          streak: progress.streak,
          totalExercises: progress.totalExercises,
          averageScore: progress.averageScore,
          recentExercises: recent,
          activeChallenges: challenges,
        });

        setExercises(allExercises);
        setCategories(cats);
        setWeekAct(wAct);

        // Estas son síncronas (localStorage), mejor fuera del Promise.all
        setToday(getTodayNutrition());
        setTargets(getNutritionTargets());
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    }

    if (user) loadDashboardData();
  }, [user]);

  // ---------- Filtrado ----------
  const filteredExercises = useMemo(() => {
    let result = [...exercises];

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
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
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "difficulty-asc":
        result.sort(
          (a, b) =>
            difficultyToNumber(a.difficulty) - difficultyToNumber(b.difficulty)
        );
        break;
      case "difficulty-desc":
        result.sort(
          (a, b) =>
            difficultyToNumber(b.difficulty) - difficultyToNumber(a.difficulty)
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
      <CommandPalette />

      {/* Banner de bienvenida */}
      <WelcomeBanner
        name={user?.name}
        streak={data.streak}
        totalExercises={data.totalExercises}
        averageScore={data.averageScore}
        recommendedId={recommendedId}
        tip="Bebe 500 ml de agua antes de empezar 😉"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Anillos de objetivo diarios */}
        <CollapsibleSection id="goals" title="Objetivos diarios">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GoalRing label="Calorías" value={kcalToday} goal={kcalGoal} />
          <GoalRing label="Agua" value={waterToday} goal={waterGoal} unit="ml" />
          <GoalRing label="Pasos" value={stepsToday} goal={stepsGoal} />
        </div>

        </CollapsibleSection>
        {/* Heatmap de rachas / actividad semanal */}
        <CollapsibleSection id="heatmap" title="Racha (últimos 7 días)" defaultOpen={false}>
          <StreakHeatmap values={data.weeklyData} />
        </CollapsibleSection>
        {/* Lanzadera: accesos rápidos */}
        <CollapsibleSection id="quick-access" title="Accesos rápidos" defaultOpen={true} className="bg-gray-50">

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
        </CollapsibleSection>
        {/* Estadísticas rápidas */}
        <CollapsibleSection id="stats" title="Estadísticas rápidas" defaultOpen={true} className="bg-gray-50">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard title="Racha Actual" value={data.streak} icon="🔥" description="días consecutivos" />
          <StatsCard title="Ejercicios" value={data.totalExercises} icon="🧠" description="completados" />
          <StatsCard title="Puntuación Media" value={data.averageScore} icon="⭐" description="de 100" isPercentage />
          <StatsCard title="Desafíos" value={data.activeChallenges.length} icon="🏆" description="activos" />
        </div>

        </CollapsibleSection>
        {/* Progreso semanal + recientes */}
        <CollapsibleSection id="weekly-progress" title="Progreso Semanal" defaultOpen={true}>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Tu Progreso Semanal</h2>
            <div className="h-80">
              <ProgressChart data={data.weeklyData} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
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
        </CollapsibleSection>
        {/* Desafíos activos */}
        <CollapsibleSection id="quick" title="Accesos rápidos" defaultOpen={false}>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Tus Desafíos Activos</h2>
            <button className="text-indigo-600 hover:text-indigo-800 transition-colors">Ver todos →</button>
          </div>

          {data.activeChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.activeChallenges.map((challenge: Challenge) => (
                <ChallengeItem key={challenge._id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tienes desafíos activos actualmente</p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Explorar desafíos
              </button>
            </div>
          )}
        </div>
        </CollapsibleSection>
        {/* --- Explorador de ejercicios (fusionado) --- */}
        <CollapsibleSection id="exercise-explorer" title="Explorar Ejercicios" defaultOpen={true}>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Explorar Ejercicios</h2>
          </div>
          
          {/* Header de búsqueda */}
          <div className="mb-6">
            <SearchHeader
              searchQuery={filters.searchQuery}
              onSearchChange={(value) => handleFilterChange({ searchQuery: value })}
            />
          </div>
  
          <div className="flex flex-col md:flex-row gap-8">
            {/* Panel de filtros */}
            <div className="md:w-1/4">
              <FilterPanel
                categories={categories}
                selectedCategory={filters.category}
                selectedDifficulty={filters.difficulty}
                sortBy={filters.sortBy}
                onCategoryChange={(category) => handleFilterChange({ category })}
                onDifficultyChange={(difficulty) => handleFilterChange({ difficulty })}
                onSortChange={(sortBy) => handleFilterChange({ sortBy: sortBy as Filters["sortBy"] })}
              />
            </div>

            {/* Grid de ejercicios filtrados */}
            <div className="md:w-3/4">
              {filteredExercises.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExercises.map((exercise) => (
                    <ExerciseCard key={exercise._id} exercise={exercise} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-lg font-semibold mb-2">No se encontraron ejercicios</h3>
                  <p className="text-gray-500 mb-4">Prueba a ajustar los filtros o limpiar la búsqueda</p>
                  <button
                    onClick={() =>
                      setFilters({ searchQuery: "", category: "", difficulty: "", sortBy: "recent" })
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
        </CollapsibleSection>
        {/* Recomendación del día */}
         <CollapsibleSection id="recommendation" title="Recomendación del Día" defaultOpen={true}>
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
        </CollapsibleSection>
        {/* Logros */}
      
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
