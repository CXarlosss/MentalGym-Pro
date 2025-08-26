// src/app/changelog/page.tsx
'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

type Release = {
  version: string;
  date: string; // ISO
  tags?: string[];
  highlights?: string[];
  fixes?: string[];
  breaking?: boolean;
};

const RELEASES: Release[] = [
  {
    version: 'v0.4.0',
    date: '2025-08-16T00:00:00Z',
    tags: ['Dashboard', 'Historial', 'Accesibilidad'],
    highlights: [
      'Historial conectado a tus sesiones reales (filtros + paginación).',
      'Normalización de puntuación 0–100 y badges por color.',
      'Objetivos diarios: calorías, agua y pasos con anillos.',
    ],
    fixes: [
      'Corregido error “linear not registered scale” en el progreso semanal.',
      'Ajustes de contraste y soporte de tema oscuro en varias vistas.',
    ],
  },
  {
    version: 'v0.3.2',
    date: '2025-08-10T00:00:00Z',
    tags: ['Retos', 'UI'],
    highlights: [
      'Tarjetas de ejercicios recientes en el dashboard.',
      'Secciones colapsables para reducir el ruido visual.',
    ],
    fixes: ['Iconos y espaciados en grid de accesos rápidos.'],
  },
  {
    version: 'v0.3.0',
    date: '2025-08-01T00:00:00Z',
    tags: ['Núcleo'],
    highlights: [
      'Paleta de comandos (⌘/Ctrl+K) para ir más rápido.',
      'Base de Nutrition (hoy + metas) y actividad semanal.',
    ],
    breaking: false,
  },
];

