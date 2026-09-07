import mongoose, { Schema, Document } from "mongoose";

export type TransactionType = "debit" | "credit";

export interface TransactionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;
  createdAt: Date;
}

const transactionSchema = new Schema<TransactionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["debit", "credit"], required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  note: { type: String, default: "" },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Transaction = mongoose.model<TransactionDocument>("Transaction", transactionSchema);