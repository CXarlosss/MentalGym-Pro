// models/NutritionTarget.ts
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const nutritionTargetSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  kcal: { type: Number, default: 2200 },
  protein: { type: Number, default: 140 },
  carbs: { type: Number, default: 220 },
  fat: { type: Number, default: 70 },
  waterMl: { type: Number, default: 2000 },
}, { timestamps: true });

export default models.NutritionTarget || model('NutritionTarget', nutritionTargetSchema);
