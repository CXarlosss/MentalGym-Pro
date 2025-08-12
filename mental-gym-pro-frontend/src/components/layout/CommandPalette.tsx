'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const COMMANDS = [
  { k:'retos', label:'Ir a Retos mentales', href:'/dashboard/retosmentales' },
  { k:'habitos', label:'Ir a Hábitos saludables', href:'/dashboard/alimentacion' },
  { k:'actividad', label:'Ir a Actividad', href:'/dashboard/actividad' },
  { k:'gym', label:'Ir a Gym', href:'/dashboard/gym' },
  { k:'historial', label:'Ir a Historial', href:'/dashboard/historial' },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const router = useRouter()
  const results = useMemo(
    () => COMMANDS.filter(c => c.label.toLowerCase().includes(q.toLowerCase()) || c.k.includes(q.toLowerCase())),
    [q]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setOpen(v=>!v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] bg-black/40 p-4" onClick={()=>setOpen(false)}>
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-4 shadow-xl" onClick={e=>e.stopPropagation()}>
        <input
          autoFocus value={q} onChange={e=>setQ(e.target.value)}
          placeholder="Escribe para buscar…"
          className="mb-3 w-full rounded-md border px-3 py-2"
        />
        <ul className="max-h-80 overflow-auto">
          {results.length ? results.map(r=>(
            <li key={r.href}>
              <button
                onClick={()=>{ router.push(r.href); setOpen(false) }}
                className="w-full rounded-md px-3 py-2 text-left hover:bg-gray-50"
              >
                {r.label}
              </button>
            </li>
          )) : <li className="px-3 py-2 text-sm text-gray-500">Sin resultados</li>}
        </ul>
        <div className="mt-3 text-xs text-gray-500">Atajo: ⌘K / Ctrl+K</div>
      </div>
    </div>
  )
}
