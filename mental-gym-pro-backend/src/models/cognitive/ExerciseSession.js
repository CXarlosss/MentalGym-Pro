// models/ExerciseSession.ts (actualizado)
import mongoose from 'mongoose'
const { Schema, model, models } = mongoose
// Esquema para las sesiones de ejercicio
const exerciseSessionSchema = new Schema({
  user:       { type: Schema.Types.ObjectId, ref: "User", required: true },
  exercise:   { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
  score:      { type: Number, min: 0, max: 100, default: 0 },
  durationMin:{ type: Number, default: 0 },               // minutos (para informes)
  timeSpentSec:{type: Number, default: 0 },               // SEGUNDOS (para ExerciseResult)
  playedAt:   { type: Date, default: Date.now },
  metadata:   { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default models.ExerciseSession || model("ExerciseSession", exerciseSessionSchema);
