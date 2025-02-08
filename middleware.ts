import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers
const isPublicPath = createRouteMatcher([
  "/login",
  "/sign-up",
  "/reset-password",
  "/recovery-password",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const isPublic = isPublicPath(req);
  const isAdmin = isAdminRoute(req);
  const isWebhookPath = req.url.includes("/api/webhooks");
  const isWebhookStripe = req.url.includes("/api/webhook");
  const isHomePage = req.nextUrl.pathname === "/";

  // Handle homepage redirect for authenticated users
  if (isHomePage && userId) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow public paths and webhook paths without authentication
  if (isPublic || isWebhookPath || isHomePage || isWebhookStripe) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!userId) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("returnTo", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Handle admin routes
  if (isAdmin) {
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
      console.error("[ADMIN_AUTH_ERROR]", error);
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
});

// Specify which routes the middleware should run on
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
