'use client'
type Props = { label:string; value:number; goal:number; unit?:string }
export default function GoalRing({ label, value, goal, unit='' }: Props) {
  const pct = Math.min(100, Math.round((value / Math.max(1, goal)) * 100))
  const r = 38, c = 2*Math.PI*r, off = c - (c * pct) / 100
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white p-3">
      <svg viewBox="0 0 100 100" className="h-16 w-16">
        <circle cx="50" cy="50" r={r} strokeWidth="10" className="fill-none stroke-gray-200"/>
        <circle cx="50" cy="50" r={r} strokeWidth="10"
          className="fill-none stroke-[url(#grad)]"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#4f46e5"/>
          </linearGradient>
        </defs>
      </svg>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-lg font-semibold">{value}{unit} <span className="text-gray-400">/ {goal}{unit}</span></div>
        <div className="text-xs text-gray-500">{pct}%</div>
      </div>
    </div>
  )
}
