// POST /api/cognitive/sessions/:sessionId/complete
export const completeSession = async (req, res) => {
  try {
    // 1) Autenticación básica
    if (!req.user?._id) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { sessionId } = req.params;

    // 2) Validar ObjectId
    const isValidObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(v);
    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({ message: 'sessionId inválido' });
    }

    // 3) Coerción y límites
    const {
      score = 0,
      timeSpent = 0,           // el front te envía "timeSpent" en segundos
      metadata = {}
    } = req.body || {};

    const toNumber = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
    const clamp0 = (n) => Math.max(0, n);

    const nextScore = clamp0(toNumber(score));
    const nextTimeSpentSec = clamp0(toNumber(timeSpent));
    const safeMetadata =
      metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {};

    // (Opcional) límite de tamaño del metadata ~16KB
    const metaSize = Buffer.byteLength(JSON.stringify(safeMetadata), 'utf8');
    if (metaSize > 16 * 1024) {
      return res.status(413).json({ message: 'metadata demasiado grande' });
    }

    // 4) Idempotencia: si ya está completada, no machacar
    const existing = await ExerciseSession
      .findOne({ _id: sessionId, user: req.user._id })
      .lean();

    if (!existing) {
      return res.status(404).json({ message: 'Sesión no encontrada' });
    }

    if (existing.completedAt) {
      // Devolver en el mismo formato que espera el front (ExerciseResult)
      return res.json({
        _id: existing._id,
        sessionId: existing._id,
        score: existing.score ?? 0,
        timeSpent: existing.timeSpentSec ?? 0,
        createdAt: existing.completedAt ?? existing.playedAt,
        metadata: existing.metadata ?? {},
      });
    }

    // 5) Actualización con validación
    const updated = await ExerciseSession.findOneAndUpdate(
      { _id: sessionId, user: req.user._id },
      {
        $set: {
          score: nextScore,
          timeSpentSec: nextTimeSpentSec, // tu modelo usa timeSpentSec
          metadata: safeMetadata,
          completedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).populate('exercise', 'title category difficulty');

    if (!updated) {
      return res.status(404).json({ message: 'Sesión no encontrada' });
    }

    // 6) Respuesta compatible con el front
    return res.json({
      _id: updated._id,
      sessionId: updated._id,
      score: updated.score ?? 0,
      timeSpent: updated.timeSpentSec ?? 0,
      createdAt: updated.completedAt ?? updated.playedAt,
      metadata: updated.metadata ?? {},
    });
  } catch (error) {
    // 7) Duplicados/errores comunes (opcional)
    if (error?.name === 'CastError') {
      return res.status(400).json({ message: 'ID inválido' });
    }
    console.error('[cog.completeSession]', error);
    res.status(500).json({ message: 'Error al completar sesión' });
  }
};
