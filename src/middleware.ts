import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    const res = NextResponse.next();
    res.headers.set("x-pathname", request.nextUrl.pathname);

    return res;
  },
  {
    pages: {
      signIn: "/login", // Where to redirect unauthenticated users
    },
  },
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/pages/:path*",
    "/api/pages/:path*",
    "/api/links/:path*",
    "/api/uploads/:path*",
    "/api/templates/:path*",
    "/api/forms/:path*",
  ],
};
