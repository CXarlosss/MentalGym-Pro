'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import {
  seedFoodDbOnce,
  getFoodDb,
  addFoodToDb,
  getNutritionTargets,
  setNutritionTargets,
  getTodayNutrition,
  addMealToday,
  addWaterToday,
  getWeekNutrition,
  getFavoritesFoods,
  toggleFavoriteFood,
} from '@/lib/api'

import type {
  DailyNutrition,
  FoodItem,
  MealType,
  NutritionTargets,
  WeeklyNutritionSummary,
} from '@/types'

/* ==========
   Utilidad: Sección/Accordion simple
   ========== */
function Section({
  title,
  subtitle,
  defaultOpen = true,
  children,
}: {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {subtitle ? <p className="text-xs text-gray-500">{subtitle}</p> : null}
        </div>
        <div className="text-xl leading-none">{open ? '−' : '+'}</div>
      </button>
      {open && <CardContent className="pt-0 pb-4 px-4">{children}</CardContent>}
    </Card>
  )
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  )
}

export default function HabitosSaludablesPage() {
  // DB / estados principales
  const [db, setDb] = useState<FoodItem[]>([])
  const [today, setToday] = useState<DailyNutrition | null>(null)
  const [targets, setTargets] = useState<NutritionTargets>(getNutritionTargets())
  const [week, setWeek] = useState<WeeklyNutritionSummary | null>(null)

  // Form “añadir comida”
  const [query, setQuery] = useState('')
  const [type, setType] = useState<MealType>('desayuno')
  const [amount, setAmount] = useState<number>(100)
  const [foodName, setFoodName] = useState('')
  const [favs, setFavs] = useState<string[]>(getFavoritesFoods())

  // Crear alimento rápido
  const [newFood, setNewFood] = useState<Omit<FoodItem, '_id'>>({
    name: '',
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    unit: '100g',
    tags: [],
  })

  // Init demo + cargar estados
  useEffect(() => {
    seedFoodDbOnce()
    setDb(getFoodDb())
    setToday(getTodayNutrition())
    setWeek(getWeekNutrition())
  }, [])

  // Sugerencias
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = db.slice().sort((a, b) => a.name.localeCompare(b.name))
    if (!q) return base
    return base.filter((f) => f.name.toLowerCase().includes(q))
  }, [db, query])

  const favSuggestions = useMemo(() => {
    if (!favs.length) return [] as FoodItem[]
    const set = new Set(favs.map((n) => n.toLowerCase()))
    return db.filter((f) => set.has(f.name.toLowerCase()))
  }, [db, favs])

  // Handlers
  async function handleAddMeal() {
    if (!foodName.trim()) return
    try {
      addMealToday({ type, foodName: foodName.trim(), amount: Math.max(0, amount) })
      setToday(getTodayNutrition())
      setWeek(getWeekNutrition())
      setFoodName('')
      setAmount(100)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'No se pudo añadir la comida')
    }
  }

  function handleAddWater(ml: number) {
    addWaterToday(ml)
    setToday(getTodayNutrition())
  }

  function handleToggleFav(name: string) {
    const list = toggleFavoriteFood(name)
    setFavs(list)
  }

  function handleSaveTargets() {
    setNutritionTargets(targets)
    setTargets(getNutritionTargets())
    alert('Objetivos guardados')
  }

  function handleAddCustomFood() {
    if (!newFood.name.trim()) return
    addFoodToDb(newFood)
    setDb(getFoodDb())
    setNewFood({ name: '', kcal: 0, protein: 0, carbs: 0, fat: 0, unit: '100g', tags: [] })
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hábitos saludables</h1>
          <p className="text-sm text-gray-500">
            Agua, alimentación diaria, objetivos y tus insights semanales.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Volver</Button>
        </Link>
      </div>

      {/* Resumen de hoy */}
      <Section title="Resumen de hoy" subtitle="Calorías, macros y agua de la jornada">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Kpi title="Kcal (hoy)" value={String(today?.kcal ?? 0)} />
          <Kpi title="Proteína (g)" value={String(today?.protein ?? 0)} />
          <Kpi title="Carbohidratos (g)" value={String(today?.carbs ?? 0)} />
          <Kpi title="Grasa (g)" value={String(today?.fat ?? 0)} />
          <Kpi title="Agua (ml)" value={String(today?.waterMl ?? 0)} />
        </div>
      </Section>

      {/* Agua */}
      <Section title="Agua" subtitle="Registra tu ingesta de agua" defaultOpen={true}>
        <div className="flex flex-wrap gap-2">
          {[250, 500, 750, 1000].map((ml) => (
            <Button key={ml} onClick={() => handleAddWater(ml)}>
              +{ml} ml
            </Button>
          ))}
          <div className="text-sm text-gray-500 ml-auto self-center">
            Objetivo: {targets.waterMl} ml
          </div>
        </div>
      </Section>

      {/* Alimentación del día (añadir comida + lista) */}
      <Section title="Alimentación del día" subtitle="Registra alimentos y revisa tu diario">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-sm">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MealType)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="desayuno">Desayuno</option>
                <option value="comida">Comida</option>
                <option value="cena">Cena</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="text-sm">Alimento</label>
              <input
                list="food-list"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
                placeholder="Ej. Avena, Manzana…"
                className="w-full border rounded-md px-3 py-2"
              />
              <datalist id="food-list">
                {suggestions.slice(0, 30).map((f) => (
                  <option key={f._id} value={f.name} />
                ))}
              </datalist>

              {favSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 text-sm">
                  <span className="text-gray-500">Favoritos:</span>
                  {favSuggestions.map((f) => (
                    <button
                      key={f._id}
                      className="px-2 py-1 border rounded-md hover:bg-gray-50"
                      onClick={() => setFoodName(f.name)}
                      title="Usar este alimento"
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm">Cantidad</label>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value || '0', 10))}
                className="w-full border rounded-md px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">g o unidades según el alimento</p>
            </div>

            <div className="md:col-span-6 flex gap-2">
              <Button onClick={handleAddMeal}>Añadir</Button>
              <Button
                type="button"
                onClick={() => {
                  setFoodName('')
                  setAmount(100)
                  setQuery('')
                }}
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Lista del día */}
          <div className="mt-4">
            <h3 className="font-medium mb-2">Comidas de hoy</h3>
            {today && today.meals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Hora</th>
                      <th>Tipo</th>
                      <th>Alimento</th>
                      <th className="text-right">Cant.</th>
                      <th className="text-right">Kcal</th>
                      <th className="text-right">P</th>
                      <th className="text-right">C</th>
                      <th className="text-right">G</th>
                    </tr>
                  </thead>
                  <tbody>
                    {today.meals
                      .slice()
                      .reverse()
                      .map((m) => (
                        <tr key={m._id} className="border-b last:border-0">
                          <td className="py-2 text-gray-500">
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td>{m.type}</td>
                          <td>{m.foodName}</td>
                          <td className="text-right">{m.amount}</td>
                          <td className="text-right">{m.kcal}</td>
                          <td className="text-right">{m.protein}</td>
                          <td className="text-right">{m.carbs}</td>
                          <td className="text-right">{m.fat}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aún no has registrado comidas hoy.</p>
            )}
          </div>
        </div>
      </Section>

      {/* Objetivos diarios */}
      <Section title="Objetivos diarios" subtitle="Personaliza tus metas">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(
            [
              ['kcal', 'Kcal'],
              ['protein', 'Proteína (g)'],
              ['carbs', 'Carbohidratos (g)'],
              ['fat', 'Grasa (g)'],
              ['waterMl', 'Agua (ml)'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-sm">{label}</label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2"
                value={targets[key]}
                onChange={(e) =>
                  setTargets({ ...targets, [key]: parseInt(e.target.value || '0', 10) })
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Button onClick={handleSaveTargets}>Guardar objetivos</Button>
        </div>
      </Section>

      {/* Base de datos de alimentos */}
      <Section title="Base de datos de alimentos" subtitle="Busca y marca favoritos">
        <div className="space-y-4">
          <input
            placeholder="Buscar alimento…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
          <div className="overflow-x-auto max-h-[360px] border rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Alimento</th>
                  <th>Unidad</th>
                  <th className="text-right">Kcal</th>
                  <th className="text-right">Prot</th>
                  <th className="text-right">Carb</th>
                  <th className="text-right">Grasa</th>
                  <th className="text-center">Fav</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((f) => (
                  <tr key={f._id} className="border-b last:border-0">
                    <td className="py-2">{f.name}</td>
                    <td>{f.unit || '100g'}</td>
                    <td className="text-right">{f.kcal}</td>
                    <td className="text-right">{f.protein}</td>
                    <td className="text-right">{f.carbs}</td>
                    <td className="text-right">{f.fat}</td>
                    <td className="text-center">
                      <button
                        aria-label="toggle favorite"
                        className={`px-2 py-1 rounded-md border ${
                          favs.includes(f.name) ? 'bg-yellow-100' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleToggleFav(f.name)}
                      >
                        {favs.includes(f.name) ? '★' : '☆'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Agregar alimento personalizado */}
      <Section title="Agregar alimento personalizado" subtitle="Define valores por 100g o por unidad">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-sm">Nombre</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={newFood.name}
              onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm">Unidad</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={newFood.unit}
              onChange={(e) => setNewFood({ ...newFood, unit: e.target.value as '100g' | 'unidad' })}
            >
              <option value="100g">100g</option>
              <option value="unidad">Unidad</option>
            </select>
          </div>
          {(
            [
              ['kcal', 'Kcal'],
              ['protein', 'Prot (g)'],
              ['carbs', 'Carb (g)'],
              ['fat', 'Grasa (g)'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-sm">{label}</label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2"
                value={newFood[key]}
                onChange={(e) => setNewFood({ ...newFood, [key]: parseFloat(e.target.value || '0') })}
              />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Button onClick={handleAddCustomFood}>Guardar alimento</Button>
        </div>
      </Section>

      {/* Pasos diarios (enlace rápido) */}
      <Section title="Pasos diarios" subtitle="Consulta y registra tu actividad">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-600">
            Gestiona tus pasos y actividad semanal desde la sección de Actividad.
          </p>
          <Link href="/dashboard/actividad">
            <Button>Ir a Actividad</Button>
          </Link>
        </div>
      </Section>

      {/* Insights */}
      <Section title="Insights" subtitle="Resumen de los últimos 7 días" defaultOpen={false}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <Kpi title="Kcal medias" value={String(week?.avg.kcal ?? 0)} />
          <Kpi title="Prot medias (g)" value={String(week?.avg.protein ?? 0)} />
          <Kpi title="Carb medias (g)" value={String(week?.avg.carbs ?? 0)} />
          <Kpi title="Grasa media (g)" value={String(week?.avg.fat ?? 0)} />
          <Kpi title="Agua media (ml)" value={String(week?.avg.waterMl ?? 0)} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Fecha</th>
                <th className="text-right">Kcal</th>
                <th className="text-right">Prot</th>
                <th className="text-right">Carb</th>
                <th className="text-right">Grasa</th>
                <th className="text-right">Agua (ml)</th>
              </tr>
            </thead>
            <tbody>
              {week?.days.map((d) => (
                <tr key={d.date} className="border-b last:border-0">
                  <td className="py-2">{d.date}</td>
                  <td className="text-right">{d.kcal}</td>
                  <td className="text-right">{d.protein}</td>
                  <td className="text-right">{d.carbs}</td>
                  <td className="text-right">{d.fat}</td>
                  <td className="text-right">{d.waterMl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Nota: si luego quieres dividirlo: /dashboard/alimentacion/insight/page.tsx */}
      </Section>
    </div>
  )
}
