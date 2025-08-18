// models/Badge.ts
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const badgeSchema = new Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '🏅' },
}, { timestamps: true });

export default models.Badge || model('Badge', badgeSchema);
