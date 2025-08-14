// src/scripts/seed-exercises.mjs
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import Exercise from '../models/Exercise.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cargar variables de entorno desde la raíz del backend
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const uri = process.env.MONGO_URI
if (!uri) {
  console.error('❌ Falta MONGO_URI en .env (ruta usada):', path.resolve(__dirname, '../.env'))
  process.exit(1)
}

await mongoose.connect(uri)
console.log('✅ Conectado a MongoDB')

// Eliminar índice legacy `name_1` si existe
try {
  await Exercise.collection.dropIndex('name_1')
  console.log('🧹 Índice legacy name_1 eliminado')
} catch (e) {
  if (e?.codeName === 'IndexNotFound') {
    console.log('ℹ️ Índice name_1 no existe, seguimos')
  } else {
    console.log('⚠️ No se pudo eliminar name_1:', e.message)
  }
}

// Sincronizar índices con el schema actual
await Exercise.syncIndexes()
console.log('🔁 Índices sincronizados')

// Vaciar colección
await Exercise.deleteMany({})
console.log('🗑️ Colección Exercise vaciada')

// Insertar ejercicios
await Exercise.insertMany([
  { title: 'Memoria de pares', description: 'Encuentra parejas idénticas.', category: 'memoria', difficulty: 'easy', duration: 5, instructions: ['Observa las cartas', 'Encuentra parejas', 'Minimiza intentos'], icon: '🧠' },
  { title: 'Secuencias lógicas', description: 'Completa la serie según la regla.', category: 'logica', difficulty: 'medium', duration: 6, instructions: ['Detecta patrón', 'Elige la opción correcta'], icon: '🧩' },
  { title: 'Atención selectiva', description: 'Detecta el símbolo objetivo entre distractores.', category: 'atencion', difficulty: 'medium', duration: 4, instructions: ['Mira el objetivo', 'Haz clic sólo cuando aparezca', 'Minimiza errores'], icon: '🎯' },
  { title: 'Cálculo rápido', description: 'Resuelve operaciones bajo presión.', category: 'calculo', difficulty: 'hard', duration: 6, instructions: ['Responde rápido y preciso', 'Se penalizan errores', 'El tiempo importa'], icon: '➗' },
  { title: 'Velocidad de reacción', description: 'Responde lo más rápido posible a los estímulos.', category: 'velocidad', difficulty: 'easy', duration: 3, instructions: ['Mantente atento', 'Haz clic al ver la señal', 'Evita anticiparte'], icon: '⚡' },
  { title: 'Flexibilidad cognitiva', description: 'Cambia de regla cuando el sistema te lo indique.', category: 'flexibilidad', difficulty: 'medium', duration: 5, instructions: ['Aplica la regla actual', 'Cambia al recibir la señal', 'Mantén precisión'], icon: '🔀' },

  // Nuevos ejercicios
  { title: 'Memoria auditiva', description: 'Recuerda y repite secuencias de sonidos.', category: 'memoria', difficulty: 'medium', duration: 5, instructions: ['Escucha con atención', 'Repite en el orden correcto', 'Incrementa la dificultad progresivamente'], icon: '🎵' },
  { title: 'Rompecabezas visual', description: 'Reconstruye la imagen lo más rápido posible.', category: 'logica', difficulty: 'medium', duration: 7, instructions: ['Observa la imagen completa', 'Mueve las piezas', 'Completa en el menor tiempo'], icon: '🖼️' },
  { title: 'Caza del número', description: 'Encuentra un número objetivo entre una lista desordenada.', category: 'atencion', difficulty: 'easy', duration: 4, instructions: ['Identifica el número objetivo', 'Haz clic sólo cuando aparezca'], icon: '🔢' },
  { title: 'Operaciones encadenadas', description: 'Resuelve operaciones consecutivas sin pausa.', category: 'calculo', difficulty: 'hard', duration: 8, instructions: ['Calcula rápido', 'Mantén precisión', 'No pierdas el ritmo'], icon: '🧮' }
])

console.log('✅ Ejercicios insertados correctamente')
await mongoose.disconnect()
process.exit(0)
