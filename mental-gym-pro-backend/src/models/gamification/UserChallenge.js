// models/UserChallenge.ts
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const userChallengeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  challenge: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
  progress: { type: Number, default: 0 },          // unidades que definas (niveles, sesiones, puntos…)
  isCompleted: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
}, { timestamps: true });

userChallengeSchema.index({ user: 1, challenge: 1 }, { unique: true });

export default models.UserChallenge || model('UserChallenge', userChallengeSchema);
