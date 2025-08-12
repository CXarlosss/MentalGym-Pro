'use client'
import StatsCard from '@/components/cards/StatsCard'

export default function StatsKPI({
  streak, totalExercises, averageScore, challengesCount,
}: {
  streak: number; totalExercises: number; averageScore: number; challengesCount: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard title="Racha Actual" value={streak} icon="🔥" description="días consecutivos" />
      <StatsCard title="Ejercicios" value={totalExercises} icon="🧠" description="completados" />
      <StatsCard title="Puntuación Media" value={averageScore} icon="⭐" description="de 100" isPercentage />
      <StatsCard title="Desafíos" value={challengesCount} icon="🏆" description="activos" />
    </div>
  )
}
