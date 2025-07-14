// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    // @ts-expect-error trustHost is supported on edge
    trustHost: true,
  });

  console.log("Middleware token:", token);

  const { pathname } = request.nextUrl;

  // Redirect already signed-in user from /auth/signin to home
  if (token && pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect /play route
  if (!token && pathname === "/play") {
    const res = NextResponse.redirect(new URL("/auth/signin", request.url));
    res.cookies.set("flash_error", "Please login to access this page.", {
      maxAge: 5,
      path: "/",
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth", "/auth/:path*", "/play"],
};
