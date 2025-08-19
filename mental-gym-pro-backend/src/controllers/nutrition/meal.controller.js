// src/controllers/nutrition/meal.controller.js
import Meal from '../../models/nutrition/Meal.js';
import FoodItem from '../../models/nutrition/FoodItem.js';

// Convert a Date object to a 'YYYY-MM-DD' string.
const toLocalYMD = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * @typedef {object} TFoodItem
 * @property {unknown} _id
 * @property {string} name
 * @property {string=} unit
 * @property {number=} kcal
 * @property {number=} protein
 * @property {number=} carbs
 * @property {number=} fat
 * @property {number=} __v
 */

// Computes a factor based on the food unit and amount.
const computeFactor = (unit, amount) => {
  const amt = Number(amount) || 0;
  if (!unit || amt === 0) return 1;

  const u = String(unit).toLowerCase();
  switch (u) {
    case 'unidad':
      return amt;
    case '100g':
    case '100ml':
      return amt / 100;
    default:
      return amt;
  }
};
/**
 * Reads a FoodItem in "lean" format with only necessary fields.
 * @param {string} foodId
 * @returns {Promise<TFoodItem|null>}
 */
async function getLeanFoodItemById(foodId) {
  const raw = await FoodItem
    .findOne({ _id: foodId })
    .select('name unit kcal protein carbs fat')
    .lean()
    .exec();

  // Explicitly cast the result to TFoodItem or null
  return raw ? /** @type {TFoodItem} */ (raw) : null;
}
// -------------------------------
//           LIST
// -------------------------------
// GET /api/nutrition/meals?day=YYYY-MM-DD
// GET /api/nutrition/meals?from=YYYY-MM-DD&to=YYYY-MM-DD
export const listMyMeals = async (req, res) => {
  try {
    const { _id: user } = req.user;
    const { day, from, to } = req.query;

    const query = { user };
    if (day) {
      query.date = day;
    } else if (from && to) {
      query.date = { $gte: from, $lte: to };
    }

    const items = await Meal.find(query).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error listing meals', error: err.message });
  }
};

// -------------------------------
//            CREATE
// -------------------------------
// POST /api/nutrition/meals
export const createMeal = async (req, res) => {
  try {
    const { _id: user } = req.user;
    const { type, foodId, foodName, amount, date } = req.body;
    let { kcal, protein, carbs, fat } = req.body;

    if (!type) {
      return res.status(400).json({ message: '`type` is required' });
    }

    let finalFoodName = foodName || '';
    const safeAmount = Number(amount) || 0;

    if (foodId) {
      const foodItem = await getLeanFoodItemById(foodId);
      if (!foodItem) {
        return res.status(404).json({ message: 'Invalid `foodId`' });
      }

      const factor = computeFactor(foodItem.unit, safeAmount);
      kcal = Math.round((foodItem.kcal || 0) * factor);
      protein = +(Number(foodItem.protein || 0) * factor).toFixed(1);
      carbs = +(Number(foodItem.carbs || 0) * factor).toFixed(1);
      fat = +(Number(foodItem.fat || 0) * factor).toFixed(1);
      finalFoodName = foodItem.name;
    } else {
      // Use provided macros in manual mode
      kcal = Math.round(Number(kcal) || 0);
      protein = +(Number(protein) || 0).toFixed(1);
      carbs = +(Number(carbs) || 0).toFixed(1);
      fat = +(Number(fat) || 0).toFixed(1);
    }

    const newMeal = await Meal.create({
      user,
      date: date || toLocalYMD(new Date()),
      type,
      foodName: finalFoodName,
      amount: safeAmount,
      kcal,
      protein,
      carbs,
      fat,
    });

    return res.status(201).json(newMeal);
  } catch (err) {
    console.error('[nutrition.createMeal]', err);
    return res.status(500).json({ message: 'Error creating meal', error: err.message });
  }
};

