import Exercise from "../models/Exercise.js";

// @desc   Obtener todos los ejercicios
// @route  GET /api/exercises
export const getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ejercicios", error });
  }
};

// @desc   Crear un nuevo ejercicio
// @route  POST /api/exercises
export const createExercise = async (req, res) => {
  const { name, muscleGroup, description, imageUrl } = req.body;

  if (!name || !muscleGroup) {
    return res.status(400).json({ message: "Nombre y grupo muscular son obligatorios" });
  }

  try {
    const newExercise = await Exercise.create({
      name,
      muscleGroup,
      description,
      imageUrl,
    });

    res.status(201).json(newExercise);
  } catch (error) {
    res.status(500).json({ message: "Error al crear ejercicio", error });
  }
};
