import mongoose, { Schema, Document } from "mongoose";

export interface GoalDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  targetAmount: number;
  targetDate: string;
  saved: number;
  createdAt: Date;
}

const goalSchema = new Schema<GoalDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true, min: 0 },
  targetDate: { type: String, required: true },
  saved: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Goal = mongoose.model<GoalDocument>("Goal", goalSchema);