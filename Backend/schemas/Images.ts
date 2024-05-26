import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  imageId: { type: String, required: true, unique: true },
  boardId: { type: String, required: true },
  src: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Image = mongoose.model('Image', imageSchema);
