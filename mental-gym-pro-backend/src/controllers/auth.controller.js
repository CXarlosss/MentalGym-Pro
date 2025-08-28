import bcrypt from "bcrypt";
import User from "../models/user/User.js";
import generateToken from "../utils/genterateToken.js";

// ---- helpers ----
function slugifyName(name) {
  return String(name).trim().toLowerCase()
    .replace(/\s+/g, '')       // quita espacios
    .replace(/[^a-z0-9_]/g, ''); // solo a-z0-9_
}

async function generateUniqueUsername(base) {
  let candidate = base || 'user';
  let i = 0;
  // intenta base, base1, base2...
  // eslint-disable-next-line no-await-in-loop
  while (await User.findOne({ username: candidate })) {
    i += 1;
    candidate = `${base}${i}`;
  }
  return candidate;
}

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos' });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const existsEmail = await User.findOne({ email: emailNorm });
    if (existsEmail) return res.status(409).json({ message: 'El email ya está en uso' });

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // username único basado en name
    const base = slugifyName(name) || emailNorm.split('@')[0];
    const username = await generateUniqueUsername(base);

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      // si tu esquema no tiene "name", no pasa nada; guardamos el visible en "username"
      username,
      email: emailNorm,
      password: hash,
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        // para el frontend exponemos "name" (lees el username)
        name: user.username,
        email: user.email,
        avatar: user.avatar ?? '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    if (err && err.code === 11000) {
      // por si aún chocamos con otra unique (email/username)
      const field = Object.keys(err.keyPattern || {})[0] || 'campo';
      return res.status(409).json({ message: `El ${field} ya está en uso` });
    }
    console.error('[register] ERROR:', err);
    return res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan credenciales' });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Credenciales inválidas' });

    return res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.username, // usamos username como nombre visible
        email: user.email,
        avatar: user.avatar ?? '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// GET /api/auth/me  (usa tu middleware protect que pone req.user)
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.json({
      _id: user._id,
      name: user.username,
      email: user.email,
      avatar: user.avatar ?? '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error('[me]', err);
    return res.status(500).json({ message: 'Error al obtener el perfil' });
  }
};

// PATCH /api/auth/profile  (name, avatar) -> mapea name a username
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body ?? {};
    const user = await User.findById(req.user?._id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (typeof name === 'string' && name.trim()) user.username = name.trim();
    if (typeof avatar === 'string') user.avatar = avatar;

    await user.save();

    return res.json({
      _id: user._id,
      name: user.username,
      email: user.email,
      avatar: user.avatar ?? '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'campo';
      return res.status(409).json({ message: `El ${field} ya está en uso` });
    }
    console.error('[updateProfile]', err);
    return res.status(500).json({ message: 'No se pudo actualizar el perfil' });
  }
};

// PATCH /api/auth/password  (currentPassword, newPassword)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {};
    const user = await User.findById(req.user?._id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const ok = await bcrypt.compare(currentPassword || '', user.password);
    if (!ok) return res.status(400).json({ message: 'La contraseña actual no es correcta' });

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    console.error('[changePassword]', err);
    return res.status(500).json({ message: 'No se pudo cambiar la contraseña' });
  }
};
