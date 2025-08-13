'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

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
   Componente: Sección/Accordion mejorado
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-300 ">
        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 rounded-t-lg transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <div>
            <h3 className="text-base font-semibold text-indigo-700">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <motion.div 
            animate={{ rotate: open ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0 pb-4 px-4">{children}</CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-3">
          <p className="text-sm text-gray-500">{title}</p>
          <motion.p 
            className="text-2xl font-semibold mt-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {value}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function HabitosSaludablesPage() {
  // DB / estados principales
  const [db, setDb] = useState<FoodItem[]>([])
  const [today, setToday] = useState<DailyNutrition | null>(null)
  const [targets, setTargets] = useState<NutritionTargets>(getNutritionTargets())
  const [week, setWeek] = useState<WeeklyNutritionSummary | null>(null)

  // Form "añadir comida"
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
    <div className="max-w-7xl mx-auto p-4 space-y-6  bg-gradient-to-br from-indigo-50 to-gray-50 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Hábitos saludables
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Agua, alimentación diaria, objetivos y tus insights semanales.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-1">
              <span>←</span> Volver
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Resumen de hoy */}
      <Section title="Resumen de hoy" subtitle="Calorías, macros y agua de la jornada">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { title: "Kcal (hoy)", value: String(today?.kcal ?? 0) },
            { title: "Proteína (g)", value: String(today?.protein ?? 0) },
            { title: "Carbohidratos (g)", value: String(today?.carbs ?? 0) },
            { title: "Grasa (g)", value: String(today?.fat ?? 0) },
            { title: "Agua (ml)", value: String(today?.waterMl ?? 0) },
          ].map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Kpi title={kpi.title} value={kpi.value} />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Agua */}
      <Section title="Agua" subtitle="Registra tu ingesta de agua" defaultOpen={true}>
        <div className="flex flex-wrap gap-2">
          {[250, 500, 750, 1000].map((ml) => (
            <motion.div
              key={ml}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => handleAddWater(ml)}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
              >
                +{ml} ml
              </Button>
            </motion.div>
          ))}
          <div className="text-sm text-gray-500 ml-auto self-center">
            Objetivo: {targets.waterMl} ml
          </div>
        </div>
      </Section>

      {/* Alimentación del día */}
      <Section title="Alimentación del día" subtitle="Registra alimentos y revisa tu diario">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">Tipo</label>
              <motion.select
                value={type}
                onChange={(e) => setType(e.target.value as MealType)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                whileFocus={{ scale: 1.02 }}
              >
                <option value="desayuno">Desayuno</option>
                <option value="comida">Comida</option>
                <option value="cena">Cena</option>
                <option value="snack">Snack</option>
              </motion.select>
            </div>

            <div className="md:col-span-3">
              <label className="text-sm text-gray-600">Alimento</label>
              <motion.input
                list="food-list"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
                placeholder="Ej. Avena, Manzana…"
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                whileFocus={{ scale: 1.02 }}
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
                    <motion.button
                      key={f._id}
                      className="px-2 py-1 border rounded-md hover:bg-gray-50 text-sm"
                      onClick={() => setFoodName(f.name)}
                      title="Usar este alimento"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {f.name}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">Cantidad</label>
              <motion.input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value || '0', 10))}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                whileFocus={{ scale: 1.02 }}
              />
              <p className="text-xs text-gray-500 mt-1">g o unidades según el alimento</p>
            </div>

            <div className="md:col-span-6 flex gap-2">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  onClick={handleAddMeal}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Añadir
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFoodName('')
                    setAmount(100)
                    setQuery('')
                  }}
                >
                  Limpiar
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Lista del día */}
          <div className="mt-4">
            <h3 className="font-medium mb-2 text-gray-700">Comidas de hoy</h3>
            {today && today.meals.length > 0 ? (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b bg-gray-50">
                      <th className="py-2 px-3">Hora</th>
                      <th className="px-3">Tipo</th>
                      <th className="px-3">Alimento</th>
                      <th className="px-3 text-right">Cant.</th>
                      <th className="px-3 text-right">Kcal</th>
                      <th className="px-3 text-right">P</th>
                      <th className="px-3 text-right">C</th>
                      <th className="px-3 text-right">G</th>
                    </tr>
                  </thead>
                  <tbody>
                    {today.meals
                      .slice()
                      .reverse()
                      .map((m) => (
                        <motion.tr 
                          key={m._id} 
                          className="border-b last:border-0 hover:bg-gray-50"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="py-2 px-3 text-gray-500">
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-3">{m.type}</td>
                          <td className="px-3">{m.foodName}</td>
                          <td className="px-3 text-right">{m.amount}</td>
                          <td className="px-3 text-right">{m.kcal}</td>
                          <td className="px-3 text-right">{m.protein}</td>
                          <td className="px-3 text-right">{m.carbs}</td>
                          <td className="px-3 text-right">{m.fat}</td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500 p-4 border rounded-lg bg-gray-50 text-center"
              >
                Aún no has registrado comidas hoy.
              </motion.p>
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
            <motion.div 
              key={key}
              whileHover={{ y: -3 }}
            >
              <div>
                <label className="text-sm text-gray-600">{label}</label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={targets[key]}
                  onChange={(e) =>
                    setTargets({ ...targets, [key]: parseInt(e.target.value || '0', 10) })
                  }
                />
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-3">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              onClick={handleSaveTargets}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Guardar objetivos
            </Button>
          </motion.div>
        </div>
      </Section>

      {/* Base de datos de alimentos */}
      <Section title="Base de datos de alimentos" subtitle="Busca y marca favoritos">
        <div className="space-y-4">
          <motion.input
            placeholder="Buscar alimento…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            whileFocus={{ scale: 1.02 }}
          />
          <div className="overflow-x-auto max-h-[360px] border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="py-2 px-3">Alimento</th>
                  <th className="px-3">Unidad</th>
                  <th className="px-3 text-right">Kcal</th>
                  <th className="px-3 text-right">Prot</th>
                  <th className="px-3 text-right">Carb</th>
                  <th className="px-3 text-right">Grasa</th>
                  <th className="px-3 text-center">Fav</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((f) => (
                  <motion.tr 
                    key={f._id} 
                    className="border-b last:border-0 hover:bg-gray-50"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="py-2 px-3">{f.name}</td>
                    <td className="px-3">{f.unit || '100g'}</td>
                    <td className="px-3 text-right">{f.kcal}</td>
                    <td className="px-3 text-right">{f.protein}</td>
                    <td className="px-3 text-right">{f.carbs}</td>
                    <td className="px-3 text-right">{f.fat}</td>
                    <td className="px-3 text-center">
                      <motion.button
                        aria-label="toggle favorite"
                        className={`px-2 py-1 rounded-md border ${
                          favs.includes(f.name) ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleToggleFav(f.name)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {favs.includes(f.name) ? '★' : '☆'}
                      </motion.button>
                    </td>
                  </motion.tr>
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
            <label className="text-sm text-gray-600">Nombre</label>
            <motion.input
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={newFood.name}
              onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
              whileFocus={{ scale: 1.02 }}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Unidad</label>
            <motion.select
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={newFood.unit}
              onChange={(e) => setNewFood({ ...newFood, unit: e.target.value as '100g' | 'unidad' })}
              whileFocus={{ scale: 1.02 }}
            >
              <option value="100g">100g</option>
              <option value="unidad">Unidad</option>
            </motion.select>
          </div>
          {(
            [
              ['kcal', 'Kcal'],
              ['protein', 'Prot (g)'],
              ['carbs', 'Carb (g)'],
              ['fat', 'Grasa (g)'],
            ] as const
          ).map(([key, label]) => (
            <motion.div 
              key={key}
              whileHover={{ y: -3 }}
            >
              <div>
                <label className="text-sm text-gray-600">{label}</label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={newFood[key]}
                  onChange={(e) => setNewFood({ ...newFood, [key]: parseFloat(e.target.value || '0') })}
                />
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-3">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              onClick={handleAddCustomFood}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Guardar alimento
            </Button>
          </motion.div>
        </div>
      </Section>

      {/* Pasos diarios */}
      <Section title="Pasos diarios" subtitle="Consulta y registra tu actividad">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-600">
            Gestiona tus pasos y actividad semanal desde la sección de Actividad.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/dashboard/actividad">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Ir a Actividad
              </Button>
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* Insights */}
      <Section title="Insights" subtitle="Resumen de los últimos 7 días" defaultOpen={false}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {[
            { title: "Kcal medias", value: String(week?.avg.kcal ?? 0) },
            { title: "Prot medias (g)", value: String(week?.avg.protein ?? 0) },
            { title: "Carb medias (g)", value: String(week?.avg.carbs ?? 0) },
            { title: "Grasa media (g)", value: String(week?.avg.fat ?? 0) },
            { title: "Agua media (ml)", value: String(week?.avg.waterMl ?? 0) },
          ].map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Kpi title={kpi.title} value={kpi.value} />
            </motion.div>
          ))}
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                <th className="py-2 px-3">Fecha</th>
                <th className="px-3 text-right">Kcal</th>
                <th className="px-3 text-right">Prot</th>
                <th className="px-3 text-right">Carb</th>
                <th className="px-3 text-right">Grasa</th>
                <th className="px-3 text-right">Agua (ml)</th>
              </tr>
            </thead>
            <tbody>
              {week?.days.map((d) => (
                <motion.tr 
                  key={d.date} 
                  className="border-b last:border-0 hover:bg-gray-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="py-2 px-3">{d.date}</td>
                  <td className="px-3 text-right">{d.kcal}</td>
                  <td className="px-3 text-right">{d.protein}</td>
                  <td className="px-3 text-right">{d.carbs}</td>
                  <td className="px-3 text-right">{d.fat}</td>
                  <td className="px-3 text-right">{d.waterMl}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}