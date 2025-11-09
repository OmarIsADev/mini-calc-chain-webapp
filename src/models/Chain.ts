import mongoose, { type Document, Schema, type Types } from "mongoose";
import type { IPopulatedUser } from "./User";

export interface IOperation extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  base: `${"+" | "-" | "*" | "/"} ${number}`;
  operations: Types.ObjectId[] | IOperation[];
}

export interface IPopulatedOperation
  extends Omit<IOperation, "author" | "operations" | "_id"> {
  _id: string;
  author: IPopulatedUser;
  operations: IPopulatedOperation[];
}

export interface IChain extends Document {
  _id: Types.ObjectId;
  base: number;
  createdAt: Date;
  updatedAt: Date;
  author: Types.ObjectId;
  operations: Types.ObjectId[] | IOperation[];
}

export interface IPopulatedChain
  extends Omit<IChain, "author" | "operations" | "_id"> {
  _id: string;
  author: IPopulatedUser;
  operations: IPopulatedOperation[];
}

const operationSchema: Schema<IOperation> = new Schema<IOperation>(
  {
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
  },
  { timestamps: true },
);

const chainSchema: Schema<IChain> = new Schema<IChain>(
  {
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
  },
  { timestamps: true },
);

export const Chain =
  (mongoose.models.Chain as mongoose.Model<IChain>) ||
  mongoose.model<IChain>("Chain", chainSchema);
export const Operation =
  (mongoose.models.Operation as mongoose.Model<IOperation>) ||
  mongoose.model<IOperation>("Operation", operationSchema);
