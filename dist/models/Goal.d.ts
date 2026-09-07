import mongoose, { Document } from "mongoose";
export interface GoalDocument extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    targetAmount: number;
    targetDate: string;
    saved: number;
    createdAt: Date;
}
export declare const Goal: mongoose.Model<GoalDocument, {}, {}, {}, Document<unknown, {}, GoalDocument, {}, mongoose.DefaultSchemaOptions> & GoalDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, GoalDocument>;
//# sourceMappingURL=Goal.d.ts.map