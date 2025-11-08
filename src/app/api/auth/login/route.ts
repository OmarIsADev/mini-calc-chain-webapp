import { compare } from "bcrypt";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("JWT secret not found");
  }

  await connectMongoDB();
  const formData = await req.formData();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  console.log(username, password);

  if (!username || !password)
    return NextResponse.json(
      { error: "Missing username or password" },
      { status: 400 }
    );

  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  const isPasswordValid = await compare(password, user.password);

  if (!isPasswordValid) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  const token = jwt.sign({ _id: user._id }, secret);

  const serilized = serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json(
    {
      message: "Login successful",
    },
    { status: 200, headers: { "Set-Cookie": serilized } }
  );
}
