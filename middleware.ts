import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers
const isPublicPath = createRouteMatcher([
  "/",
  "/login",
  "/sign-up",
  "/reset-password",
  "/recovery-password",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const isPublic = isPublicPath(req);
  const isAdmin = isAdminRoute(req);
  const isWebhookPath = req.url.includes("/api/webhooks");

  // Allow public paths and webhook paths without authentication
  if (isPublic || isWebhookPath) {
    return NextResponse.next();
  }

  // Handle admin routes
  if (isAdmin) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      });

      if (!response.ok) {
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }

      const user = await response.json();
      if (!user.currentTier?.name?.toLowerCase().includes("admin")) {
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }
    } catch (error) {
      console.error("[ADMIN_MIDDLEWARE_ERROR]", error);
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // Protect all other routes
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
    // Always run for API routes
    "/api/(.*)",
  ],
};
