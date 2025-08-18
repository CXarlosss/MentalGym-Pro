// models/ActivityDay.ts
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const activityDaySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD' (zona horaria ya resuelta en el cliente)
  steps: { type: Number, default: 0 },
  minutes: { type: Number, default: 0 },
  calories: { type: Number, default: 0 },
  note: { type: String, default: '' },
}, { timestamps: true });

activityDaySchema.index({ user: 1, date: 1 }, { unique: true });

export default models.ActivityDay || model('ActivityDay', activityDaySchema);
