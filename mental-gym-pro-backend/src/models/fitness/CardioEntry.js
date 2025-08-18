// models/CardioEntry.ts
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const cardioEntrySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  type: { type: String, trim: true },     // correr, bici, elíptica...
  minutes: { type: Number, required: true },
  distanceKm: { type: Number, default: 0 },
  notes: { type: String, default: '' },
}, { timestamps: true });

cardioEntrySchema.index({ user: 1, date: 1 });

export default models.CardioEntry || model('CardioEntry', cardioEntrySchema);
