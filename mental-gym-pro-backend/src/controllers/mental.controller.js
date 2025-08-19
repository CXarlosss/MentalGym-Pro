/* import MentalChallenge from "../models/cognitive/MentalChallenge.js";

// @desc   Obtener reto mental aleatorio
// @route  GET /api/mental/daily
export const getDailyChallenge = async (req, res) => {
  try {
    const count = await MentalChallenge.countDocuments();
    const random = Math.floor(Math.random() * count);
    const challenge = await MentalChallenge.findOne().skip(random).select("-answer"); // no enviar respuesta

    if (!challenge) {
      return res.status(404).json({ message: "No hay retos mentales disponibles" });
    }

    res.status(200).json(challenge);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reto mental", error });
  }
};

// @desc   Comprobar respuesta de reto mental
// @route  POST /api/mental/check
export const checkChallengeAnswer = async (req, res) => {
  const { challengeId, selectedAnswer } = req.body;

  if (!challengeId || !selectedAnswer) {
    return res.status(400).json({ message: "Faltan datos para comprobar la respuesta" });
  }

  try {
    const challenge = await MentalChallenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({ message: "Reto no encontrado" });
    }

    const isCorrect = challenge.answer === selectedAnswer;

    res.status(200).json({ correct: isCorrect });
  } catch (error) {
    res.status(500).json({ message: "Error al comprobar respuesta", error });
  }
};
 */