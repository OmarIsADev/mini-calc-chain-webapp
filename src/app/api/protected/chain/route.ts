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

  return NextResponse.json(await chain.populate("author"));
}

export async function DELETE(req: NextRequest) {
  await connectMongoDB();

  const searchParams = req.nextUrl.searchParams;
  const chainId = searchParams.get("id");
  const id = req.headers.get("_id");

  if (!chainId) {
    return NextResponse.json(
      { error: "Chain ID is required" },
      { status: 400 },
    );
  }

  const chain = await Chain.findById(chainId);

  if (!chain) {
    return NextResponse.json({ error: "Chain not found" }, { status: 404 });
  }

  if (chain.author.toString() !== id) {
    return NextResponse.json(
      { error: "You are not the author of this chain" },
      { status: 403 },
    );
  }

  await Chain.findByIdAndDelete(chainId);

  const user = await User.findById(id);

  user!.chains = user!.chains.filter((chain) => chain.toString() !== chainId);
  await user!.save();

  return NextResponse.json({ message: "Chain deleted" });
}
