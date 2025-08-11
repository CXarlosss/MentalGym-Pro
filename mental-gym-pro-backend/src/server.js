import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

// Importar rutas
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import routineRoutes from "./routes/routine.routes.js";
import exerciseRoutes from "./routes/exercise.routes.js";
import mentalRoutes from "./routes/mental.routes.js";
import sessionRoutes from "./routes/exerciseSessions.routes.js";


// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
connectDB();

// Crear app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🔥 MentalGym Pro Backend en marcha");
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/mental", mentalRoutes);
app.use("/api/sessions", sessionRoutes);
// Levantar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
