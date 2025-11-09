import connectMongoDB from "@/lib/db";
import { Chain, type IOperation, Operation } from "@/models/Chain";
import type { Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import "@/models/User";

async function deepPopulateOperations(
  operations: Types.ObjectId[]
): Promise<IOperation[]> {
  if (!operations || operations.length === 0) {
    return [];
  }

  const docs = (await Operation.find({
    _id: { $in: operations },
  })
    .populate("author")
    .exec()) as IOperation[];

  const populatedDocs = await Promise.all(
    docs.map(async (doc) => {
      const plainDoc = doc.toObject({ getters: true }) as IOperation;

      if (plainDoc.operations && plainDoc.operations.length > 0) {
        plainDoc.operations = await deepPopulateOperations(
          plainDoc.operations as Types.ObjectId[]
        );
      }

      return plainDoc;
    })
  );

  return populatedDocs;
}

export async function GET(req: NextRequest) {
  await connectMongoDB();

  const searchParams = req.nextUrl.searchParams;
  const authorId = searchParams.get("authorId");
  const chainId = searchParams.get("chainId");

  if (authorId) {
    const chains = await Chain.find({ author: authorId });
    if (!chains || chains.length === 0)
      return NextResponse.json({ error: "Chains not found" }, { status: 404 });

    return NextResponse.json(chains);
  }

  if (chainId) {
    const chain = await Chain.findById(chainId);
    if (!chain)
      return NextResponse.json({ error: "Chain not found" }, { status: 404 });

    return NextResponse.json(chain);
  }

  const chains = await Chain.find();

  const populationPromises = chains.map(async (chain) => {
    const populatedChain = await chain.populate("author");

    const plainChain = populatedChain.toObject({ getters: true });

    if (plainChain.operations && plainChain.operations.length > 0) {
      plainChain.operations = await deepPopulateOperations(
        plainChain.operations as Types.ObjectId[]
      );
    }

    return plainChain;
  });

  const populatedChains = await Promise.all(populationPromises);

  return NextResponse.json(populatedChains);
}
