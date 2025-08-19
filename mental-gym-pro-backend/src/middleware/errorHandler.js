// src/middleware/errorHandler.js
// src/middleware/errorHandler.js

/**
 * @typedef {Error & {
 * status?: number,
 * statusCode?: number,
 * code?: number,
 * keyValue?: Record<string, unknown>,
 * errors?: Record<string, { message: string }>,
 * path?: string,
 * value?: unknown,
 * type?: string
 * }} AppError
 */

/**
 * 404 Not Found middleware
 * @type {import('express').RequestHandler}
 */
export const notFound = (req, _res, next) => {
  /** @type {AppError} */
  const err = new Error(`No encontrado: ${req.originalUrl}`);
  err.status = 404;
  return next(err); // Add the return statement here
};

// ... (the rest of your code is fine)

// Handler global de errores
/** @type {import('express').ErrorRequestHandler} */
export const errorHandler = (err, req, res, _next) => {
  /** @type {AppError} */
  const e = err;

  // Si Express ya envió headers, delega
  if (res.headersSent) {
    return _next?.(err);
  }

  let status = e.status ?? e.statusCode ?? 500;
  let message = e.message || 'Error interno del servidor';

  const payload = { success: false, message };

  // Mongoose: ObjectId inválido
  if (e.name === 'CastError') {
    status = 400;
    payload.message = 'ID inválido';
    payload.details = { path: e.path, value: e.value };
  }

  // Mongoose: validación
  if (e.name === 'ValidationError' && e.errors) {
    status = 400;
    payload.message = 'Datos inválidos';
    payload.errors = Object.values(e.errors).map(x => x.message);
  }

  // Mongoose: duplicado
  if (typeof e.code === 'number' && e.code === 11000) {
    status = 409;
    payload.message = 'Registro duplicado';
    payload.fields = e.keyValue;
  }

  // JWT
  if (e.name === 'JsonWebTokenError') {
    status = 401;
    payload.message = 'Token inválido';
  }
  if (e.name === 'TokenExpiredError') {
    status = 401;
    payload.message = 'Token expirado';
  }

  // JSON mal formado (express.json/body-parser)
  if (e.type === 'entity.parse.failed') {
    status = 400;
    payload.message = 'JSON inválido en el cuerpo de la petición';
  }

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = e.stack;
    payload.path = req.originalUrl;
    payload.method = req.method;
  }

  res.status(status).json(payload);
};
