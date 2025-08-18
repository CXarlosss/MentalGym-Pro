// src/models/gym/Exercise.js
import mongoose from 'mongoose';
const GymExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  muscleGroup: { type: String, required: true, trim: true }, // p.ej. pecho, espalda...
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.GymExercise || mongoose.model('GymExercise', GymExerciseSchema);
