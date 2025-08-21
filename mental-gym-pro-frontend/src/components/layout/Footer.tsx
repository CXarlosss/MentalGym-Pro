// src/components/layout/Footer.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Footer() {
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)

  // Inicializa tema (respeta preferencia del sistema la primera vez)
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme')
    if (saved) {
      const isDark = saved === 'dark'
      setDark(isDark)
      document.documentElement.classList.toggle('dark', isDark)
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDark(systemDark)
      document.documentElement.classList.toggle('dark', systemDark)
    }
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <footer className="border-t bg-gradient-to-r from-emerald-600 via-emerald-500 to-violet-600 dark:from-emerald-700 dark:via-emerald-600 dark:to-violet-700">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* fila principal */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Marca */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white grid place-items-center text-sm font-bold">
              MG
            </div>
            <div className="text-sm text-white/80">
              <span className="font-semibold text-white">Mental Gym Pro</span>
              <span className="mx-2">•</span>
              <span>Entrena tu mente a diario</span>
            </div>
          </div>

          {/* Mini sitemap */}
          <nav className="flex flex-wrap items-center gap-2">
            <FooterLink href="/dashboard/retosmentales">Retos</FooterLink>
            <FooterLink href="/dashboard/alimentacion">Hábitos</FooterLink>
            <FooterLink href="/dashboard/gym">Gym</FooterLink>
            <FooterLink href="/dashboard/historial">Historial</FooterLink>
            <span className="hidden h-4 w-px bg-white/30 md:block" />
            <FooterLink href="/novedades/" subtle>
              Novedades
            </FooterLink>
          </nav>

        
        </div>

        {/* fila legal */}
        <div className="mt-6 flex items-center justify-between text-xs text-white/70">
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-white">
              Términos
            </Link>
          </div>
          <div>© {new Date().getFullYear()} Mental Gym Pro</div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({
  href,
  children,
  subtle = false,
}: {
  href: string
  children: React.ReactNode
  subtle?: boolean
}) {
  return (
    <Link
      href={href}
      className={
        subtle
          ? 'rounded-full px-3 py-1.5 text-sm text-white/80 transition-colors hover:text-white'
          : 'rounded-full border border-white/40 bg-white px-3 py-1.5 text-sm text-gray-800 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100 dark:hover:bg-neutral-800'
      }
    >
      {children}
    </Link>
  )
}
