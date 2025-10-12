import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Role-based protection
  if (pathname.startsWith("/dashboard/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard/" + token.role, req.url));
  }

  if (pathname.startsWith("/dashboard/seller") && token.role !== "seller") {
    return NextResponse.redirect(new URL("/dashboard/" + token.role, req.url));
  }

  if (pathname.startsWith("/dashboard/buyer") && token.role !== "buyer") {
    return NextResponse.redirect(new URL("/dashboard/" + token.role, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
