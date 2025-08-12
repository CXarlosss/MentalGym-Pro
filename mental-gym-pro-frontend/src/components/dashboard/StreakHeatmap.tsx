'use client'
export default function StreakHeatmap({ values }: { values: number[] }) {
  const max = Math.max(1, ...values)
  const shades = (v:number) => {
    const t = v / max
    if (t === 0) return 'bg-gray-200'
    if (t < 0.34) return 'bg-emerald-200'
    if (t < 0.67) return 'bg-emerald-400'
    return 'bg-emerald-600'
  }
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 text-sm font-medium text-gray-700">Actividad (últimos 7 días)</div>
      <div className="grid grid-cols-7 gap-1.5">
        {values.map((v, i) => (
          <div key={i} title={`${v} pts`} className={`h-8 w-8 rounded ${shades(v)}`} />
        ))}
      </div>
    </div>
  )
}
