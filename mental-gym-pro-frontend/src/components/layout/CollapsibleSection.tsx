// src/components/layout/CollapsibleSection.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/solid'

type Props = {
  id: string                      // clave única para guardar estado
  title: string | React.ReactNode // título a la izquierda
  children: React.ReactNode       // contenido de la sección
  defaultOpen?: boolean           // abierto por defecto (true)
  actions?: React.ReactNode       // botones a la derecha del header (opcional)
  className?: string              // estilos extra del wrapper (opcional)
}

export default function CollapsibleSection({
  id,
  title,
  children,
  defaultOpen = true,
  actions,
  className,
}: Props) {
  const storageKey = `section:${id}:open`
  const [open, setOpen] = useState(defaultOpen)

  // lee estado guardado
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved !== null) setOpen(saved === '1')
  }, [storageKey])

  // persiste estado
  useEffect(() => {
    localStorage.setItem(storageKey, open ? '1' : '0')
  }, [open, storageKey])

  return (
    <section className={className ?? 'bg-white rounded-xl shadow-sm border'}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-4"
      >
        <div className="text-left">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {actions}
          <ChevronDownIcon
            className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 md:p-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
