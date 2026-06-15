import { NextResponse } from "next/server";

import { auth, getRoleHomePath } from "@/auth";

const publicRoutes = ["/login", "/register"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(
      new URL(getRoleHomePath(role!), req.nextUrl),
    );
  }

  if (!isLoggedIn && !isPublicRoute && pathname !== "/") {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && pathname === "/") {
    return NextResponse.redirect(
      new URL(getRoleHomePath(role!), req.nextUrl),
    );
  }

  if (isLoggedIn && role === "DIETITIAN" && pathname.startsWith("/client")) {
    return NextResponse.redirect(new URL("/dietitian", req.nextUrl));
  }

  if (isLoggedIn && role === "CLIENT" && pathname.startsWith("/dietitian")) {
    return NextResponse.redirect(new URL("/client", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-.*|swe-worker-.*).*)",
  ],
};
