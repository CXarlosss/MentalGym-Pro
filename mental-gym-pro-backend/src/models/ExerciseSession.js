import mongoose from "mongoose";

const exerciseSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise", required: true },
    score: { type: Number, min: 0, max: 100, default: 0 },   // % o puntos
    durationMin: { type: Number, default: 0 },               // duración en minutos
    playedAt: { type: Date, default: Date.now },             // fecha de la sesión
    // opcional: metadata: {}
  },
  { timestamps: true }
);

const ExerciseSession = mongoose.model("ExerciseSession", exerciseSessionSchema);
export default ExerciseSession;
