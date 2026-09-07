import mongoose, { Document } from "mongoose";
export interface BudgetDocument extends Document {
    userId: mongoose.Types.ObjectId;
    category: string;
    limit: number;
    createdAt: Date;
}
export declare const Budget: mongoose.Model<BudgetDocument, {}, {}, {}, Document<unknown, {}, BudgetDocument, {}, mongoose.DefaultSchemaOptions> & BudgetDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, BudgetDocument>;
//# sourceMappingURL=Budget.d.ts.map