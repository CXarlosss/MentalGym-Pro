import mongoose from "mongoose";
import dotenv from "dotenv";
import Exercise from "../models/cognitive/Exercise.js";
import connectDB from "../config/db.js";

dotenv.config();
connectDB();

const exercises = [
  {
    name: "Sentadilla",
    muscleGroup: "Piernas",
    description: "Ejercicio compuesto para cuádriceps, glúteos y femorales.",
    imageUrl: "",
  },
  {
    name: "Peso muerto",
    muscleGroup: "Espalda baja",
    description: "Ejercicio compuesto para cadena posterior.",
    imageUrl: "",
  },
  {
    name: "Hip Thrust",
    muscleGroup: "Glúteos",
    description: "Excelente para activar y fortalecer glúteos.",
    imageUrl: "",
  },
  {
    name: "Press banca",
    muscleGroup: "Pecho",
    description: "Ejercicio compuesto para pectorales, tríceps y deltoides.",
    imageUrl: "",
  },
  {
    name: "Remo con barra",
    muscleGroup: "Espalda",
    description: "Desarrolla dorsales, romboides y trapecios.",
    imageUrl: "",
  },
  {
    name: "Press militar",
    muscleGroup: "Hombros",
    description: "Desarrolla fuerza en los deltoides y trapecios.",
    imageUrl: "",
  },
  {
    name: "Curl de bíceps",
    muscleGroup: "Bíceps",
    description: "Ejercicio de aislamiento para los bíceps.",
    imageUrl: "",
  },
  {
    name: "Extensión de tríceps",
    muscleGroup: "Tríceps",
    description: "Ejercicio de aislamiento para tríceps.",
    imageUrl: "",
  },
  {
    name: "Elevaciones laterales",
    muscleGroup: "Hombros",
    description: "Aislamiento para deltoides laterales.",
    imageUrl: "",
  },
  {
    name: "Crunch abdominal",
    muscleGroup: "Abdomen",
    description: "Ejercicio básico para el core.",
    imageUrl: "",
  },
];

const seedExercises = async () => {
  try {
    await Exercise.deleteMany(); // Limpiar colección
    const created = await Exercise.insertMany(exercises);
    console.log(`✅ ${created.length} ejercicios insertados`);
    process.exit();
  } catch (error) {
    console.error("❌ Error al insertar ejercicios", error);
    process.exit(1);
  }
};

seedExercises();
