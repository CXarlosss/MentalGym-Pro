'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
} from '@/lib/api/nutrition/nutrition'

import type {
  DailyNutrition,
  FoodItem,
  MealType,
  NutritionTargets,
  WeeklyNutritionSummary,
} from '@/types'

type SectionId = 'resumen' | 'agua' | 'diario' | 'objetivos' | 'db' | 'custom' | 'insights'

/* ========== Accordion controlado (multi-open) ========== */
function AccordionSection({
  id,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  id: SectionId
  title: string
  subtitle?: string
  open: boolean
  onToggle: (id: SectionId) => void
  children: React.ReactNode
}) {
  return (
    <motion.div
      id={id}
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardHeader role="button" onClick={() => onToggle(id)} className="cursor-pointer select-none">
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
  )
}

function Kpi({ title, value }: { title: string; value: string | number }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-3">
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
  )
}

export default function HabitosSaludablesPage() {
  const [db, setDb] = useState<FoodItem[]>([])
  const [today, setToday] = useState<DailyNutrition | null>(null)
  const [targets, setTargets] = useState<NutritionTargets | null>(null)
  const [week, setWeek] = useState<WeeklyNutritionSummary | null>(null)
  const [favs, setFavs] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [type, setType] = useState<MealType>('desayuno')
  const [amount, setAmount] = useState<number>(100)
  const [foodName, setFoodName] = useState('')

  const [newFood, setNewFood] = useState<Omit<FoodItem, '_id'>>({
    name: '',
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    unit: '100g',
    tags: [],
  })

  // ---- NAV/Accordion: multi-open (todo cerrado por defecto) ----
  const [openSet, setOpenSet] = useState<Set<SectionId>>(new Set())

  const scrollToId = useCallback((id: SectionId) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const toggleSection = useCallback((id: SectionId) => {
    setOpenSet(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setTimeout(() => scrollToId(id), 60)
  }, [scrollToId])

  // Secciones visibles (oculta Objetivos si no hay targets; Insights si no hay week)
  const sections = useMemo(
    () =>
      ([
        { id: 'resumen', label: 'Resumen', emoji: '📊' },
        { id: 'agua', label: 'Agua', emoji: '💧' },
        { id: 'diario', label: 'Alimentación', emoji: '🍽️' },
        targets ? { id: 'objetivos', label: 'Objetivos', emoji: '🎯' } : null,
        { id: 'db', label: 'Base de datos', emoji: '📚' },
        { id: 'custom', label: 'Personalizado', emoji: '➕' },
        week ? { id: 'insights', label: 'Insights', emoji: '🔎' } : null,
      ].filter(Boolean) as Array<{ id: SectionId; label: string; emoji: string }>),
    [targets, week]
  )

  // ---- carga inicial ----
  useEffect(() => {
    const fetchData = async () => {
      try {
        seedFoodDbOnce()
        const [foodDb, todayData, weekData, favsData, targetsData] = await Promise.all([
          getFoodDb(),
          getTodayNutrition(),
          getWeekNutrition(),
          getFavoritesFoods(),
          getNutritionTargets(),
        ])
        setDb(foodDb)
        setToday(todayData)
        setWeek(weekData)
        setFavs(favsData)
        setTargets(targetsData)
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Refrescar datos
  const refreshData = useCallback(async () => {
    setToday(await getTodayNutrition())
    setWeek(await getWeekNutrition())
    setDb(await getFoodDb())
  }, [])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = db.slice().sort((a, b) => a.name.localeCompare(b.name))
    if (!q) return base
    return base.filter(f => f.name.toLowerCase().includes(q))
  }, [db, query])

  const favSuggestions = useMemo(() => {
    if (!favs) return []
    const favNamesSet = new Set(favs.map(n => n.toLowerCase()))
    return db.filter(f => favNamesSet.has(f.name.toLowerCase()))
  }, [db, favs])

  async function handleAddMeal() {
    if (!foodName.trim() || amount <= 0) {
      alert('Por favor, ingresa un alimento y una cantidad válida.')
      return
    }
    try {
      await addMealToday({ type, foodName: foodName.trim(), amount })
      await refreshData()
      setFoodName('')
      setAmount(100)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo añadir la comida')
    }
  }

  async function handleAddWater(ml: number) {
    await addWaterToday(ml)
    await refreshData()
  }

  function handleToggleFav(name: string) {
    const list = toggleFavoriteFood(name)
    setFavs(list)
  }

  async function handleSaveTargets() {
    if (!targets) return
    try {
      await setNutritionTargets(targets)
      alert('Objetivos guardados')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudieron guardar los objetivos')
    }
  }

  async function handleAddCustomFood() {
    if (!newFood.name.trim() || newFood.kcal < 0 || newFood.protein < 0 || newFood.carbs < 0 || newFood.fat < 0) {
      alert('Por favor, revisa los datos del nuevo alimento.')
      return
    }
    try {
      await addFoodToDb(newFood)
      await refreshData()
      setNewFood({ name: '', kcal: 0, protein: 0, carbs: 0, fat: 0, unit: '100g', tags: [] })
      alert('Alimento agregado con éxito.')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo añadir el alimento')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 bg-gradient-to-br from-indigo-50 to-gray-50 min-h-screen">
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
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-1">
              <span>←</span> Volver
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* NAVBAR STICKY con todos los apartados */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-2 backdrop-blur bg-white/60 border-b">
        <div className="flex items-center gap-2 overflow-auto no-scrollbar">
          {sections.map(s => {
            const isOpen = openSet.has(s.id)
            return (
              <button
                key={s.id}
                onClick={() => toggleSection(s.id)}
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
            )
          })}
        </div>
      </div>

      {/* Resumen de hoy */}
      <AccordionSection
        id="resumen"
        title="Resumen de hoy"
        subtitle="Calorías, macros y agua de la jornada"
        open={openSet.has('resumen')}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { title: 'Kcal (hoy)', value: today?.kcal ?? 0 },
            { title: 'Proteína (g)', value: today?.protein ?? 0 },
            { title: 'Carbohidratos (g)', value: today?.carbs ?? 0 },
            { title: 'Grasa (g)', value: today?.fat ?? 0 },
            { title: 'Agua (ml)', value: today?.waterMl ?? 0 },
          ].map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.06 * index }}
            >
              <Kpi title={kpi.title} value={kpi.value} />
            </motion.div>
          ))}
        </div>
      </AccordionSection>

      {/* Agua */}
      <AccordionSection
        id="agua"
        title="Agua"
        subtitle="Registra tu ingesta de agua"
        open={openSet.has('agua')}
        onToggle={toggleSection}
      >
        {(() => {
          const waterToday = today?.waterMl ?? 0
          const goalDisplay = (targets?.waterMl && targets.waterMl > 0) ? targets.waterMl : 2000
          const pct = Math.min(100, Math.round((waterToday / Math.max(goalDisplay, 1)) * 100))
          const remaining = Math.max(goalDisplay - waterToday, 0)

          return (
            <div className="space-y-3">
              {/* Resumen actual */}
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <div className="text-xs text-gray-500">Llevas hoy</div>
                  <div className="text-2xl font-semibold">{waterToday} ml</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Objetivo</div>
                  <div className="text-lg font-medium">{goalDisplay} ml</div>
                </div>
                <div className="ml-auto text-sm text-gray-600">
                  {pct}% del objetivo • Te faltan <b>{remaining} ml</b>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-blue-100 rounded-full h-2.5" aria-label="Progreso de agua">
                <div
                  className="h-2.5 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Botones rápidos */}
              <div className="flex flex-wrap gap-2 items-center">
                {[250, 500, 750, 1000].map(ml => (
                  <motion.div key={ml} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleAddWater(ml)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                    >
                      +{ml} ml
                    </Button>
                  </motion.div>
                ))}
                <div className="text-sm text-gray-500 ml-auto">
                  Objetivo configurado: {targets?.waterMl ?? 2000} ml
                </div>
              </div>
            </div>
          )
        })()}
      </AccordionSection>

      {/* Alimentación del día */}
      <AccordionSection
        id="diario"
        title="Alimentación del día"
        subtitle="Registra alimentos y revisa tu diario"
        open={openSet.has('diario')}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <label htmlFor="meal-type" className="text-sm text-gray-600">
                Tipo
              </label>
              <motion.select
                id="meal-type"
                value={type}
                onChange={e => setType(e.target.value as MealType)}
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
              <label htmlFor="food-name" className="text-sm text-gray-600">
                Alimento
              </label>
              <motion.input
                id="food-name"
                list="food-list"
                value={foodName}
                onChange={e => setFoodName(e.target.value)}
                onInput={e => setQuery((e.target as HTMLInputElement).value)}
                placeholder="Ej. Avena, Manzana…"
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                whileFocus={{ scale: 1.02 }}
              />
              <datalist id="food-list">
                {suggestions.slice(0, 30).map(f => (
                  <option key={f._id} value={f.name} />
                ))}
              </datalist>

              {favs && favSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 text-sm">
                  <span className="text-gray-500">Favoritos:</span>
                  {favSuggestions.map(f => (
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
              <label htmlFor="amount" className="text-sm text-gray-600">
                Cantidad
              </label>
              <motion.input
                id="amount"
                type="number"
                min={0}
                value={amount}
                onChange={e => setAmount(parseInt(e.target.value || '0', 10))}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                whileFocus={{ scale: 1.02 }}
              />
              <p className="text-xs text-gray-500 mt-1">g o unidades según el alimento</p>
            </div>

            <div className="md:col-span-6 flex gap-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={handleAddMeal}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Añadir
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
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
                    <AnimatePresence>
                      {today.meals
                        .slice()
                        .reverse()
                        .map(m => (
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
                            <td className="px-3 capitalize">{m.type}</td>
                            <td className="px-3">{m.foodName}</td>
                            <td className="px-3 text-right">{m.amount}</td>
                            <td className="px-3 text-right">{Math.round(m.kcal)}</td>
                            <td className="px-3 text-right">{Math.round(m.protein)}</td>
                            <td className="px-3 text-right">{Math.round(m.carbs)}</td>
                            <td className="px-3 text-right">{Math.round(m.fat)}</td>
                          </motion.tr>
                        ))}
                    </AnimatePresence>
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
      </AccordionSection>

      {/* Objetivos diarios */}
      {targets && (
        <AccordionSection
          id="objetivos"
          title="Objetivos diarios"
          subtitle="Personaliza tus metas"
          open={openSet.has('objetivos')}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              ['kcal', 'Kcal'],
              ['protein', 'Proteína (g)'],
              ['carbs', 'Carbohidratos (g)'],
              ['fat', 'Grasa (g)'],
              ['waterMl', 'Agua (ml)'],
            ].map(([key, label]) => (
              <motion.div key={key} whileHover={{ y: -3 }}>
                <div>
                  <label htmlFor={`target-${key}`} className="text-sm text-gray-600">
                    {label}
                  </label>
                  <input
                    id={`target-${key}`}
                    type="number"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={targets[key as keyof NutritionTargets]}
                    onChange={e =>
                      setTargets({ ...targets, [key]: parseInt(e.target.value || '0', 10) })
                    }
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleSaveTargets}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Guardar objetivos
              </Button>
            </motion.div>
          </div>
        </AccordionSection>
      )}

      {/* Base de datos de alimentos */}
      <AccordionSection
        id="db"
        title="Base de datos de alimentos"
        subtitle="Busca y marca favoritos"
        open={openSet.has('db')}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          <motion.input
            placeholder="Buscar alimento…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            whileFocus={{ scale: 1.02 }}
          />
          <div className="overflow-x-auto max-h-[360px] border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50 sticky top-0">
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
                <AnimatePresence mode="popLayout">
                  {suggestions.map(f => (
                    <motion.tr
                      key={f._id}
                      className="border-b last:border-0 hover:bg-gray-50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
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
                            favs?.includes(f.name) ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleToggleFav(f.name)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {favs?.includes(f.name) ? '★' : '☆'}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </AccordionSection>

      {/* Agregar alimento personalizado */}
      <AccordionSection
        id="custom"
        title="Agregar alimento personalizado"
        subtitle="Define valores por 100g o por unidad"
        open={openSet.has('custom')}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
          <div className="md:col-span-2">
            <label htmlFor="food-name-new" className="text-sm text-gray-600">
              Nombre
            </label>
            <motion.input
              id="food-name-new"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={newFood.name}
              onChange={e => setNewFood({ ...newFood, name: e.target.value })}
              whileFocus={{ scale: 1.02 }}
            />
          </div>
          <div>
            <label htmlFor="food-unit-new" className="text-sm text-gray-600">
              Unidad
            </label>
            <motion.select
              id="food-unit-new"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={newFood.unit}
              onChange={e =>
                setNewFood({ ...newFood, unit: e.target.value as '100g' | 'unidad' })
              }
              whileFocus={{ scale: 1.02 }}
            >
              <option value="100g">100g</option>
              <option value="unidad">Unidad</option>
            </motion.select>
          </div>
          {[
            ['kcal', 'Kcal'],
            ['protein', 'Prot (g)'],
            ['carbs', 'Carb (g)'],
            ['fat', 'Grasa (g)'],
          ].map(([key, label]) => (
            <motion.div key={key} whileHover={{ y: -3 }}>
              <div>
                <label htmlFor={`food-${key}-new`} className="text-sm text-gray-600">
                  {label}
                </label>
                <input
                  id={`food-${key}-new`}
                  type="number"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={newFood[key as keyof Omit<FoodItem, '_id'>] as number | string}
                  onChange={e =>
                    setNewFood({
                      ...newFood,
                      [key]: parseFloat(e.target.value || '0'),
                    } as typeof newFood)
                  }
                />
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-3">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleAddCustomFood}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Guardar alimento
            </Button>
          </motion.div>
        </div>
      </AccordionSection>

      {/* Insights */}
      {week && (
        <AccordionSection
          id="insights"
          title="Insights"
          subtitle="Resumen de los últimos 7 días"
          open={openSet.has('insights')}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {[
              { title: 'Kcal medias', value: Math.round(week.avg.kcal ?? 0) },
              { title: 'Prot medias (g)', value: Math.round(week.avg.protein ?? 0) },
              { title: 'Carb medias (g)', value: Math.round(week.avg.carbs ?? 0) },
              { title: 'Grasa media (g)', value: Math.round(week.avg.fat ?? 0) },
              { title: 'Agua media (ml)', value: Math.round(week.avg.waterMl ?? 0) },
            ].map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.06 * index }}
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
                <AnimatePresence>
                  {week.days.map(d => (
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
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </AccordionSection>
      )}
    </div>
  )
}
