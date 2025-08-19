import NutritionTarget from '../../models/nutrition/NutritionTarget.js';

/**
 * @typedef {Object} TNutritionTarget
 * @property {import('mongoose').Types.ObjectId} user
 * @property {number} kcal
 * @property {number} protein
 * @property {number} carbs
 * @property {number} fat
 * @property {number} waterMl
 * @property {import('mongoose').Types.ObjectId=} _id
 * @property {number=} __v
 */

export const getMyTargets = async (req, res) => {
  try {
    const user = req.user._id;

    const raw = await NutritionTarget
      .findOne({ user })
      .select('user kcal protein carbs fat waterMl')
      .lean()
      .exec();

    const target = raw ? /** @type {TNutritionTarget} */ (raw) : null;
    const defaults = { 
      user, 
      kcal: 2200, 
      protein: 140, 
      carbs: 220, 
      fat: 70, 
      waterMl: 2000 
    };

    return res.json(target ?? defaults);
  } catch (err) {
    console.error('[targets.get] Error:', err);
    return res.status(500).json({ 
      message: 'Error getting nutrition targets',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const upsertMyTargets = async (req, res) => {
  try {
    const user = req.user._id;
    const { kcal, protein, carbs, fat, waterMl } = req.body || {};

    // Validaciones
    if (kcal != null && isNaN(Number(kcal))) {
      return res.status(400).json({ message: 'kcal must be a number' });
    }
    // Añadir validaciones similares para otros campos si es necesario

    const set = {
      ...(kcal != null && { kcal: Number(kcal) }),
      ...(protein != null && { protein: Number(protein) }),
      ...(carbs != null && { carbs: Number(carbs) }),
      ...(fat != null && { fat: Number(fat) }),
      ...(waterMl != null && { waterMl: Number(waterMl) }),
    };

    const updated = await NutritionTarget.findOneAndUpdate(
      { user },
      { $set: set, $setOnInsert: { user } },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true,
        projection: { user: 1, kcal: 1, protein: 1, carbs: 1, fat: 1, waterMl: 1 }
      }
    ).lean();

    const result = updated ? /** @type {TNutritionTarget} */ (updated) : { user, ...set };
    return res.json(result);
  } catch (err) {
    console.error('[targets.upsert] Error:', err);
    return res.status(500).json({ 
      message: 'Error updating nutrition targets',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};