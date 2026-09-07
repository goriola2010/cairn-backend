import mongoose, { Schema, Document } from "mongoose";

export interface BudgetDocument extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  limit: number;
  createdAt: Date;
}

const budgetSchema = new Schema<BudgetDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Budget = mongoose.model<BudgetDocument>("Budget", budgetSchema);