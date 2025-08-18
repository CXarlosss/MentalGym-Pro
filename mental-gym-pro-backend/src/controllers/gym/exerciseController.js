// src/controllers/gym/exerciseController.js
import GymExercise from '../../models/gym/Exercise.js';

// GET /api/gym/exercises
export const getGymExercises = async (_req, res) => {
  try {
    const items = await GymExercise.find().lean();
    res.json(items);
  } catch (error) {
    console.error('[gym.getGymExercises]', error);
    res.status(500).json({ message: 'Error al obtener ejercicios' });
  }
};

// POST /api/gym/exercises
export const createGymExercise = async (req, res) => {
  try {
    const { name, muscleGroup, description, imageUrl } = req.body || {};
    if (!name || !muscleGroup)
      return res.status(400).json({ message: 'Nombre y grupo muscular son obligatorios' });

    const dup = await GymExercise.findOne({ name });
    if (dup) return res.status(409).json({ message: 'Ya existe un ejercicio con ese nombre' });

    const created = await GymExercise.create({ name, muscleGroup, description, imageUrl });
    res.status(201).json(created);
  } catch (error) {
    console.error('[gym.createGymExercise]', error);
    res.status(500).json({ message: 'Error al crear ejercicio' });
  }
};
