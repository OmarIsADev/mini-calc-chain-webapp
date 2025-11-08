import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  await connectMongoDB();

  const id = req.headers.get("_id");

  const user = await User.findById(id);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user });
}
