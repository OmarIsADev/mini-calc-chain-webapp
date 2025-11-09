import { serialize } from "cookie";
import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const requestHeaders = new Headers(request.headers);

  const url = request.nextUrl.clone();

  if (
    (url.pathname.startsWith("/login") || url.pathname.startsWith("/signup")) &&
    token
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (url.pathname.startsWith("/api/protected")) {
    const JWT_SECRET = process.env.JWT_SECRET_KEY;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { payload } = (await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET),
      )) as { payload: { _id: string } };

      console.log("token verified");

      requestHeaders.set("_id", payload._id);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.log(error);

      const serilized = serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });

      return NextResponse.json(
        { error: "Token expired" },
        { status: 401, headers: { "Set-Cookie": serilized } },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*", "/api/protected/:path*"],
};
