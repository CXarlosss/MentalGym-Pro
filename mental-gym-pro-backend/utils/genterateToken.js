import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("❌ JWT_SECRET no está definido en el archivo .env");
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn: "30d",
  });
};

export default generateToken;
