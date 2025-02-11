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

// Admin tier ID constant
const ADMIN_TIER_ID = "550e8400-e29b-41d4-a716-446655440003";

export default clerkMiddleware(async (auth, req) => {
  const { userId, getToken } = await auth();
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
      const sessionToken = await getToken();

      if (!sessionToken) {
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }

      const response = await fetch(
        `${process.env.BACKEND_URL}/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }

      const responseData = await response.json();

      const { data: user } = responseData;

      if (user?.currentTierId !== ADMIN_TIER_ID) {
        console.log("[ADMIN_CHECK] User is not admin, redirecting");
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }
    } catch (error) {
      console.error("[ADMIN_AUTH_ERROR] Full error:", error);
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
