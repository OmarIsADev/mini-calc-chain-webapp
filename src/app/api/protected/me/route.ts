import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/db";
import { User } from "@/models/User";
import { serialize } from "cookie";

export async function GET(req: NextRequest) {
  await connectMongoDB();

  const id = req.headers.get("_id");

  const user = await User.findById(id);
  if (!user) {
    const serilized = serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
    return NextResponse.json(
      { error: "User not found" },
      { status: 404, headers: { "Set-Cookie": serilized } },
    );
  }

  return NextResponse.json({ user });
}
