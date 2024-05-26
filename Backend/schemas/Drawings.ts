import mongoose from 'mongoose';

const lineSchema = new mongoose.Schema({
  id: { type: String, required: true },
  points: { type: [Number], required: true },
  tool: { type: String, required: true },
  color: { type: String, required: true },
  thickness: { type: Number, required: true }
});

const shapeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  color: { type: String, required: true }
});

const textSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  fontSize: { type: Number, required: true },
  color: { type: String, required: true }
});

const drawingSchema = new mongoose.Schema({
  drawingId: { type: String, required: true, unique: true },
  boardId: { type: String, required: true },
  lines: { type: [lineSchema], default: [] },
  shapes: { type: [shapeSchema], default: [] },
  texts: { type: [textSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Drawing = mongoose.model('Drawing', drawingSchema);
