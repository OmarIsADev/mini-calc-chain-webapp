/** biome-ignore-all lint/style/noNonNullAssertion: User always exists */
import type { Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/db";
import { Chain, type IOperation, Operation } from "@/models/Chain";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  await connectMongoDB();

  const formData = await req.formData();
  const id = req.headers.get("_id");
  const base = formData.get("base");

  if (!base || Number.isNaN(base as string)) {
    return NextResponse.json({ error: "Base is required" }, { status: 400 });
  }

  const chain = await Chain.create({
    author: id,
    base: Number(base),
  });

  await chain.save();

  const user = await User.findById(id);

  user!.chains.push(chain._id);
  await user!.save();

  return NextResponse.json(chain);
}
