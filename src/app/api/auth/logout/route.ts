import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function GET() {
  const serilized = serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json(
    { message: "logged out" },
    { status: 200, headers: { "Set-Cookie": serilized } }
  );
}
