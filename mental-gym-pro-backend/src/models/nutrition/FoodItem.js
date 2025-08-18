// models/FoodItem.ts
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const foodItemSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  kcal: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  unit: { type: String, enum: ['100g', 'unidad'], default: '100g' },
  tags: { type: [String], default: [] },
}, { timestamps: true });

export default models.FoodItem || model('FoodItem', foodItemSchema);
