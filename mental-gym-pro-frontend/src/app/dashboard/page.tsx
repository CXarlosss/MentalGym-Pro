"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

import {
  fetchUserProgress,
  fetchActiveChallenges,
  fetchRecentExercises,
  fetchExercises,
  fetchExerciseCategories,
} from "@/lib/api";
import ProgressChart from "@/components/dashboard/ProgressChart";
import ExerciseCard from "@/components/cards/ExerciseCard";
import ChallengeItem from "@/components/exercises/ChallengeItem";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import WelcomeBanner from "@/components/layout/WellcomeBanner";
import StatsCard from "@/components/cards/StatsCard";
import SearchHeader from "@/components/exercises/SearchHeader";
import FilterPanel from "@/components/exercises/FilterPanel";
import type { Exercise, Challenge, DashboardStats } from "@/types";

// ------ Tipado de datos del Dashboard ------
type DashboardData = DashboardStats & {
  recentExercises: Exercise[];
  activeChallenges: Challenge[];
};

// ------ Filtros de ejercicios (reutiliza los de ExercisesPage) ------
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

  // Explorar ejercicios (fusionado)
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    searchQuery: "",
    category: "",
    difficulty: "",
    sortBy: "recent",
  });

  // ---------- Carga inicial ----------
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [progress, challenges, recent, allExercises, cats] =
          await Promise.all([
            fetchUserProgress(),
            fetchActiveChallenges(),
            fetchRecentExercises(3),
            fetchExercises(),
            fetchExerciseCategories(),
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
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    }

    if (user) loadDashboardData();
  }, [user]);

  // ---------- Filtrado (memo) ----------
  const filteredExercises = useMemo(() => {
    let result = [...exercises];

    // búsqueda
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }

    // categoría
    if (filters.category) {
      result = result.filter((e) => e.category === filters.category);
    }

    // dificultad
    if (filters.difficulty) {
      result = result.filter((e) => e.difficulty === filters.difficulty);
    }

    // ordenamiento
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

  const handleFilterChange = (partial: Partial<Filters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!data) return <div>No hay datos disponibles</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner de bienvenida */}
      <WelcomeBanner name={user?.name || ""} streak={data.streak} />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Racha Actual"
            value={data.streak}
            icon="🔥"
            description="días consecutivos"
          />
          <StatsCard
            title="Ejercicios"
            value={data.totalExercises}
            icon="🧠"
            description="completados"
          />
          <StatsCard
            title="Puntuación Media"
            value={data.averageScore}
            icon="⭐"
            description="de 100"
            isPercentage
          />
          <StatsCard
            title="Desafíos"
            value={data.activeChallenges.length}
            icon="🏆"
            description="activos"
          />
        </div>

        {/* Progreso semanal + recientes */}
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
                  <ExerciseCard
                    key={exercise._id}
                    exercise={exercise}
                    compact
                  />
                ))
              ) : (
                <p className="text-gray-500">
                  Aún no has completado ejercicios
                </p>
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

        {/* Desafíos activos */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Tus Desafíos Activos</h2>
            <button className="text-indigo-600 hover:text-indigo-800 transition-colors">
              Ver todos →
            </button>
          </div>

          {data.activeChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.activeChallenges.map((challenge) => (
                <ChallengeItem key={challenge._id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No tienes desafíos activos actualmente
              </p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Explorar desafíos
              </button>
            </div>
          )}
        </div>

        {/* --- Explorador de ejercicios (fusionado) --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Explorar Ejercicios</h2>
          </div>

          {/* Header de búsqueda */}
          <div className="mb-6">
            <SearchHeader
              searchQuery={filters.searchQuery}
              onSearchChange={(value) =>
                handleFilterChange({ searchQuery: value })
              }
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
                onCategoryChange={(category) =>
                  handleFilterChange({ category })
                }
                onDifficultyChange={(difficulty) =>
                  handleFilterChange({ difficulty })
                }
                onSortChange={(sortBy) =>
                  handleFilterChange({ sortBy: sortBy as Filters["sortBy"] })
                }
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

        {/* Recomendación del día */}
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
          <h2 className="text-xl font-bold mb-2">Recomendación del Día</h2>
          <p className="text-gray-700 mb-4">
            Basado en tu actividad reciente, te recomendamos trabajar en
            ejercicios de memoria espacial.
          </p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Empezar ejercicio recomendado
          </button>
        </div>
      </div>
    </div>
  );
}
