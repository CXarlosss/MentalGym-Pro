// src/models/cognitive/MentalChallenge.js
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: [(val) => Array.isArray(val) && val.length >= 2, "Debe haber al menos 2 opciones"],
    },
    answer: { type: String, required: true },

    // 👉 Alineado con tu FE (sin acentos)
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium", index: true },
    type: { type: String, enum: ["logica", "visual", "memoria", "calculo", "creatividad"], default: "logica", index: true },

    // Extras útiles
    explanation: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    timeLimitSec: { type: Number, default: 60 },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Validar que la respuesta está en las opciones
schema.pre("validate", function (next) {
  if (this.answer && Array.isArray(this.options) && !this.options.includes(this.answer)) {
    return next(new Error("La respuesta debe estar dentro de options"));
  }
  next();
});

export default mongoose.models.MentalChallenge || mongoose.model("MentalChallenge", schema);
