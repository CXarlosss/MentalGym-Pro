/* import Routine from "../models/fitness/Routine.js";

// @desc   Obtener todas las rutinas públicas
// @route  GET /api/routines/public
export const getPublicRoutines = async (req, res) => {
  try {
    const routines = await Routine.find({ visibility: "public" }).populate("creator", "username");
    res.status(200).json(routines);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener rutinas", error });
  }
};

// @desc   Crear nueva rutina
// @route  POST /api/routines
// @access Privado
export const createRoutine = async (req, res) => {
  const { title, description, level, days, visibility } = req.body;

  if (!title || !days || days.length === 0) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    const routine = await Routine.create({
      title,
      description,
      level,
      days,
      visibility,
      creator: req.user._id,
    });

    res.status(201).json(routine);
  } catch (error) {
    res.status(500).json({ message: "Error al crear rutina", error });
  }
};

// @desc   Obtener rutina por ID
// @route  GET /api/routines/:id
export const getRoutineById = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id).populate("creator", "username");

    if (!routine) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }

    res.status(200).json(routine);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener rutina", error });
  }
};

// @desc   Editar rutina (solo su creador)
// @route  PUT /api/routines/:id
export const updateRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }

    if (routine.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const updated = await Routine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar rutina", error });
  }
};

// @desc   Eliminar rutina
// @route  DELETE /api/routines/:id
export const deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }

    if (routine.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "No autorizado" });
    }

    await routine.remove();
    res.status(200).json({ message: "Rutina eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar rutina", error });
  }
};
 */