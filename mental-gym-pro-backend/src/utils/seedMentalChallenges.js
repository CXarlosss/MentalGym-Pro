import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import MentalChallenge from "../models/cognitive/MentalChallenge.js";

dotenv.config();
connectDB();

const challenges = [
  {
    question: "¿Cuál es el siguiente número en la secuencia? 2, 4, 8, 16, ?",
    options: ["18", "20", "32", "24"],
    answer: "32",
    difficulty: "fácil",
    type: "lógica",
  },
  {
    question: "Si MAR es a RAM, ¿entonces 123 es a...?",
    options: ["321", "231", "312", "132"],
    answer: "321",
    difficulty: "media",
    type: "lógica",
  },
  {
    question: "¿Cuántos segundos hay en una hora?",
    options: ["3,600", "60", "6,000", "36,000"],
    answer: "3,600",
    difficulty: "fácil",
    type: "cálculo",
  },
  {
    question: "Memoriza esta secuencia: 🟡🔺🔵🟢. ¿Cuál era el segundo símbolo?",
    options: ["🔵", "🔺", "🟢", "🟡"],
    answer: "🔺",
    difficulty: "media",
    type: "memoria",
  },
  {
    question: "Encuentra el error: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12",
    options: ["No hay error", "Falta el 0", "Número duplicado", "La pregunta es el error"],
    answer: "La pregunta es el error",
    difficulty: "difícil",
    type: "creatividad",
  },
  {
    question: "¿Qué número completa esta serie? 1, 1, 2, 3, 5, 8, ?",
    options: ["13", "10", "11", "12"],
    answer: "13",
    difficulty: "fácil",
    type: "lógica",
  },
];

const seedMentalChallenges = async () => {
  try {
    await MentalChallenge.deleteMany(); // Borra anteriores
    const inserted = await MentalChallenge.insertMany(challenges);
    console.log(`✅ ${inserted.length} retos mentales insertados`);
    process.exit();
  } catch (error) {
    console.error("❌ Error al insertar retos mentales", error);
    process.exit(1);
  }
};

seedMentalChallenges();
