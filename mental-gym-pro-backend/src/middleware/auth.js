// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/user/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    const auth = req.headers.authorization || req.headers.Authorization;
    if (auth && auth.startsWith('Bearer ')) {
      token = auth.split(' ')[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) return res.status(401).json({ message: 'No autorizado, token no encontrado' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'Config inválida: JWT_SECRET no definido' });

    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== 'object' || !('id' in decoded))
      return res.status(401).json({ message: 'Token inválido (estructura incorrecta)' });

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Token válido pero usuario no existe' });

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado', error: error.message });
  }
};
