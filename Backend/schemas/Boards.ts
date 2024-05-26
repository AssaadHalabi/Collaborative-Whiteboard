import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  boardId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  ownerId: { type: String, required: true },
  collaborators: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Board = mongoose.model('Board', boardSchema);