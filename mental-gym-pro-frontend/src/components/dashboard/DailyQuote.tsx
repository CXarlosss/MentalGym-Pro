// src/components/dashboard/DailyQuote.tsx

const quotes = [
  {
    text: "La motivación te impulsa, pero el hábito te mantiene en marcha.",
    author: "Jim Ryun"
  },
  {
    text: "El cerebro no es un vaso por llenar, sino una lámpara por encender.",
    author: "Plutarco"
  },
  {
    text: "La disciplina es el puente entre las metas y los logros.",
    author: "Jim Rohn"
  }
]

export default function DailyQuote() {
  const today = new Date().getDate()
  const quote = quotes[today % quotes.length]

  return (
    <Card className="h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl mb-4">💡</span>
            <blockquote className="text-xl italic text-gray-700 mb-4">
              "{quote.text}"
            </blockquote>
            <p className="text-gray-500">— {quote.author}</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 text-center mt-4">
          Frase del día • {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </CardContent>
    </Card>
  )
}