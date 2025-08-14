// models/Exercise.ts (actualizado)
import mongoose from 'mongoose'
const { Schema, model, models } = mongoose
const exerciseSchema = new Schema({
  // === Campos cognitivos (lo que espera tu front) ===
  title:      { type: String, required: true, trim: true, unique: true }, // <- NUEVO (equivale a "name")
  description:{ type: String, default: "" },
  category:   { 
    type: String, 
    enum: ['memoria','logica','atencion','calculo','velocidad','flexibilidad'], 
    required: true 
  },
  difficulty: { type: String, enum: ['easy','medium','hard'], required: true },
  duration:   { type: Number, default: 5 },               // minutos
  icon:       { type: String, default: '' },
  instructions:{ type: [String], default: [] },

  // === Compatibilidad con tu esquema antiguo de fuerza ===
  name:       { type: String, trim: true },               // opcional (alias legacy)
  muscleGroup:{ type: String, trim: true },               // opcional
  imageUrl:   { type: String, default: "" },              // opcional
}, { timestamps: true });

// Virtual opcional para que name apunte a title si hiciera falta
exerciseSchema.virtual('displayName').get(function() {
  return this.title || this.name;
});

export default models.Exercise || model("Exercise", exerciseSchema);
