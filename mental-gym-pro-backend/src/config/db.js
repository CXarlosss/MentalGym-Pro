import mongoose from "mongoose";

const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGO_URI_REMOTE ||
    process.env.MONGO_URI_LOCAL;

  const dbName = process.env.DB_NAME || "mental-gym-pro";

  if (!uri) throw new Error("❌ No hay URI de Mongo en variables de entorno");

  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(uri, { dbName });
    console.log(`✅ MongoDB conectado host=${mongoose.connection.host} db=${mongoose.connection.name}`);
  } catch (error) {
    console.error(`❌ Error MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
