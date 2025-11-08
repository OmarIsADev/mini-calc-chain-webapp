import connectMongoDB from "@/lib/db";
import { User } from "@/models/User";
import { hash } from "bcrypt";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";

const saltRounds = 10;

export async function POST(req: NextRequest) {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("JWT secret not found");
  }

  await connectMongoDB();

  const formData = await req.formData();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (username.length < 3 || password.length < 10) {
    return NextResponse.json(
      { error: "username or password are too short" },
      { status: 400 }
    );
  }

  const user = await User.findOne({ username });

  if (user) {
    return NextResponse.json(
      { error: "username already exists" },
      { status: 400 }
    );
  }

  const hashedPassword = await hash(password, saltRounds);

  const newUser = await User.create({ username, password: hashedPassword });

  const token = jwt.sign({ _id: newUser._id }, secret);

  const serilized = serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json(
    { message: "Signup successful" },
    { status: 201, headers: { "Set-Cookie": serilized } }
  );
}
