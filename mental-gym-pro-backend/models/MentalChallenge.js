import mongoose from "mongoose";

const mentalChallengeSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "La pregunta es obligatoria"],
    },
    options: {
      type: [String],
      required: [true, "Las opciones son obligatorias"],
      validate: [(val) => val.length >= 2, "Debe haber al menos 2 opciones"],
    },
    answer: {
      type: String,
      required: [true, "La respuesta correcta es obligatoria"],
    },
    difficulty: {
      type: String,
      enum: ["fácil", "media", "difícil"],
      default: "media",
    },
    type: {
      type: String,
      enum: ["lógica", "visual", "memoria", "cálculo", "creatividad"],
      default: "lógica",
    },
  },
  {
    timestamps: true,
  }
);

const MentalChallenge = mongoose.model("MentalChallenge", mentalChallengeSchema);
export default MentalChallenge;
