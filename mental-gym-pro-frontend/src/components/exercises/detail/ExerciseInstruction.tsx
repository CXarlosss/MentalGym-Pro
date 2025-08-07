// src/components/exercises/detail/ExerciseInstructions.tsx
export default function ExerciseInstructions({
  description,
  duration,
  instructions,
  onStart
}: {
  description: string
  duration: number
  instructions: string[]
  onStart: () => void
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Instrucciones</h2>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Cómo realizar este ejercicio:</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          {instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-gray-600">
          <span className="font-medium">Duración estimada:</span> {duration} minutos
        </div>
        <button
          onClick={onStart}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Comenzar Ejercicio
        </button>
      </div>
    </div>
  )
}