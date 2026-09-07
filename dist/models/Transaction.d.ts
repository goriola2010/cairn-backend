import mongoose, { Document } from "mongoose";
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
export declare const Transaction: mongoose.Model<TransactionDocument, {}, {}, {}, Document<unknown, {}, TransactionDocument, {}, mongoose.DefaultSchemaOptions> & TransactionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, TransactionDocument>;
//# sourceMappingURL=Transaction.d.ts.map