const UPCOMING: { title: string; desc: string; eta?: string }[] = [
  { title: 'Retos cooperativos', desc: 'Participa con amigos y comparad progreso en tiempo real.', eta: 'Q4' },
  { title: 'Exportación de datos', desc: 'Descarga tu historial en CSV para análisis personalizados.' },
  { title: 'Widgets móviles', desc: 'Accesos rápidos a objetivos diarios desde tu home.' },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ---------- Accordion controlado ----------
type SectionId = 'releases' | 'upcoming' | 'extras';

function AccordionSection({
  id,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: (id: SectionId) => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      id={id}
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardHeader
          role="button"
          onClick={() => onToggle(id)}
          className="cursor-pointer select-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-indigo-700">{title}</CardTitle>
              {subtitle && <CardDescription>{subtitle}</CardDescription>}
            </div>
            <span
              className={[
                'text-xl text-gray-500 transition-transform',
                open ? 'rotate-180' : 'rotate-0',
              ].join(' ')}
            >
              ▾
            </span>
          </div>
        </CardHeader>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key={`${id}-content`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0">{children}</CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default function ChangelogPage() {
  const sorted = useMemo(
    () => [...RELEASES].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    []
  );
  const latest = sorted[0];

  // NAV/Accordion (múltiples abiertos; todos cerrados por defecto)
  const [openSet, setOpenSet] = useState<Set<SectionId>>(new Set());
  const scrollToId = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  const toggleSection = useCallback(
    (id: SectionId) => {
      setOpenSet(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      setTimeout(() => scrollToId(id), 60);
    },
    [scrollToId]
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-50">
      {/* Hero */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-10 text-gray-900">
          <h1 className="text-3xl md:text-4xl font-bold">Novedades</h1>
          <p className="mt-2 text-gray-600">
            Lo último que hemos lanzado, lo que estamos mejorando y lo que viene en camino.
          </p>
          {latest && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
              <span className="font-medium">Última versión:</span>
              <span className="font-semibold">{latest.version}</span>
              <span className="opacity-80">({formatDate(latest.date)})</span>
            </div>
          )}
        </div>
      </section>

      {/* NAVBAR STICKY */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-2 backdrop-blur bg-white/60 border-b">
        <div className="mx-auto max-w-6xl flex items-center gap-2 overflow-auto no-scrollbar">
          {[
            { id: 'releases', label: 'Notas de versión', emoji: '📝' },
            { id: 'upcoming', label: 'Próximamente', emoji: '🔮' },
            { id: 'extras', label: 'Tips & enlaces', emoji: '🧭' },
          ].map((s) => {
            const isOpen = openSet.has(s.id as SectionId);
            return (
              <button
                key={s.id}
                onClick={() => toggleSection(s.id as SectionId)}
                className={[
                  'px-3 py-1.5 rounded-full text-sm border transition',
                  isOpen
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
                ].join(' ')}
              >
                <span className="mr-1">{s.emoji}</span>
                {s.label}
              </button>
            );
          })}
          <div className="ml-auto flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50">
                ← Volver
              </Button>
            </Link>
            <a href="mailto:soporte@mentalgym.pro?subject=Feedback%20Novedades">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Enviar feedback</Button>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Releases */}
        <AccordionSection
          id="releases"
          title="Notas de versión"
          subtitle="Todas las publicaciones, ordenadas por fecha"
          open={openSet.has('releases')}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 gap-4">
            {sorted.map((r) => (
              <Card key={r.version} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{r.version}</CardTitle>
                      <span className="text-xs rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                        {formatDate(r.date)}
                      </span>
                      {r.breaking && (
                        <span className="text-xs rounded-full bg-red-100 px-2 py-0.5 text-red-700">breaking</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.tags?.map((t) => (
                        <span key={t} className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <CardDescription className="mt-1">
                    {r.highlights?.[0] ? r.highlights[0] : 'Mejoras y correcciones.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {!!r.highlights?.length && (
                    <div>
                      <h3 className="mb-1 font-semibold">✨ Highlights</h3>
                      <ul className="list-disc pl-5 text-sm text-gray-700">
                        {r.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!!r.fixes?.length && (
                    <div>
                      <h3 className="mb-1 font-semibold">🔧 Fixes</h3>
                      <ul className="list-disc pl-5 text-sm text-gray-700">
                        {r.fixes.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </AccordionSection>

        {/* Próximamente */}
        <AccordionSection
          id="upcoming"
          title="Próximamente"
          subtitle="Una vista previa de lo que estamos preparando"
          open={openSet.has('upcoming')}
          onToggle={toggleSection}
        >
          <Card>
            <CardContent className="pt-6">
              <ul className="grid gap-3 md:grid-cols-2">
                {UPCOMING.map((u) => (
                  <li key={u.title} className="rounded-lg border bg-white p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{u.title}</h4>
                      {u.eta && (
                        <span className="text-xs rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700">
                          ETA {u.eta}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{u.desc}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </AccordionSection>

        {/* Tips / Atajos / Enlaces */}
        <AccordionSection
          id="extras"
          title="Tips, atajos y enlaces"
          subtitle="Sácale más partido a la app"
          open={openSet.has('extras')}
          onToggle={toggleSection}
        >
          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Trucos rápidos</CardTitle>
                <CardDescription>Sácale más partido a la app.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>
                  • Usa la Paleta de Comandos con <span className="rounded bg-gray-100 px-1">⌘/Ctrl + K</span>.
                </p>
                <p>• Fija tus ejercicios favoritos para encontrarlos al instante.</p>
                <p>• Activa el tema oscuro desde el footer (lo recordamos por dispositivo).</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atajos</CardTitle>
                <CardDescription>Navega más rápido.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>
                  <span className="rounded bg-gray-100 px-1">⌘/Ctrl + K</span> — Paleta de Comandos
                </p>
                <p>
                  <span className="rounded bg-gray-100 px-1">G</span> luego{' '}
                  <span className="rounded bg-gray-100 px-1">H</span> — Ir al Historial
                </p>
                <p>
                  <span className="rounded bg-gray-100 px-1">G</span> luego{' '}
                  <span className="rounded bg-gray-100 px-1">R</span> — Ir a Retos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enlaces útiles</CardTitle>
                <CardDescription>Documentación y políticas.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="space-y-2">
                  <li>
                    <Link href="/dashboard/retosmentales" className="text-emerald-700 hover:underline">
                      Explorar Retos
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/historial" className="text-emerald-700 hover:underline">
                      Ver Historial
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-emerald-700 hover:underline">
                      Política de Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-emerald-700 hover:underline">
                      Términos de Servicio
                    </Link>
                  </li>
                </ul>
                <div className="mt-4">
                  <a href="mailto:soporte@mentalgym.pro?subject=Feedback%20Novedades">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">¿Tienes una sugerencia?</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>
        </AccordionSection>
      </div>
    </main>
  );
}
