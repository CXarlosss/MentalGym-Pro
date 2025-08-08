import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number, default: 0 },
    rest: { type: Number, default: 60 }, // en segundos
  },
  { _id: false } // no queremos _id por cada ejercicio anidado
);

const daySchema = new mongoose.Schema(
  {
    day: { type: String, required: true }, // Ej: "Lunes"
    exercises: [exerciseSchema],
  },
  { _id: false }
);

const routineSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    level: {
      type: String,
      enum: ["principiante", "intermedio", "avanzado"],
      default: "intermedio",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    days: {
      type: [daySchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Routine = mongoose.model("Routine", routineSchema);
export default Routine;
