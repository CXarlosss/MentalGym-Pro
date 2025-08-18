// models/Exercise.js
import mongoose from 'mongoose'

const ExerciseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['memoria', 'logica', 'atencion', 'calculo', 'velocidad', 'flexibilidad'],
      required: true
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    duration: { type: Number, default: 5 }, // minutos
    icon: { type: String },
    instructions: { type: [String], default: [] },

    // 👇 NUEVO
    engine: {
      type: String,
      enum: [
        'reaction-speed',
        'memory-pairs',
        'logic-seq',
        'attention-selective',
        'mental-math',
        'cognitive-flex'
      ],
      required: true
    },

    // opcional: slug único
    slug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true } // createdAt / updatedAt
)

export default mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema)
