// src/app/dashboard/desafios/page.tsx
'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  CHALLENGES,
  getUid,
  joinedKey,
  completedKey,
  readSet,
  writeSet,
  emitChallengesChanged,
} from '@/lib/api/static/challenges';

import type { Challenge } from '@/types';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

type FilterState = 'all' | 'joined' | 'completed' | 'active';

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    : '—';

function daysLeft(iso?: string): number | null {
  if (!iso) return null;
  const end = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

export default function DesafiosPage() {
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterState>('all');

  const uid = typeof window !== 'undefined' ? getUid() : 'anonymous';
  const [joined, setJoined] = useState<Set<string>>(() => readSet(joinedKey(uid)));
  const [completed, setCompleted] = useState<Set<string>>(() => readSet(completedKey(uid)));

  // Si cambia el usuario en caliente, sincroniza
  useEffect(() => {
    const onChange = () => {
      const u = getUid();
      setJoined(readSet(joinedKey(u)));
      setCompleted(readSet(completedKey(u)));
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('mg:user-changed', onChange);
      return () => window.removeEventListener('mg:user-changed', onChange);
    }
  }, []);

  // Acciones
  const toggleJoin = useCallback((id: string) => {
    const k = joinedKey(getUid());
    const s = readSet(k);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    writeSet(k, s);
    setJoined(new Set(s));
    emitChallengesChanged();
  }, []);

  const toggleComplete = useCallback((id: string) => {
    const k = completedKey(getUid());
    const s = readSet(k);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    writeSet(k, s);
    setCompleted(new Set(s));
    emitChallengesChanged();
  }, []);

  // KPI
  const kpi = useMemo(() => {
    const active = CHALLENGES.length;
    const mine = CHALLENGES.filter(c => joined.has(c._id)).length;
    const done = CHALLENGES.filter(c => completed.has(c._id)).length;
    return { active, mine, done };
  }, [joined, completed]);

  // Filtrado + búsqueda (orden: por caducidad)
  const filtered = useMemo(() => {
    let arr = [...CHALLENGES];
    const q = query.trim().toLowerCase();
    if (q) {
      arr = arr.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          (c.description ?? '').toLowerCase().includes(q) ||
          (c.objective ?? '').toLowerCase().includes(q)
      );
    }
    if (filter === 'joined') arr = arr.filter(c => joined.has(c._id));
    else if (filter === 'completed') arr = arr.filter(c => completed.has(c._id));
    else if (filter === 'active') {
      arr = arr.filter(c => {
        const d = daysLeft(c.expiresAt);
        return d == null || d > 0;
      });
    }
    arr.sort((a, b) => (daysLeft(a.expiresAt) ?? 9999) - (daysLeft(b.expiresAt) ?? 9999));
    return arr;
  }, [query, filter, joined, completed]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-4 space-y-6 bg-gradient-to-br from-indigo-50 to-gray-50 min-h-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Desafíos
          </h1>
          <p className="text-gray-600">Únete a retos, se guardan en tu perfil y luego los ves en el dashboard.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center gap-1">
            <span>←</span> Volver
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Kpi title="Activos" value={String(kpi.active)} />
        <Kpi title="Mis desafíos" value={String(kpi.mine)} />
        <Kpi title="Completados" value={String(kpi.done)} />
      </div>

      {/* Controles */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Buscar y filtrar</CardTitle>
          <CardDescription>Encuentra el reto que mejor encaja contigo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título u objetivo…"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterState)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="joined">Mis desafíos</option>
              <option value="completed">Completados</option>
            </select>
            <div className="md:col-span-2 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                }}
              >
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => {
            const isJoined = joined.has(c._id);
            const isDone = completed.has(c._id);
            const dleft = daysLeft(c.expiresAt);
            return (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow bg-white">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-indigo-700">{c.title}</CardTitle>
                        <CardDescription className="mt-1">{c.description}</CardDescription>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {c.durationDays} días
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-700">
                      <b>Objetivo:</b> {c.objective || '—'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Expira: {fmtDate(c.expiresAt)}</span>
                      <span>•</span>
                      <span>
                        Quedan:{' '}
                        {dleft == null ? '—' : dleft < 0 ? 'finalizado' : `${dleft} días`}
                      </span>
                      <span>•</span>
                      <span>Participantes: {c.participants ?? 0}</span>
                    </div>

                    {c.exercises?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {c.exercises.slice(0, 4).map((ex) => (
                          <span key={ex} className="text-xs px-2 py-1 rounded border bg-gray-50">
                            {ex}
                          </span>
                        ))}
                        {c.exercises.length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{c.exercises.length - 4} más
                          </span>
                        )}
                      </div>
                    ) : null}

                    <div className="flex gap-2 pt-2">
                      {!isJoined ? (
                        <Button
                          className="bg-indigo-600 text-white hover:bg-indigo-700"
                          onClick={() => toggleJoin(c._id)}
                        >
                          Unirme
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="border-indigo-600 text-indigo-700 hover:bg-indigo-50"
                            onClick={() => toggleJoin(c._id)}
                          >
                            Abandonar
                          </Button>
                          <Button
                            variant="outline"
                            className={
                              isDone
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }
                            onClick={() => toggleComplete(c._id)}
                          >
                            {isDone ? 'Completado ✓' : 'Marcar completado'}
                          </Button>
                        </>
                      )}

                      <Link href="/dashboard/retosmentales">
                        <Button variant="outline">Ver ejercicios</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay desafíos con los filtros actuales.
        </div>
      )}
    </motion.main>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <p className="text-sm text-gray-500">{title}</p>
          <motion.p
            className="text-2xl font-semibold mt-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {value}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
