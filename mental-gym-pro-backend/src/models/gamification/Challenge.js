// models/Challenge.ts
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const challengeSchema = new Schema({
  title: { type: String, required: true, trim: true, unique: true },
  description: { type: String, default: '' },
  objective: { type: String, required: true },     // p.ej. "Completar 50 niveles"
  durationDays: { type: Number, default: 30 },
  exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }], // motores implicados
  expiresAt: { type: Date },
  isPublic: { type: Boolean, default: true },
  participants: { type: Number, default: 0 },      // contador rápido (también puedes calcular)
}, { timestamps: true });

export default models.Challenge || model('Challenge', challengeSchema);
