// src/controllers/gym/exercise.controller.js
import GymExercise from '../../models/gym/Exercise.js';

// GET /api/gym/exercises
export const listGymExercises = async (_req, res) => {
  try {
    const items = await GymExercise.find().sort({ name: 1 }).lean();
    res.json(items);
  } catch (err) {
    console.error('[gym.listGymExercises]', err);
    res.status(500).json({ message: 'Error al listar ejercicios' });
  }
};

// POST /api/gym/exercises
export const createGymExercise = async (req, res) => {
  try {
    const { name, muscleGroup, description, imageUrl } = req.body || {};
    if (!name || !muscleGroup) {
      return res.status(400).json({ message: 'name y muscleGroup son obligatorios' });
    }
    const dup = await GymExercise.findOne({ name });
    if (dup) return res.status(409).json({ message: 'Ya existe un ejercicio con ese nombre' });

    const created = await GymExercise.create({ name, muscleGroup, description, imageUrl });
    res.status(201).json(created);
  } catch (err) {
    console.error('[gym.createGymExercise]', err);
    res.status(500).json({ message: 'Error al crear ejercicio' });
  }
};

// PATCH /api/gym/exercises/:id
export const updateGymExercise = async (req, res) => {
  try {
    const updated = await GymExercise.findByIdAndUpdate(
      req.params.id,
      { $set: req.body || {} },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Ejercicio no encontrado' });
    res.json(updated);
  } catch (err) {
    console.error('[gym.updateGymExercise]', err);
    res.status(500).json({ message: 'Error al actualizar ejercicio' });
  }
};

// DELETE /api/gym/exercises/:id
export const deleteGymExercise = async (req, res) => {
  try {
    const deleted = await GymExercise.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Ejercicio no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[gym.deleteGymExercise]', err);
    res.status(500).json({ message: 'Error al eliminar ejercicio' });
  }
};
