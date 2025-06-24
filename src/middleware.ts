import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/utils/rate-limit";

const AUTH_PROTECTED_PATHS = [
  "/admin/:path*",
  "/pages/:path*",
  "/api/pages/:path*",
  "/api/links/:path*",
  "/api/uploads/:path*",
  "/api/templates/:path*",
  "/api/forms/:path*",
];

// Auth-protected routes
export const authMiddleware = withAuth(
  function authMiddleware(req) {
    const res = NextResponse.next();
    res.headers.set("x-pathname", req.nextUrl.pathname);
    return res;
  },
  {
    pages: {
      signIn: "/login",
    },
  },
);

// Public/custom-domain logic (outside of auth paths)
export async function customDomainMiddleware(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase();
  if (!host) return NextResponse.next();

  // Skip if it's your main domain
  const mainDomain = process.env.MAIN_DOMAIN?.toLowerCase();
  if (host === mainDomain) {
    return NextResponse.next();
  }

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/api/public/domain/${host}`;

  try {
    const resDomain = await fetch(url);
    if (resDomain.status === 404) return NextResponse.next();

    const domain = await resDomain.json();
    if (domain?.verified) {
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = `/${domain.slug}`;
      return NextResponse.rewrite(rewriteUrl);
    }
  } catch {
    // Fallback
  }

  return NextResponse.next();
}

// Entry point for all requests
export default async function middleware(
  req: NextRequestWithAuth,
  event: NextFetchEvent,
) {
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown";

  const { success, retryAfter } = checkRateLimit(ip);

  if (!success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
      },
    });
  }
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  let isAuthRoute = false;
  // If matches auth-protected route, run withAuth
  for (const path of AUTH_PROTECTED_PATHS) {
    const regex = new RegExp("^" + path.replace(":path*", ".*") + "$");
    if (regex.test(pathname)) {
      isAuthRoute = true;
      break;
    }
  }
  if (isAuthRoute) {
    return authMiddleware(req, event);
  } else if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  } else {
    return customDomainMiddleware(req);
  }
}

export const config = {
  matcher: ["/:path*"], // Match all routes
};
