import type { Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { Chain, Operation } from "@/models/Chain";

export async function POST(req: NextRequest) {
  const _id = req.headers.get("_id");
  const formData = await req.formData();

  const operation = formData.get("operation");
  const chainId = formData.get("chainId");
  const parentOperationId = formData.get("parentOperationId");

  console.log(parentOperationId);

  if (!operation)
    return NextResponse.json(
      { error: "Operation is required" },
      { status: 400 }
    );

  const newOperation = await Operation.create({
    author: _id,
    base: operation,
  });

  if (parentOperationId) {
    const parentOperation = await Operation.findById(parentOperationId);

    console.log("called");

    if (!parentOperation)
      return NextResponse.json(
        { error: "Parent operation not found" },
        { status: 404 }
      );

    (parentOperation.operations as Types.ObjectId[]).push(newOperation._id);
    await parentOperation.save();
  } else {
    const chain = await Chain.findById(chainId);

    if (!chain)
      return NextResponse.json({ error: "Chain not found" }, { status: 404 });

    (chain.operations as Types.ObjectId[]).push(newOperation._id);
    await chain.save();
  }

  return NextResponse.json(await newOperation.populate("author"));
}
