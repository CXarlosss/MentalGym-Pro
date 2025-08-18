// models/Meal.ts
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const mealSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  type: { type: String, enum: ['desayuno','comida','cena','snack'], required: true },
  foodName: { type: String, required: true },
  amount: { type: Number, required: true },      // gramos o unidades, según FoodItem.unit
  kcal: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
}, { timestamps: true });

mealSchema.index({ user: 1, date: 1 });

export default models.Meal || model('Meal', mealSchema);
