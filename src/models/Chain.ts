import mongoose, { type Document, Schema, type Types } from "mongoose";
import type { IPopulatedUser } from "./User";

export interface IOperation extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  createdAt: Date;
  base: `${"+" | "-" | "*" | "/"} ${number}`;
  operations: Types.ObjectId[];
}

export interface IPopulatedOperation
  extends Omit<IOperation, "author" | "operations"> {
  author: IPopulatedUser;
  operations: IPopulatedOperation[];
}

export interface IChain extends Document {
  _id: Types.ObjectId;
  base: number;
  createdAt: Date;
  author: Types.ObjectId;
  operations: Types.ObjectId[] | IOperation[];
}

export interface IPopulatedChain extends Omit<IChain, "author" | "operations"> {
  author: IPopulatedUser;
  operations: IPopulatedOperation[];
}

const operationSchema: Schema<IOperation> = new Schema<IOperation>({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  base: {
    type: String,
    required: true,
  },
  operations: [{ type: Schema.Types.ObjectId, ref: "Operation" }],
});

const chainSchema: Schema<IChain> = new Schema<IChain>({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  base: {
    type: Number,
    required: true,
  },
  operations: [{ type: Schema.Types.ObjectId, ref: "Operation" }],
});

export const Chain = mongoose.model<IChain>("Chain", chainSchema);
export const Operation = mongoose.model<IOperation>(
  "Operation",
  operationSchema
);
