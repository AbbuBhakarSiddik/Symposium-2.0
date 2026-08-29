import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = (req.nextauth.token as any)?.role;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && role !== "admin") {
      if (role === "coordinator") {
        return NextResponse.redirect(new URL("/coordinators", req.url));
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/coordinators") && role !== "admin" && role !== "coordinator") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/coordinators/:path*"],
};

