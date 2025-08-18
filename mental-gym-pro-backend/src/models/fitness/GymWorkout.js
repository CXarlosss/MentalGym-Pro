// models/GymWorkout.ts
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const setSchema = new Schema({
  exercise: { type: String, required: true, trim: true },
  weight: { type: Number, required: true },
  reps: { type: Number, required: true },
  marker: { type: String, enum: ['work', 'warmup'], default: 'work' },
  tags: { type: [String], default: [] }, // p.ej. ['pecho','empuje']
}, { _id: false });

const gymWorkoutSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  sets: { type: [setSchema], default: [] },
}, { timestamps: true });

gymWorkoutSchema.index({ user: 1, date: 1 }, { unique: true });

export default models.GymWorkout || model('GymWorkout', gymWorkoutSchema);
