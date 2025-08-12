// src/components/ui/FabQuickActions.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

type Action = {
  label: string
  emoji: string
  href?: string
  onClick?: () => void
}

export default function FabQuickActions() {
  const [open, setOpen] = useState(false)

  const actions: Action[] = [
    { label: 'Añadir agua', emoji: '💧', href: '/dashboard/alimentacion#agua' },
    { label: 'Añadir comida', emoji: '🍎', href: '/dashboard/alimentacion#comida' },
    { label: 'Registrar pasos', emoji: '👣', href: '/dashboard/actividad#hoy' },
    { label: 'Nueva nota', emoji: '📝', href: '/dashboard/historial#nota' },
  ]

  return (
    <>
      {/* Fondo clicable cuando está abierto */}
      {open && (
        <button
          aria-label="Cerrar acciones rápidas"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[39] bg-black/10 backdrop-blur-[1px]"
        />
      )}

      <div className="fixed bottom-6 right-6 z-[40] flex flex-col items-end gap-3">
        {/* Panel de acciones */}
        {open && (
          <div className="w-64 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
            {actions.map((a) => (
              <ActionItem key={a.label} {...a} />
            ))}
          </div>
        )}

        {/* Botón flotante */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Acciones rápidas"
          className="grid h-14 w-14 place-items-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        >
          {open ? '×' : '+'}
        </button>
      </div>
    </>
  )
}

function ActionItem({ label, emoji, href, onClick }: Action) {
  const cls =
    'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-gray-50 transition-colors'

  if (href) {
    // ✅ Uso moderno: Link con className directamente, sin <a> y sin legacyBehavior
    return (
      <Link href={href} className={cls}>
        <span className="text-base">{emoji}</span>
        <span className="text-gray-800">{label}</span>
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      <span className="text-base">{emoji}</span>
      <span className="text-gray-800">{label}</span>
    </button>
  )
}
