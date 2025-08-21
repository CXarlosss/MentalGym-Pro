// src/app/changelog/page.tsx
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ChangelogPage() {
  const sorted = useMemo(
    () => [...RELEASES].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    []
  );
  const latest = sorted[0];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero blanco */}
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

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Releases */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Notas de versión</h2>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="outline" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50">
                  ← Volver al dashboard
                </Button>
              </Link>
              <a href="mailto:soporte@mentalgym.pro?subject=Feedback%20Novedades">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Enviar feedback</Button>
              </a>
            </div>
          </div>

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
        </section>

        {/* Próximamente */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Próximamente</CardTitle>
              <CardDescription>Una vista previa de lo que estamos preparando.</CardDescription>
            </CardHeader>
            <CardContent>
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
        </section>

        {/* Tips / Atajos / Enlaces */}
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Trucos rápidos</CardTitle>
              <CardDescription>Sácale más partido a la app.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>
                • Usa la Paleta de Comandos con{' '}
                <span className="rounded bg-gray-100 px-1">⌘/Ctrl + K</span>.
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
      </div>
    </main>
  );
}
