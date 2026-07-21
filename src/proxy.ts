import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const rawSecret = process.env.AUTH_SECRET;
if (!rawSecret || rawSecret.length < 32) {
  throw new Error("AUTH_SECRET must be set to a strong random value (>=32 chars)");
}
const secret = new TextEncoder().encode(rawSecret);

export const config = {
  matcher: ["/admin/:path*"],
};

export async function proxy(request: NextRequest) {
  // Only protect /admin routes, allow /admin/login
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}
