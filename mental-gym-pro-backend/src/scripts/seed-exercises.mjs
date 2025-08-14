// src/scripts/seed-exercises.mjs
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import Exercise from '../models/Exercise.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cargar .env desde la raíz del backend
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const uri = process.env.MONGO_URI
if (!uri) {
  throw new Error('❌ Falta la variable MONGO_URI en .env')
}

await mongoose.connect(uri)

const WIPE = process.env.SEED_WIPE === '1' // si quieres vaciar la colección

// helper simple para slug
const slugify = (s) =>
  s
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

// === Data a insertar (con engine) ===
const data = [
  // Core (coinciden con tus mocks)
  {
    title: 'Memoria de pares',
    description: 'Encuentra parejas idénticas.',
    category: 'memoria',
    difficulty: 'easy',
    duration: 5,
    instructions: ['Observa las cartas', 'Encuentra parejas', 'Minimiza intentos'],
    icon: '🧠',
    engine: 'memory-pairs',
  },
  {
    title: 'Secuencias lógicas',
    description: 'Completa la serie según la regla.',
    category: 'logica',
    difficulty: 'medium',
    duration: 6,
    instructions: ['Detecta patrón', 'Elige la opción correcta'],
    icon: '🧩',
    engine: 'logic-seq',
  },
  {
    title: 'Atención selectiva',
    description: 'Detecta el símbolo objetivo entre distractores.',
    category: 'atencion',
    difficulty: 'medium',
    duration: 4,
    instructions: ['Mira el objetivo', 'Haz clic sólo cuando aparezca', 'Minimiza errores'],
    icon: '🎯',
    engine: 'attention-selective',
  },
  {
    title: 'Cálculo rápido',
    description: 'Resuelve operaciones bajo presión.',
    category: 'calculo',
    difficulty: 'hard',
    duration: 6,
    instructions: ['Responde rápido y preciso', 'Se penalizan errores', 'El tiempo importa'],
    icon: '➗',
    engine: 'mental-math',
  },
  {
    title: 'Velocidad de reacción',
    description: 'Responde lo más rápido posible a los estímulos.',
    category: 'velocidad',
    difficulty: 'easy',
    duration: 3,
    instructions: ['Mantente atento', 'Haz clic al ver la señal', 'Evita anticiparte'],
    icon: '⚡',
    engine: 'reaction-speed',
  },
  {
    title: 'Flexibilidad cognitiva',
    description: 'Cambia de regla cuando el sistema te lo indique.',
    category: 'flexibilidad',
    difficulty: 'medium',
    duration: 5,
    instructions: ['Aplica la regla actual', 'Cambia al recibir la señal', 'Mantén precisión'],
    icon: '🔀',
    engine: 'cognitive-flex',
  },

  // Nuevos
  {
    title: 'Memoria auditiva',
    description: 'Recuerda y repite secuencias de sonidos.',
    category: 'memoria',
    difficulty: 'medium',
    duration: 5,
    instructions: [
      'Escucha con atención',
      'Repite en el orden correcto',
      'Incrementa la dificultad progresivamente',
    ],
    icon: '🎵',
    engine: 'memory-pairs', // o crea un engine propio si harás uno auditivo
  },
  {
    title: 'Rompecabezas visual',
    description: 'Reconstruye la imagen lo más rápido posible.',
    category: 'logica',
    difficulty: 'medium',
    duration: 7,
    instructions: ['Observa la imagen completa', 'Mueve las piezas', 'Completa en el menor tiempo'],
    icon: '🖼️',
    engine: 'logic-seq', // o un engine dedicado (p.ej. 'visual-puzzle')
  },
  {
    title: 'Caza del número',
    description: 'Encuentra un número objetivo entre una lista desordenada.',
    category: 'atencion',
    difficulty: 'easy',
    duration: 4,
    instructions: ['Identifica el número objetivo', 'Haz clic sólo cuando aparezca'],
    icon: '🔢',
    engine: 'attention-selective',
  },
  {
    title: 'Operaciones encadenadas',
    description: 'Resuelve operaciones consecutivas sin pausa.',
    category: 'calculo',
    difficulty: 'hard',
    duration: 8,
    instructions: ['Calcula rápido', 'Mantén precisión', 'No pierdas el ritmo'],
    icon: '🧮',
    engine: 'mental-math',
  },
]

async function main() {
  const uri = process.env.MONGO_URI
  console.log('✅ Conectado a MongoDB')

  // Intentar limpiar índice legacy "name_1" si existiera
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

  // Sincroniza índices del schema
  await Exercise.syncIndexes()
  console.log('🔁 Índices sincronizados')

  if (WIPE) {
    await Exercise.deleteMany({})
    console.log('🗑️ Colección Exercise vaciada (SEED_WIPE=1)')
  }

  // build docs: añade slug y sanea instrucciones
  const docs = data.map((d) => ({
    ...d,
    slug: slugify(d.title),
    instructions: Array.isArray(d.instructions) ? d.instructions : [],
  }))

  // Upsert por título (evita duplicados). Si prefieres upsert por slug, cambia `filter`.
  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { title: doc.title },
      update: { $set: doc },
      upsert: true,
    },
  }))

  const res = await Exercise.bulkWrite(ops, { ordered: false })
  console.log('✅ Seed completado.')
  console.log('   upserts:', res.upsertedCount, '| matched:', res.matchedCount, '| modified:', res.modifiedCount)
}

main()
  .catch((err) => {
    console.error('❌ Error en seed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await mongoose.disconnect()
    process.exit(0)
  })
