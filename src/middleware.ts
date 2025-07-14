import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "./env";

// Utility to set a flash message in a cookie
const setFlashError = (res: NextResponse, message: string) => {
  res.cookies.set("flash_error", message, {
    maxAge: 5, // 5 seconds
    path: "/",
    httpOnly: false,
  });
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: env.AUTH_SECRET });
  console.log("Middleware token:", token);
  console.log("Cookies available in middleware:", request.cookies.getAll());
  console.log("ENV.AUTH_SECRET:", env.AUTH_SECRET);
  // Redirect /auth and /auth/login to /auth/signin
  if (pathname === "/auth" || pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // If logged in, block access to /auth/signin
  if (token && pathname === "/auth/signin") {
    const res = NextResponse.redirect(new URL("/", request.url));
    setFlashError(res, "You are already logged in.");
    return res;
  }

  // If not logged in, block access to /play
  if (!token && pathname === "/play") {
    const res = NextResponse.redirect(new URL("/auth/signin", request.url));
    setFlashError(res, "Please login to access this page.");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth", "/auth/:path*", "/play"],
};
