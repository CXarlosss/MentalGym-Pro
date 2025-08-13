'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { changePasswordMock, getGoals, setGoals, getNutritionTargets, setNutritionTargets } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth()
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')

  // Objetivos (localStorage helpers)
  const [dailySteps, setDailySteps] = useState<number>(10000)
  const [weeklySessions, setWeeklySessions] = useState<number>(3)
  const [waterMl, setWaterMl] = useState<number>(2000)

  // Password
  const [currPass, setCurrPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string>('')

  useEffect(() => {
    if (!user && !loading) {
      router.replace('/login')
      return
    }
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setAvatar(user.avatar || '')
      try {
        const g = getGoals()
        if (typeof g.dailySteps === 'number') setDailySteps(g.dailySteps)
        if (typeof g.weeklySessions === 'number') setWeeklySessions(g.weeklySessions)
        const t = getNutritionTargets()
        if (typeof t.waterMl === 'number') setWaterMl(t.waterMl)
      } catch {
        // defaults
      }
    }
  }, [user, loading, router])

  async function handleSaveProfile() {
    try {
      setSaving(true)
      setMsg('')
      await updateUser({ name: name.trim(), avatar: avatar.trim() || undefined })
      setMsg('Perfil actualizado correctamente.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'No se pudo actualizar')
    } finally {
      setSaving(false)
    }
  }

  function saveGoals() {
    try {
      setGoals({
        dailySteps: Math.max(0, Number(dailySteps) || 0),
        weeklySessions: Math.max(0, Number(weeklySessions) || 0),
      })
      const current = getNutritionTargets()
      setNutritionTargets({ ...current, waterMl: Math.max(0, Number(waterMl) || 0) })
      setMsg('Objetivos guardados.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'No se pudieron guardar los objetivos')
    }
  }

  async function handleChangePassword() {
    try {
      setSaving(true)
      setMsg('')
      await changePasswordMock(currPass, newPass)
      setCurrPass(''); setNewPass('')
      setMsg('Contraseña actualizada.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'No se pudo cambiar la contraseña')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 grid place-items-center p-8">
        <div className="text-gray-600">Cargando…</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Perfil</h1>
            <p className="text-gray-600">Gestiona tu cuenta, objetivos y seguridad.</p>
          </div>
          <Link href="/dashboard" className="shrink-0">
            <Button variant="outline">← Volver</Button>
          </Link>
        </div>

        {msg && (
          <div className="p-3 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm">
            {msg}
          </div>
        )}

        {/* Datos básicos */}
        <Card className="rounded-xl border bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Datos básicos</CardTitle>
            <CardDescription>Nombre público y avatar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 space-y-4">
                <Field label="Nombre">
                  <input
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </Field>
                <Field label="Email">
                  <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-600"
                    value={email}
                    readOnly
                  />
                </Field>
                <Field label="URL de avatar (opcional)">
                  <input
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    placeholder="https://…"
                  />
                </Field>
                <Button onClick={handleSaveProfile} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Guardar cambios
                </Button>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-gray-500 text-2xl">
                      {(name?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">Previsualización</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objetivos personales */}
        <Card className="rounded-xl border bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Objetivos personales</CardTitle>
            <CardDescription>Define tus metas de actividad y agua diaria.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Pasos diarios objetivo">
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={dailySteps}
                  onChange={e => setDailySteps(Number(e.target.value))}
                  min={0}
                />
              </Field>
              <Field label="Sesiones de cardio / semana">
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={weeklySessions}
                  onChange={e => setWeeklySessions(Number(e.target.value))}
                  min={0}
                />
              </Field>
              <Field label="Meta de agua (ml / día)">
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={waterMl}
                  onChange={e => setWaterMl(Number(e.target.value))}
                  min={0}
                />
              </Field>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" onClick={saveGoals}>Guardar objetivos</Button>
              <span className="text-xs text-gray-500">Estos objetivos alimentan los paneles de Deporte/Nutrición y se guardan localmente.</span>
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card className="rounded-xl border bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Seguridad</CardTitle>
            <CardDescription>Cambia tu contraseña (simulado).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <Field label="Contraseña actual">
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={currPass}
                  onChange={e => setCurrPass(e.target.value)}
                />
              </Field>
              <Field label="Nueva contraseña">
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Mín. 6 caracteres"
                />
              </Field>
              <div>
                <Button onClick={handleChangePassword} disabled={saving || !newPass} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto">Actualizar</Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Nota: en producción esto debe llamar a tu API con verificación real.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  )
}
