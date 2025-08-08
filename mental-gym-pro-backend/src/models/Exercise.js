import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del ejercicio es obligatorio"],
      unique: true,
      trim: true,
    },
    muscleGroup: {
      type: String,
      required: [true, "El grupo muscular es obligatorio"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);
export default Exercise;
