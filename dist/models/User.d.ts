import mongoose, { Document } from "mongoose";
export interface UserDocument extends Document {
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}
export declare const User: mongoose.Model<UserDocument, {}, {}, {}, Document<unknown, {}, UserDocument, {}, mongoose.DefaultSchemaOptions> & UserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, UserDocument>;
//# sourceMappingURL=User.d.ts.map