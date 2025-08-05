import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("JWT_SECRET no definido");

      const decoded = jwt.verify(token, secret);

      // Validamos que es JwtPayload y tiene 'id'
      if (typeof decoded === "object" && "id" in decoded) {
        req.user = await User.findById(decoded.id).select("-password");
        next();
      } else {
        return res.status(401).json({ message: "Token inválido (estructura incorrecta)" });
      }
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Token inválido o expirado", error: error.message });
    }
  } else {
    return res.status(401).json({ message: "No autorizado, token no encontrado" });
  }
};

export default protect;