// -------------------------------
//           UPDATE
// -------------------------------
// PATCH /api/nutrition/meals/:id
export const updateMeal = async (req, res) => {
  try {
    const { _id: user } = req.user;
    const mealId = req.params.id;
    const { foodId, amount, ...restOfBody } = req.body;
    const setUpdates = { ...restOfBody };
    const safeAmount = amount != null ? Number(amount) : undefined;

    const existingMeal = await Meal.findOne({ _id: mealId, user });
    if (!existingMeal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    if (foodId) {
      const foodItem = await getLeanFoodItemById(foodId);
      if (!foodItem) {
        return res.status(400).json({ message: 'Invalid `foodId`' });
      }

      const factor = computeFactor(foodItem.unit, safeAmount ?? existingMeal.amount);
      setUpdates.kcal = Math.round((foodItem.kcal || 0) * factor);
      setUpdates.protein = +(Number(foodItem.protein || 0) * factor).toFixed(1);
      setUpdates.carbs = +(Number(foodItem.carbs || 0) * factor).toFixed(1);
      setUpdates.fat = +(Number(foodItem.fat || 0) * factor).toFixed(1);
      setUpdates.foodName = foodItem.name;
    } else if (safeAmount != null) {
      // Proportional rescaling with existing macros
      const safeExistingAmount = existingMeal.amount || 1;
      const factor = safeAmount / safeExistingAmount;
      setUpdates.kcal = Math.round((existingMeal.kcal || 0) * factor);
      setUpdates.protein = +(Number(existingMeal.protein || 0) * factor).toFixed(1);
      setUpdates.carbs = +(Number(existingMeal.carbs || 0) * factor).toFixed(1);
      setUpdates.fat = +(Number(existingMeal.fat || 0) * factor).toFixed(1);
    }

    const updatedMeal = await Meal.findOneAndUpdate(
      { _id: mealId, user },
      { $set: setUpdates },
      { new: true }
    );

    if (!updatedMeal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json(updatedMeal);
  } catch (err) {
    res.status(500).json({ message: 'Error updating meal', error: err.message });
  }
};

// -------------------------------
//            DELETE
// -------------------------------
// DELETE /api/nutrition/meals/:id
export const deleteMeal = async (req, res) => {
  try {
    const { _id: user } = req.user;
    const mealId = req.params.id;
    const deletedMeal = await Meal.findOneAndDelete({ _id: mealId, user });

    if (!deletedMeal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting meal', error: err.message });
  }
};

// -------------------------------
//           SUMMARY
// -------------------------------
// GET /api/nutrition/summary/daily?day=YYYY-MM-DD
export const getDailySummary = async (req, res) => {
  try {
    const { _id: user } = req.user;
    const day = req.query.day || toLocalYMD(new Date());

    const meals = await Meal.find({ user, date: day }).lean();
    const summary = meals.reduce(
      (acc, meal) => ({
        kcal: acc.kcal + (meal.kcal || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.json({ date: day, ...summary, meals });
  } catch (err) {
    res.status(500).json({ message: 'Error calculating daily summary', error: err.message });
  }
};

// GET /api/nutrition/summary/week?end=YYYY-MM-DD (last 7 days)
export const getWeekSummary = async (req, res) => {
  try {
    const { _id: user } = req.user;
    const end = req.query.end ? new Date(req.query.end) : new Date();

    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      dates.push(toLocalYMD(d));
    }

    const meals = await Meal.find({ user, date: { $in: dates } }).lean();

    const byDayMap = new Map(dates.map((d) => [d, { kcal: 0, protein: 0, carbs: 0, fat: 0 }]));

    for (const meal of meals) {
      const dailySummary = byDayMap.get(meal.date);
      if (dailySummary) {
        dailySummary.kcal += meal.kcal || 0;
        dailySummary.protein += meal.protein || 0;
        dailySummary.carbs += meal.carbs || 0;
        dailySummary.fat += meal.fat || 0;
      }
    }

    const list = dates.map((date) => ({ date, ...byDayMap.get(date) }));

    const totalSum = list.reduce(
    (a, b) => ({
      kcal: a.kcal + (b.kcal || 0), // The fix is here
      protein: a.protein + (b.protein || 0),
      carbs: a.carbs + (b.carbs || 0),
      fat: a.fat + (b.fat || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
);

    res.json({
      days: list,
      avg: {
        kcal: Math.round(totalSum.kcal / 7),
        protein: Math.round(totalSum.protein / 7),
        carbs: Math.round(totalSum.carbs / 7),
        fat: Math.round(totalSum.fat / 7),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error calculating weekly summary', error: err.message });
  }
};