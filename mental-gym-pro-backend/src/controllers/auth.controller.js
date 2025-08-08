import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateToken from "../utils/genterateToken.js";

// @desc   Registrar nuevo usuario
// @route  POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password } = req.body; // CAMBIA username → name

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: name, // 👈 Mapeo correcto
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    console.error(error); // 👈 IMPORTANTE: añade esto para ver el error real
    res.status(500).json({ message: "Error al registrar usuario", error });
  }
};


// @desc   Login de usuario
// @route  POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Comparar contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

  res.status(200).json({
  user: {
    id: user._id,
    name: user.username, // 👈 para que coincida con lo que espera el frontend
    email: user.email,
    avatar: user.avatar, // opcional
  },
  token: generateToken(user._id),
});

  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error });
  }
};
