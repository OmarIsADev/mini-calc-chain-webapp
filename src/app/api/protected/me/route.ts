import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  await connectMongoDB();

  // biome-ignore lint/style/noNonNullAssertion: middleware verifies token
  const token = req.cookies.get("token")!.value;

  try {
    const decoded = jwt.decode(token) as { _id: string };

    const user = await User.findById(decoded._id);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ error }, { status: 500 });
  }
}
