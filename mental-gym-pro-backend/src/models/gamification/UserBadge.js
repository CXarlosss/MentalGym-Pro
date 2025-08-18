// models/UserBadge.ts
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const userBadgeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  badge: { type: Schema.Types.ObjectId, ref: 'Badge', required: true, index: true },
  unlockedAt: { type: Date, default: Date.now },
}, { timestamps: true });

userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

export default models.UserBadge || model('UserBadge', userBadgeSchema);
