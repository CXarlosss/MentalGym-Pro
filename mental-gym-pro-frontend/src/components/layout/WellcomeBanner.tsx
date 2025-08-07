// src/components/WelcomeBanner.tsx
export default function WelcomeBanner({ name, streak }: { name: string; streak: number }) {
  const getMotivationalMessage = () => {
    if (streak >= 7) return `¡Increíble racha de ${streak} días! Sigue así.`
    if (streak >= 3) return `¡Buen trabajo! Llevas ${streak} días consecutivos.`
    return '¡Cada día es una nueva oportunidad para entrenar tu mente!'
  }

  return (
    <div className="bg-indigo-600 text-white py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Hola, {name}</h1>
        <p className="text-indigo-100 text-lg">{getMotivationalMessage()}</p>
      </div>
    </div>
  )
}