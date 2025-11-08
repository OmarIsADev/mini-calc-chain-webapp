import {
  type Document,
  type Model,
  model,
  models,
  Schema,
  type Types,
} from "mongoose";
import type { IChain } from "./Chain";

export interface IUser extends Document {
  username: string;
  password: string;
  chains: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPopulatedUser extends Omit<IUser, "chains"> {
  chains: IChain[];
}

const userSchema: Schema<IUser> = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  chains: [{ type: Schema.Types.ObjectId, ref: "Chain" }],
});

// export const User = model<IUser>("User", userSchema);
export const User =
  (models.User as unknown as Model<IUser>) || model<IUser>("User", userSchema);
