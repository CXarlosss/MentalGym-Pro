import bcrypt from "bcrypt";
import User from "../models/user/User.js"; // Asegúrate de que la ruta sea correcta
import generateToken from "../utils/genterateToken.js";


// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos' });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const exists = await User.findOne({ email: emailNorm });
    if (exists) return res.status(409).json({ message: 'El usuario ya existe' });

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: String(name).trim(),    // 👈 en DB sigues usando username
      email: emailNorm,
      password: hash,
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.username,            // 👈 frontend recibe name
        email: user.email,
        avatar: user.avatar ?? '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error('[register]', err);
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
        name: user.username,            // 👈 mapeo a name
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

// GET /api/auth/me  (requiere middleware que ponga req.userId)
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
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

// PATCH /api/auth/profile  (name, avatar)
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body ?? {};
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (typeof name === 'string') user.username = name.trim();
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
    console.error('[updateProfile]', err);
    return res.status(500).json({ message: 'No se pudo actualizar el perfil' });
  }
};

// PATCH /api/auth/password  (currentPassword, newPassword)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {};
    const user = await User.findById(req.userId);
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
